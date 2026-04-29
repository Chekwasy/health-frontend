export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

interface Body {
  specialty?: string;
  bio?: string;
  years_of_experience?: number;
}

export async function PATCH(req: Request) {
  try {
    const body: Body = await req.json();

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Get logged-in user
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

    // 🔥 Ensure user is doctor
    const { data: profile, error: profileError } =
      await dbClient.client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only doctors can update profile" },
        { status: 403 }
      );
    }

    // 🔥 Build updates dynamically
    const updates: Record<string, any> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    // ✅ Validation + assignment
    if (body.specialty !== undefined) {
      if (body.specialty.length < 2) {
        return NextResponse.json(
          { message: "Specialty too short" },
          { status: 400 }
        );
      }
      updates.specialty = body.specialty;
    }

    if (body.bio !== undefined) {
      if (body.bio.length < 10) {
        return NextResponse.json(
          { message: "Bio too short" },
          { status: 400 }
        );
      }
      updates.bio = body.bio;
    }

    if (body.years_of_experience !== undefined) {
      if (body.years_of_experience < 0) {
        return NextResponse.json(
          { message: "Invalid experience value" },
          { status: 400 }
        );
      }
      updates.years_of_experience = body.years_of_experience;
    }

    // 🔥 Ensure something valid is being updated
    if (Object.keys(updates).length === 2) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // 🔥 1. Upsert doctor profile
    const { error: updateError } = await dbClient.client
      .from("doctor_profiles")
      .upsert([updates], {
        onConflict: "id",
      });

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 }
      );
    }

    // 🔥 2. Mark profile as complete
    const { error: completeError } = await dbClient.client
      .from("profiles")
      .update({ is_profile_complete: true })
      .eq("id", user.id);

    if (completeError) {
      return NextResponse.json(
        { message: completeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Doctor profile updated successfully",
      profileComplete: true, // optional but useful for frontend
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}