export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
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

    // 🔥 DELETE ONLY UNBOOKED SLOTS
    const { data, error } = await dbClient.client
      .from("doctor_slots")
      .delete()
      .eq("doctor_id", doctor_id)
      .eq("is_booked", false)
      .select(); // 🔥 returns deleted rows

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Schedule deleted successfully",
        deleted_count: data?.length || 0,
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