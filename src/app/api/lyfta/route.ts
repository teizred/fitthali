// Cherche l'illustration d'un exercice dans le catalogue Lyfta (API personnelle, clé côté serveur).
// Usage perso : on renvoie seulement l'URL de l'image, rien n'est copié ni stocké.
type Result = { name: string; image_name: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Variantes de recherche : nom complet, sans suffixe « - ... » / parenthèses, au singulier,
 *  puis avec le vocabulaire Lyfta (« Lever » pour les machines, « Smith » sans « Machine »). */
function variants(name: string) {
  const base = name.replace(/\(.*?\)/g, "").split(" - ")[0].replace(/\s+/g, " ").trim();
  const singular = base.replace(/(\w{3,})s\b$/i, "$1");
  const lyftaWords = singular
    .replace(/^Smith Machine\b/i, "Smith")
    .replace(/^(Leverage|Machine)\b/i, "Lever")
    .replace(/\bStairmaster\b/i, "Stair Climber");
  return [...new Set([name.trim(), base, singular, lyftaWords])].filter(Boolean).slice(0, 4);
}

// Préfixes de matériel que Lyfta ajoute souvent devant le nom (« Lever Preacher Curl »).
const EQUIP = /^(lever|cable|barbell|dumbbell|machine|smith|kettlebell|ez barbell|weighted|band) /;

/** Résultat fiable uniquement : nom identique, ou identique au préfixe de matériel près.
 *  Mieux vaut pas d'image qu'une image d'un autre exercice. */
function pick(results: Result[], query: string) {
  const q = norm(query).replace(EQUIP, "");
  return (
    results.find((r) => norm(r.name) === norm(query)) ??
    results.find((r) => norm(r.name).replace(EQUIP, "") === q)
  );
}

export async function POST(request: Request) {
  const key = process.env.LYFTA_API_KEY;
  if (!key) return Response.json({ error: "LYFTA_API_KEY manquante" }, { status: 503 });
  const { name } = ((await request.json().catch(() => ({}))) ?? {}) as { name?: string };
  if (typeof name !== "string" || !name.trim() || name.length > 120) return Response.json({ error: "Nom invalide" }, { status: 400 });

  for (const q of variants(name)) {
    const url = `https://my.lyfta.app/api/v1/exercises/library?search=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } }).catch(() => null);
    if (!res) return Response.json({ error: "Lyfta injoignable" }, { status: 502 });
    if (res.status === 401 || res.status === 403) return Response.json({ error: "Clé Lyfta invalide" }, { status: 502 });
    if (res.status === 429) return Response.json({ error: "Quota Lyfta atteint" }, { status: 429 });
    if (!res.ok) continue;
    const data = (await res.json().catch(() => null)) as { data?: { results?: Result[] } } | null;
    const best = pick(data?.data?.results ?? [], q);
    if (best?.image_name) {
      const img = new URL(best.image_name);
      if (img.protocol === "https:" && img.hostname.endsWith("apilyfta.com")) {
        return Response.json({ image: img.href, name: best.name });
      }
    }
  }
  return Response.json({ image: null });
}
