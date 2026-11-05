import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingKeyError();
  return (client ??= new Anthropic());
}

export class MissingKeyError extends Error {
  constructor() {
    super("Clé API manquante : ajoute ANTHROPIC_API_KEY dans .env.local puis relance le serveur.");
  }
}

export const FoodItems = z.object({
  items: z.array(
    z.object({
      name: z.string().describe("Nom en français, avec le nom tamoul/cingalais entre parenthèses si pertinent"),
      portion: z.string().describe("Portion estimée en langage courant, ex: '3 idlis', '1 assiette'"),
      grams: z.number(),
      kcal: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fiber: z.number(),
    }),
  ),
  confidence: z.enum(["faible", "moyenne", "élevée"]),
  notes: z.string().describe("Hypothèses faites (huile, lait de coco, taille de portion) en une ou deux phrases"),
});

const FOOD_SYSTEM = `Tu es un nutritionniste expert, spécialiste de la cuisine tamoule sri-lankaise (Jaffna, Colombo) et sud-indienne, mais aussi de la cuisine française et internationale.
Ta tâche : identifier chaque aliment d'un repas et estimer précisément son poids et ses macronutriments.
- Décompose les assiettes : riz, chaque curry, sambol, papadam, etc. comme des éléments séparés.
- Estime les portions à partir des repères visuels (taille de l'assiette, des mains, des couverts, feuille de bananier).
- Tiens compte des matières grasses cachées typiques : lait de coco, huile de coco, ghee, friture.
- Les valeurs sont celles de la portion entière (pas pour 100 g).
- Si l'utilisateur précise quelque chose dans sa note, cela prime sur ce que tu vois.
Réponds en français.`;

export async function analyzeMeal(content: Anthropic.ContentBlockParam[]) {
  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: FOOD_SYSTEM,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(FoodItems) },
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new Error("L'IA a refusé d'analyser cette demande.");
  if (!response.parsed_output) throw new Error("Réponse de l'IA illisible, réessaie.");
  return response.parsed_output;
}

const REPORT_SYSTEM = `Tu es le coach nutrition et musculation personnel de l'utilisateur. Il est d'origine tamoule sri-lankaise / sud-indienne et mange beaucoup de cuisine de son pays : tes conseils doivent utiliser ces plats (ex : remplacer un parotta par des idlis, ajouter du dal, du poisson, de l'oeuf, réduire le lait de coco épais, etc.).
Rédige en français, en Markdown simple (titres ##, listes à puces, **gras**), ton direct et motivant, sans blabla.
Structure : ## Bilan en chiffres (moyennes vs objectifs, écarts en %), ## Points forts, ## À améliorer, ## Entraînement (volume, régularité, lien avec la nutrition), ## Plan pour la suite (3 à 5 actions concrètes et mesurables).
Base-toi uniquement sur les données fournies ; si des jours ne sont pas renseignés, dis-le au lieu d'inventer.`;

export async function writeReport(periodLabel: string, stats: unknown, profile: unknown) {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: REPORT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Fais-moi le compte rendu de la période : ${periodLabel}.\n\nProfil et objectifs :\n${JSON.stringify(profile, null, 2)}\n\nDonnées :\n${JSON.stringify(stats, null, 2)}`,
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("L'IA a refusé de générer ce rapport.");
  return response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

export function errorResponse(err: unknown) {
  console.error(err);
  const json = (error: string, status: number) => Response.json({ error }, { status });
  if (err instanceof MissingKeyError) return json(err.message, 503);
  if (err instanceof Anthropic.AuthenticationError) return json("Clé API Anthropic invalide (ANTHROPIC_API_KEY).", 401);
  if (err instanceof Anthropic.RateLimitError) return json("Trop de requêtes, réessaie dans un instant.", 429);
  if (err instanceof Anthropic.APIError) return json(`Erreur API (${err.status}) : ${err.message}`, 502);
  return json(err instanceof Error ? err.message : "Erreur serveur", 500);
}
