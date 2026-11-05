import { cancel } from "@/lib/push";

export async function POST(request: Request) {
  const { id } = ((await request.json().catch(() => ({}))) ?? {}) as { id?: string };
  if (typeof id === "string") await cancel(id);
  return Response.json({ ok: true });
}
