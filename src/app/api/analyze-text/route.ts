import { analyzeMeal, errorResponse } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string };
    if (!text?.trim()) return Response.json({ error: "Description vide" }, { status: 400 });
    return Response.json(await analyzeMeal([{ type: "text", text: `Voici ce que j'ai mangé : ${text}` }]));
  } catch (err) {
    return errorResponse(err);
  }
}
