import { analyzeMeal, errorResponse } from "@/lib/ai";

type Body = { image?: string; mediaType?: "image/jpeg" | "image/png" | "image/webp"; note?: string };

export async function POST(request: Request) {
  try {
    const { image, mediaType = "image/jpeg", note = "" } = (await request.json()) as Body;
    if (!image) return Response.json({ error: "Image manquante" }, { status: 400 });
    return Response.json(
      await analyzeMeal([
        { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
        { type: "text", text: `Analyse ce repas.${note ? ` Précision de l'utilisateur : ${note}` : ""}` },
      ]),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
