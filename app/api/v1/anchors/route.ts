import { connection, NextResponse } from "next/server";
import { listAnchorBatches } from "@/lib/api/queries";

export async function GET(request: Request) {
  await connection();
  const raw = new URL(request.url).searchParams.get("limit");
  const limit = raw ? Number(raw) : 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return NextResponse.json(
      { error: "limit must be an integer between 1 and 500." },
      { status: 400 },
    );
  }
  return NextResponse.json({ items: listAnchorBatches(limit) });
}
