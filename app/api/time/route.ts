export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    return NextResponse.json(
      {
        now: now.toISOString(), // 🔥 UTC time (important)
        timestamp: now.getTime(), // optional (ms)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error getting time" },
      { status: 500 }
    );
  }
}