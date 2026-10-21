import { connection, NextResponse } from "next/server";
import { runQuery, parseEventQuery, ValidationError } from "@/lib/api/queries";

export async function GET(request: Request) {
  await connection();
  try {
    const params = new URL(request.url).searchParams;
    const query = parseEventQuery(params);
    const result = runQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "The event query could not be completed." },
      { status: 500 },
    );
  }
}
