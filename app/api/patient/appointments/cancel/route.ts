export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

interface Body {
  appointment_id: string;
}

export async function PATCH(req: Request) {
  try {
    const body: Body = await req.json();
    const { appointment_id } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { message: "appointment_id is required" },
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

    // 🔥 VERIFY APPOINTMENT (NO JOIN)
    const { data: appointment, error: appointmentError } =
      await dbClient.client
        .from("appointments")
        .select(`
          id,
          patient_id,
          status,
          slot_id
        `)
        .eq("id", appointment_id)
        .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // ❌ Not owner
    if (appointment.patient_id !== patient_id) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    // ❌ Already cancelled
    if (appointment.status === "CANCELLED_BY_PATIENT" || appointment.status === "CANCELLED_BY_DOCTOR") {
      return NextResponse.json(
        { message: "Already cancelled" },
        { status: 400 }
      );
    }

    // 🔥 FETCH SLOT DIRECTLY (FIXED)
    const { data: slot, error: slotError } =
      await dbClient.client
        .from("doctor_slots")
        .select("start_time")
        .eq("id", appointment.slot_id)
        .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { message: "Slot not found" },
        { status: 404 }
      );
    }

    const slotStart = new Date(slot.start_time);
    const now = new Date();

    // ❌ Past appointment
    if (slotStart < now) {
      return NextResponse.json(
        { message: "Cannot cancel past appointment" },
        { status: 400 }
      );
    }

    // 🔥 STEP 1: CANCEL APPOINTMENT
    const { error: cancelError } = await dbClient.client
      .from("appointments")
      .update({
        status: "CANCELLED_BY_PATIENT",
      })
      .eq("id", appointment_id);

    if (cancelError) {
      return NextResponse.json(
        { message: cancelError.message },
        { status: 500 }
      );
    }

    // 🔥 STEP 2: UNLOCK SLOT
    const { error: unlockError } = await dbClient.client
      .from("doctor_slots")
      .update({ is_booked: false })
      .eq("id", appointment.slot_id);

    if (unlockError) {
      return NextResponse.json(
        { message: "Failed to unlock slot" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Appointment cancelled successfully",
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