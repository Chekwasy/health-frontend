export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date"); // YYYY-MM-DD
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

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

    const doctor_id = user.id; // 🔥 TRUSTED

    const now = new Date().toISOString();

    // 🔥 pagination calc
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = dbClient.client
      .from("doctor_slots")
      .select("*", { count: "exact" })
      .eq("doctor_id", doctor_id)
      .eq("is_booked", false)
      .gt("start_time", now);

    // 🔥 date filter
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      query = query
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString());
    }

    const { data, error, count } = await query
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
        slots: data || [],
        empty: (count || 0) === 0,
        message:
          (count || 0) === 0
            ? "No available slots found"
            : "Success",
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