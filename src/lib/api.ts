"use client";

export type AiItem = {
  name: string;
  portion: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};
export type AiResult = { items: AiItem[]; confidence: string; notes: string };

const CODE_KEY = "fitthali:code";
export function getAccessCode() {
  try {
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
}
export function setAccessCode(code: string) {
  try {
    localStorage.setItem(CODE_KEY, code.trim());
  } catch {
    /* ignore */
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-code": getAccessCode() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data as T;
}

export const analyzePhoto = (image: string, mediaType: string, note: string) =>
  post<AiResult>("/api/analyze-photo", { image, mediaType, note });
export const analyzeText = (text: string) => post<AiResult>("/api/analyze-text", { text });
export const generateReport = (periodLabel: string, stats: unknown, profile: unknown) =>
  post<{ text: string }>("/api/report", { periodLabel, stats, profile });

/** Redimensionne la photo (max 1280 px, JPEG) pour réduire le coût et le temps d'envoi. */
export function compressImage(file: File, max = 1280): Promise<{ data: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/jpeg", 0.82);
      URL.revokeObjectURL(img.src);
      resolve({ data: url.split(",")[1], preview: url });
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = URL.createObjectURL(file);
  });
}

// ───────────── Illustrations Lyfta ─────────────
// v2 : ignore les anciens résultats (recherche moins précise). Valeur = URL, ou "none:<timestamp>".
const LYFTA_KEY = "fitthali:lyfta:v2";
const RETRY_AFTER = 24 * 60 * 60 * 1000; // un « introuvable » est retenté au bout de 24 h
function readLyfta(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LYFTA_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Illustrations Lyfta déjà trouvées (id d'exercice → URL), pour les miniatures. */
export function lyftaCache(): Record<string, string> {
  return Object.fromEntries(Object.entries(readLyfta()).filter(([, v]) => v.startsWith("http")));
}

/** URL de l'illustration Lyfta d'un exercice ("" = aucune). Mise en cache sur le téléphone. */
export async function lyftaImage(exId: string, searchName: string): Promise<string> {
  const hit = readLyfta()[exId];
  if (hit?.startsWith("http")) return hit;
  if (hit?.startsWith("none:") && Date.now() - Number(hit.slice(5)) < RETRY_AFTER) return "";
  const { image } = await post<{ image: string | null }>("/api/lyfta", { name: searchName });
  try {
    localStorage.setItem(LYFTA_KEY, JSON.stringify({ ...readLyfta(), [exId]: image || `none:${Date.now()}` }));
  } catch {
    /* ignore */
  }
  return image || "";
}

// ───────────── Notifications ─────────────
function b64ToUint8(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function enablePush(): Promise<PushSubscriptionJSON> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Notifications non supportées ici. Sur iPhone : Partager → « Sur l'écran d'accueil », puis ouvre l'app depuis l'icône.");
  }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permission refusée. Autorise les notifications dans les réglages du téléphone.");
  const reg = await navigator.serviceWorker.ready;
  const { key } = await fetch("/api/push/key").then((r) => r.json());
  if (!key) throw new Error("Le serveur n'a pas de clés VAPID configurées.");
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(key) }));
  return sub.toJSON();
}

export async function schedulePush(subscription: PushSubscriptionJSON, at: number, title: string, body: string) {
  try {
    const { id } = await post<{ id: string }>("/api/push/schedule", { subscription, at, title, body });
    return id;
  } catch (e) {
    console.warn("push:", (e as Error).message);
    return undefined;
  }
}
export function cancelPush(id?: string) {
  if (id) post("/api/push/cancel", { id }).catch(() => {});
}

export async function localNotify(title: string, body: string) {
  try {
    if (Notification.permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, { body, tag: "rest-timer", icon: "/icon-192.png" });
  } catch {
    /* pas de SW */
  }
}
