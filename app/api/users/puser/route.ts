export const runtime = "nodejs";

import dbClient from "../../../../db";
import { NextResponse } from "next/server";
import { checkpwd } from "../../../tools/func";

interface SignupBody {
  emailpwd: string;
  firstname: string;
  lastname: string;
  role: "PATIENT" | "DOCTOR";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const dd: SignupBody = await request.json();
    const { emailpwd, firstname, lastname, role } = dd;

    // ✅ Validate required fields
    if (!emailpwd || !firstname || !lastname || !role) {
      return NextResponse.json(
        { message: "Incomplete signup data" },
        { status: 400 }
      );
    }

    // ✅ Validate role strictly
    if (!["PATIENT", "DOCTOR"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role selected" },
        { status: 400 }
      );
    }

    // 🔐 Decode base64 email:password
    const encoded_usr_str = emailpwd.split(" ")[1];
    if (!encoded_usr_str) {
      return NextResponse.json(
        { message: "Invalid encoded credentials" },
        { status: 400 }
      );
    }

    const decoded_usr_str = Buffer.from(encoded_usr_str, "base64").toString(
      "utf-8"
    );

    const [email, rawPassword] = decoded_usr_str.split(":");

    if (!email || !rawPassword) {
      return NextResponse.json(
        { message: "Invalid email or password format" },
        { status: 400 }
      );
    }

    // ✅ Validation
    if (!checkpwd(email)) {
      return NextResponse.json(
        { message: "Invalid email characters" },
        { status: 400 }
      );
    }

    if (!checkpwd(firstname)) {
      return NextResponse.json(
        { message: "Invalid firstname characters" },
        { status: 400 }
      );
    }

    if (!checkpwd(lastname)) {
      return NextResponse.json(
        { message: "Invalid lastname characters" },
        { status: 400 }
      );
    }

    if (!checkpwd(rawPassword)) {
      return NextResponse.json(
        { message: "Invalid password characters" },
        { status: 400 }
      );
    }

    // 🔐 1. Create user in Supabase Auth
    const { data: authData, error: authError } =
      await dbClient.client.auth.signUp({
        email,
        password: rawPassword,
      });

    if (authError) {
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      );
    }

    const user = authData.user;

    if (!user) {
      return NextResponse.json(
        { message: "User creation failed" },
        { status: 500 }
      );
    }

    // 🧱 2. Insert into healthcare.profiles
    const { error: profileError } = await dbClient.client
      .from("profiles")
      .insert([
        {
          id: user.id, // 🔥 linked to auth.users
          email,
          first_name: firstname,
          last_name: lastname,
          title: null,
          role,
        },
      ]);

    if (profileError) {
      return NextResponse.json(
        { message: profileError.message },
        { status: 500 }
      );
    }

    // 🎯 3. Return role-aware response
    return NextResponse.json(
      {
        success: email,
        role,
        nextStep:
          role === "DOCTOR"
            ? "/auth/login"
            : "/auth/login", // 🔥 can be customized to a doctor onboarding page in the future
        message: "Signup successful",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error processing signup" },
      { status: 500 }
    );
  }
}