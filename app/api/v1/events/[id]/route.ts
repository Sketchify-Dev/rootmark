import { connection, NextResponse } from "next/server";
import { getEvent } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return NextResponse.json({ error: "Event id must be a positive integer." }, { status: 400 });
  }
  const event = getEvent(numeric);
  if (!event) {
    return NextResponse.json({ error: `No indexed event with id ${numeric}.` }, { status: 404 });
  }
  return NextResponse.json(event);
}
