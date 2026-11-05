import { NextResponse, type NextRequest } from "next/server";

// Protège les routes API (qui consomment ta clé Anthropic) par un code d'accès.
// Si APP_CODE n'est pas défini (dev local), tout est ouvert.
export function proxy(request: NextRequest) {
  const code = process.env.APP_CODE;
  // /api/push/key : clé publique ; /api/push/send : appelé par QStash, vérifié par signature.
  const open = ["/api/push/key", "/api/push/send"];
  if (!code || open.includes(request.nextUrl.pathname)) return NextResponse.next();
  if (request.headers.get("x-app-code") !== code) {
    return NextResponse.json({ error: "Code d'accès invalide : renseigne-le dans Réglages." }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
