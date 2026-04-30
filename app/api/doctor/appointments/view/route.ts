export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 5;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

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

    // 🔥 ensure DOCTOR
    const { data: profile } = await dbClient.client
      .from("profiles")
      .select("role")
      .eq("id", doctor_id)
      .single();

    if (profile?.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only doctors allowed" },
        { status: 403 }
      );
    }

    // 🔥 FETCH APPOINTMENTS
    const { data: appointments, error, count } =
      await dbClient.client
        .from("appointments")
        .select(
          `
          id,
          reason,
          status,
          created_at,
          patient_id,

          patient:profiles!appointments_patient_id_fkey (
            first_name,
            last_name,
            phone
          ),

          slot:doctor_slots!appointments_slot_id_fkey (
            start_time,
            end_time
          )
        `,
          { count: "exact" }
        )
        .eq("doctor_id", doctor_id)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    // 🔥 FORMAT RESPONSE
    const formatted = (appointments || []).map((a: any) => ({
      id: a.id,
      reason: a.reason,
      status: a.status,
      created_at: a.created_at,

      patient: a.patient
        ? {
            name: `${a.patient.first_name} ${a.patient.last_name}`,
            phone: a.patient.phone,
          }
        : null,

      slot: a.slot?.[0]
        ? {
            start_time: a.slot[0].start_time,
            end_time: a.slot[0].end_time,
          }
        : null,
    }));

    return NextResponse.json(
      {
        appointments: formatted,
        empty: (count || 0) === 0,
        message:
          (count || 0) === 0
            ? "No appointments found"
            : "Success",
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: count
            ? Math.ceil(count / limit)
            : 0,
        },
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