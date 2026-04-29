export const runtime = "nodejs";

import dbClient from "../../../../db";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 🔐 Get token
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 🔥 Get user
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

    // 🧱 Fetch profile
    const { data: profile, error: profileError } =
      await dbClient.client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // 🎯 Return response
    return NextResponse.json(
      {
        logged: true,
        message: "Success",
        profileComplete: profile.is_profile_complete, // 🔥 from DB
        me: {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          title: profile.title,
          phone: profile.phone,
          role: profile.role,
          created_at: profile.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}