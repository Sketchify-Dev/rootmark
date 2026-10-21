import { connection, NextResponse } from "next/server";
import { buildProof } from "@/lib/api/queries";

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
  const proof = await buildProof(numeric);
  if (!proof) {
    return NextResponse.json({ error: `No indexed event with id ${numeric}.` }, { status: 404 });
  }
  return NextResponse.json(proof);
}
