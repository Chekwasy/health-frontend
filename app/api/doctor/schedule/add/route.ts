export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

interface Block {
  start: string; // ISO string
  end: string;   // ISO string
}

interface Body {
  interval: 15 | 30 | 60;
  blocks: Block[];
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { interval, blocks } = body;

    // 🔐 AUTH
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: userError,
    } = await dbClient.client.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔥 CHECK ROLE
    const { data: profile } = await dbClient.client
      .from("profiles")
      .select("role, is_profile_complete")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only doctors allowed" },
        { status: 403 }
      );
    }

    if (!profile?.is_profile_complete) {
      return NextResponse.json(
        { message: "Complete profile first" },
        { status: 403 }
      );
    }

    // 🔥 VALIDATION
    if (![15, 30, 60].includes(interval)) {
      return NextResponse.json(
        { message: "Invalid interval" },
        { status: 400 }
      );
    }

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { message: "No schedule blocks provided" },
        { status: 400 }
      );
    }

    const now = new Date();
    const maxTime = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const slotsToInsert: any[] = [];

    for (const block of blocks) {
      const start = new Date(block.start);
      const end = new Date(block.end);

      // ❌ invalid range
      if (start >= end) {
        return NextResponse.json(
          { message: "Invalid time range" },
          { status: 400 }
        );
      }

      // ❌ past time
      if (start < now) {
        return NextResponse.json(
          { message: "Cannot schedule in the past" },
          { status: 400 }
        );
      }

      // ❌ beyond 72 hours
      if (end > maxTime) {
        return NextResponse.json(
          { message: "Schedule exceeds 72 hours window" },
          { status: 400 }
        );
      }

      // 🔥 GENERATE SLOTS
      let current = new Date(start);

      while (current < end) {
        const slotEnd = new Date(current.getTime() + interval * 60000);

        if (slotEnd > end) break;

        slotsToInsert.push({
          doctor_id: user.id,
          start_time: current.toISOString(),
          end_time: slotEnd.toISOString(),
          is_booked: false,
          created_at: new Date().toISOString(),
        });

        current = slotEnd;
      }
    }

    if (slotsToInsert.length === 0) {
      return NextResponse.json(
        { message: "No valid slots generated" },
        { status: 400 }
      );
    }

    // 🔥 INSERT INTO slots TABLE
    const { error } = await dbClient.client
      .from("doctor_slots")
      .insert(slotsToInsert);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Schedule created successfully",
      slots_created: slotsToInsert.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}