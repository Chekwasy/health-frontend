export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

interface Body {
  slot_id: string;
  reason: string;
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { slot_id, reason } = body;

    if (!slot_id || !reason) {
      return NextResponse.json(
        { message: "slot_id and reason are required" },
        { status: 400 }
      );
    }

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

    const patient_id = user.id;

    // 🔥 ensure PATIENT role
    const { data: profile } = await dbClient.client
      .from("profiles")
      .select("role, is_profile_complete")
      .eq("id", patient_id)
      .single();

    if (profile?.role !== "PATIENT") {
      return NextResponse.json(
        { message: "Only patients can book" },
        { status: 403 }
      );
    }

    if (!profile?.is_profile_complete) {
      return NextResponse.json(
        { message: "Complete profile first" },
        { status: 403 }
      );
    }

    // 🔍 FETCH SLOT
    const { data: slot, error: slotError } = await dbClient.client
      .from("doctor_slots")
      .select("*")
      .eq("id", slot_id)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { message: "Slot not found" },
        { status: 404 }
      );
    }

    // ❌ already booked
    if (slot.is_booked) {
      return NextResponse.json(
        { message: "Slot already booked" },
        { status: 400 }
      );
    }

    // ❌ prevent past booking
    const now = new Date();
    if (new Date(slot.start_time) < now) {
      return NextResponse.json(
        { message: "Cannot book past slot" },
        { status: 400 }
      );
    }
    
    // 🔥 STEP 1: CREATE APPOINTMENT
    const { data: appointment, error: appointmentError } =
      await dbClient.client
        .from("appointments")
        .insert([
          {
            doctor_id: slot.doctor_id,
            patient_id,
            slot_id,
            reason,
            status: "PENDING",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

    if (appointmentError) {
      return NextResponse.json(
        { message: appointmentError.message },
        { status: 500 }
      );
    }

    // 🔥 STEP 2: LOCK SLOT
    const { error: updateError } = await dbClient.client
      .from("doctor_slots")
      .update({ is_booked: true })
      .eq("id", slot_id);

    if (updateError) {
      return NextResponse.json(
        { message: "Failed to lock slot" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        appointment,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}