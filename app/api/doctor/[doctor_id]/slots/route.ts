export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // split path: /api/doctor/{id}/slots
    const parts = url.pathname.split("/");

    const doctor_id = parts[3]; // 👈 THIS IS THE ID


    if (!doctor_id) {
      return NextResponse.json(
        { message: "doctor_id missing" },
        { status: 400 }
      );
    }



    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const date = searchParams.get("date");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const now = new Date().toISOString();

    // 🔥 GET DOCTOR BASIC INFO
    const { data: profile, error: profileError } =
      await dbClient.client
        .from("profiles")
        .select("id, first_name, last_name, title")
        .eq("id", doctor_id)
        .eq("role", "DOCTOR")
        .single();

    if (profileError) {
  console.error("PROFILE ERROR:", profileError);

  return NextResponse.json(
    {
      message: "Error fetching doctor",
      error: profileError.message,
      details: profileError,
    },
    { status: 500 }
  );
}

if (!profile) {
  return NextResponse.json(
    { message: "Doctor not found" },
    { status: 404 }
  );
}

    // 🔥 GET DOCTOR EXTRA INFO
    const { data: extra } = await dbClient.client
      .from("doctor_profiles")
      .select("specialty, years_of_experience, bio")
      .eq("id", doctor_id)
      .single();

    // 🔥 SLOT QUERY
    let query = dbClient.client
      .from("doctor_slots")
      .select("*", { count: "exact" })
      .eq("doctor_id", doctor_id)
      .eq("is_booked", false)
      .gt("start_time", now);

    // 🔥 DATE FILTER
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      query = query
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString());
    }

    const { data: slots, error, count } = await query
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        doctor: {
          doctor_id: profile.id,
          name: `${profile.title ? profile.title + " " : ""}${profile.first_name} ${profile.last_name}`,
          specialty: extra?.specialty || null,
          experience: extra?.years_of_experience || null,
          bio: extra?.bio || null,
        },

        slots: slots || [],

        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: count ? Math.ceil(count / limit) : 0,
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