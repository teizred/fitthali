import type { PushSubscription } from "web-push";
import { pushReady, schedule } from "@/lib/push";
import { errorResponse } from "@/lib/ai";

type Body = { subscription?: PushSubscription; at?: number; title?: string; body?: string };

export async function POST(request: Request) {
  if (!pushReady) return Response.json({ error: "Clés VAPID manquantes" }, { status: 503 });
  const { subscription, at, title, body } = ((await request.json().catch(() => ({}))) ?? {}) as Body;
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth || typeof at !== "number") {
    return Response.json({ error: "Paramètres manquants" }, { status: 400 });
  }
  try {
    const id = await schedule(
      { subscription, title: String(title ?? "FitThali").slice(0, 100), body: String(body ?? "").slice(0, 300) },
      at,
      new URL(request.url).origin,
    );
    return Response.json({ id });
  } catch (err) {
    return errorResponse(err);
  }
}
