export const runtime = "nodejs";

import dbClient from "@/db";
import { NextResponse } from "next/server";

interface Body {
  gender?: "MALE" | "FEMALE" | "OTHER";
  date_of_birth?: string;
  blood_group?: string;

  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;

  emergency_contact_name?: string;
  emergency_contact_phone?: string;
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

    // 🔐 Get user
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

    // 🔥 Ensure PATIENT
    const { data: profile, error: profileError } =
      await dbClient.client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "PATIENT") {
      return NextResponse.json(
        { message: "Only patients allowed" },
        { status: 403 }
      );
    }

    // 🔥 Build update object
    const updates: Record<string, any> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    // ✅ Assign fields (you can add validation later if needed)
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.date_of_birth !== undefined)
      updates.date_of_birth = body.date_of_birth;
    if (body.blood_group !== undefined)
      updates.blood_group = body.blood_group;

    if (body.allergies !== undefined) updates.allergies = body.allergies;
    if (body.chronic_conditions !== undefined)
      updates.chronic_conditions = body.chronic_conditions;
    if (body.current_medications !== undefined)
      updates.current_medications = body.current_medications;

    if (body.emergency_contact_name !== undefined)
      updates.emergency_contact_name = body.emergency_contact_name;

    if (body.emergency_contact_phone !== undefined)
      updates.emergency_contact_phone = body.emergency_contact_phone;

    // 🔥 Ensure something valid is being updated
    if (Object.keys(updates).length === 2) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // 🔥 1. UPSERT patient profile
    const { error } = await dbClient.client
      .from("patient_profiles")
      .upsert([updates], {
        onConflict: "id",
      });

    if (error) {
      return NextResponse.json(
        { message: error.message },
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
      message: "Patient profile updated successfully",
      profileComplete: true, // helpful for frontend
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}