import "server-only";
import webpush, { type PushSubscription } from "web-push";
import { Client, Receiver } from "@upstash/qstash";

export const pushReady = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (pushReady) {
  // web-push exige une URL : on accepte aussi une simple adresse e-mail.
  const subject = (process.env.VAPID_SUBJECT || "admin@example.com").trim();
  webpush.setVapidDetails(/^(mailto:|https?:)/.test(subject) ? subject : `mailto:${subject}`, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
}

export type PushPayload = { subscription: PushSubscription; title: string; body: string };

export async function sendPush({ subscription, title, body }: PushPayload) {
  await webpush.sendNotification(subscription, JSON.stringify({ title, body, tag: "rest-timer" }), { TTL: 60, urgency: "high" });
}

// ── Mode QStash (Vercel / serverless) : QStash rappelle /api/push/send à l'heure voulue ──
const useQStash = Boolean(process.env.QSTASH_TOKEN);
const qstash = useQStash ? new Client({ token: process.env.QSTASH_TOKEN!, baseUrl: process.env.QSTASH_URL || undefined }) : null;

export const receiver =
  process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
    ? new Receiver({ currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY, nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY })
    : null;

// ── Mode mémoire (dev local / serveur Node permanent) ──
const g = globalThis as unknown as { __restTimers?: Map<string, ReturnType<typeof setTimeout>> };
const timers = (g.__restTimers ??= new Map());

const MAX_DELAY = 60 * 60 * 1000;

export async function schedule(payload: PushPayload, at: number, origin: string): Promise<string> {
  const delay = Math.max(0, Math.min(at - Date.now(), MAX_DELAY));
  if (qstash) {
    const { messageId } = await qstash.publishJSON({
      url: `${process.env.APP_URL || origin}/api/push/send`,
      body: payload,
      notBefore: Math.ceil((Date.now() + delay) / 1000), // secondes unix
      retries: 1,
    });
    return messageId;
  }
  const id = crypto.randomUUID();
  timers.set(
    id,
    setTimeout(async () => {
      timers.delete(id);
      try {
        await sendPush(payload);
      } catch (err) {
        console.error("push:", err);
      }
    }, delay),
  );
  return id;
}

export async function cancel(id: string) {
  if (qstash) {
    // Déjà livré ou inconnu : rien à faire.
    await qstash.messages.cancel(id).catch(() => {});
    return;
  }
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
}
