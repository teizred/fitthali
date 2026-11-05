import { receiver, sendPush, type PushPayload } from "@/lib/push";

// Appelé par QStash à la fin du repos. Protégé par la signature QStash (pas par APP_CODE).
export async function POST(request: Request) {
  if (!receiver) return Response.json({ error: "Clés de signature QStash manquantes" }, { status: 503 });
  const raw = await request.text();
  const ok = await receiver
    .verify({ signature: request.headers.get("upstash-signature") ?? "", body: raw, clockTolerance: 10 })
    .catch(() => false);
  if (!ok) return Response.json({ error: "Signature invalide" }, { status: 401 });

  try {
    await sendPush(JSON.parse(raw) as PushPayload);
  } catch (err) {
    // 404/410 = abonnement expiré : inutile que QStash réessaie.
    const status = (err as { statusCode?: number }).statusCode;
    console.error("push:", err);
    if (status === 404 || status === 410) return Response.json({ ok: false, expired: true });
    return Response.json({ error: "Envoi échoué" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
