export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10; // 🔥 fixed per requirement
    const date = searchParams.get("date"); // optional

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const now = new Date().toISOString();

    // 🔥 BASE QUERY (slots)
    let slotQuery = dbClient.client
      .from("doctor_slots")
      .select("doctor_id, start_time, end_time")
      .eq("is_booked", false)
      .gt("start_time", now);

    // 🔥 DATE FILTER
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      slotQuery = slotQuery
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString());
    }

    const { data: slots, error: slotError } = await slotQuery.order(
      "start_time",
      { ascending: true }
    );

    if (slotError) {
      return NextResponse.json(
        { message: slotError.message },
        { status: 500 }
      );
    }

    if (!slots || slots.length === 0) {
      return NextResponse.json(
        {
          doctors: [],
          pagination: {
            page,
            total: 0,
            total_pages: 0,
          },
        },
        { status: 200 }
      );
    }

    // 🔥 GROUP SLOTS BY DOCTOR
    const grouped: Record<string, any[]> = {};

    for (const slot of slots) {
      if (!grouped[slot.doctor_id]) {
        grouped[slot.doctor_id] = [];
      }
      grouped[slot.doctor_id].push(slot);
    }

    const doctorIds = Object.keys(grouped);

    // 🔥 PAGINATE DOCTORS (not slots)
    const paginatedDoctorIds = doctorIds.slice(from, to + 1);

    // 🔥 FETCH PROFILES
    const { data: profiles } = await dbClient.client
      .from("profiles")
      .select("id, first_name, last_name, title")
      .in("id", paginatedDoctorIds);

    const { data: doctorProfiles } = await dbClient.client
      .from("doctor_profiles")
      .select("id, specialty, years_of_experience")
      .in("id", paginatedDoctorIds);

    // 🔥 BUILD RESPONSE
    const doctors = paginatedDoctorIds.map((id) => {
      const doc = profiles?.find((p: any) => p.id === id);
      const extra = doctorProfiles?.find((d: any) => d.id === id);

      const doctorSlots = grouped[id] || [];

      const firstFew = doctorSlots.slice(0, 3); // 🔥 first 3
      const lastFew =
        doctorSlots.length > 3
          ? doctorSlots.slice(-3)
          : [];

      return {
        doctor_id: id,
        name: `${doc?.title ? doc.title + " " : ""}${doc?.first_name} ${doc?.last_name}`,
        specialty: extra?.specialty || null,
        experience: extra?.years_of_experience || null,

        preview_slots: {
          first: firstFew,
          last: lastFew,
        },
      };
    });

    return NextResponse.json(
      {
        doctors,
        pagination: {
          page,
          total: doctorIds.length,
          total_pages: Math.ceil(doctorIds.length / limit),
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