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

    const doctor_id = user.id;

    // 🔥 FETCH APPOINTMENT
    const { data: appointment, error: appointmentError } =
      await dbClient.client
        .from("appointments")
        .select("id, doctor_id, status")
        .eq("id", appointment_id)
        .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // ❌ Not doctor owner
    if (appointment.doctor_id !== doctor_id) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    // ❌ Already cancelled
    if (
      appointment.status === "CANCELLED_BY_DOCTOR" ||
      appointment.status === "CANCELLED_BY_PATIENT"
    ) {
      return NextResponse.json(
        { message: "Already cancelled" },
        { status: 400 }
      );
    }

    // 🔥 CANCEL (DOCTOR)
    const { error } = await dbClient.client
      .from("appointments")
      .update({
        status: "CANCELLED_BY_DOCTOR",
      })
      .eq("id", appointment_id);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Appointment cancelled by doctor" },
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