import { connection, NextResponse } from "next/server";
import { contractReport } from "@/lib/api/contracts";

export async function GET() {
  await connection();
  try {
    return NextResponse.json(await contractReport());
  } catch {
    return NextResponse.json(
      { error: "The contract state could not be read from the chain." },
      { status: 500 },
    );
  }
}
