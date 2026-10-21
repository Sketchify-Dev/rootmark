import { connection, NextResponse } from "next/server";
import { health } from "@/lib/api/queries";

export async function GET() {
  await connection();
  try {
    return NextResponse.json(await health());
  } catch {
    return NextResponse.json(
      { error: "The chain health check could not be completed." },
      { status: 500 },
    );
  }
}
