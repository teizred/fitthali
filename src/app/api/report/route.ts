import { errorResponse, writeReport } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { periodLabel, stats, profile } = (await request.json()) as { periodLabel: string; stats: unknown; profile: unknown };
    return Response.json({ text: await writeReport(periodLabel, stats, profile) });
  } catch (err) {
    return errorResponse(err);
  }
}
