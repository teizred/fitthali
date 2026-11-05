import { connection } from "next/server";
import { pushReady } from "@/lib/push";

export async function GET() {
  await connection(); // lu à l'exécution, pas figé au build
  return Response.json({ key: pushReady ? process.env.VAPID_PUBLIC_KEY : null });
}
