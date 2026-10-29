import { NextResponse } from "next/server";
import { runIndexerTick } from "@/lib/indexer-tick";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await runIndexerTick();
  return NextResponse.json(result);
}
