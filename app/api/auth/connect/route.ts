export const runtime = "nodejs";

import dbClient from "../../../../db";
import { NextResponse } from "next/server";
import { checkpwd } from "../../../tools/func";

interface LoginRequestBody {
  auth_header: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: LoginRequestBody = await request.json();
    const { auth_header } = body;

    if (!auth_header) {
      return NextResponse.json(
        { message: "Unset auth header" },
        { status: 400 }
      );
    }

    const parts = auth_header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Basic") {
      return NextResponse.json(
        { message: "Invalid auth format" },
        { status: 400 }
      );
    }

    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
    const [email, password] = decoded.split(":");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Invalid credentials format" },
        { status: 400 }
      );
    }

    if (!checkpwd(email) || !checkpwd(password)) {
      return NextResponse.json(
        { message: "Invalid credentials format" },
        { status: 401 }
      );
    }

    // 🔐 Supabase login
    const { data, error } = await dbClient.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { message: "Email or Password Incorrect" },
        { status: 400 }
      );
    }

    const user = data.user;

    // 🔥 fetch profile (optional but recommended)
    const { data: profile, error: profileError } =
      await dbClient.client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: profile.role,
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
        session: data.session, // 🔥 contains access_token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing signin" },
      { status: 500 }
    );
  }
}