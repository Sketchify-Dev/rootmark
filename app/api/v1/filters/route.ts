import { connection, NextResponse } from "next/server";
import { facets } from "@/lib/api/queries";

export async function GET() {
  await connection();
  return NextResponse.json(facets());
}
