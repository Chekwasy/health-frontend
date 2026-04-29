export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../../db";
import redisClient from "../../../../redis";
import axios from "axios";
import { Db } from "mongodb";

interface User {
  userID: string;
  email: string;
  [key: string]: any;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const tok = request.headers.get("tok");
    const plan = request.headers.get("plan");

    if (!tok || !plan) {
      return NextResponse.json(
        { message: "Incomplete data supplied" },
        { status: 400 },
      );
    }

    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json(
        { message: "User access denied. Try Login" },
        { status: 401 },
      );
    }

    const db: Db = await dbClient.db();
    const user: User | null = await db
      .collection<User>("users")
      .findOne({ userID: usr_id });

    if (!user) {
      return NextResponse.json(
        { message: "User has no access. Try signup" },
        { status: 401 },
      );
    }

    // --- Payment setup ---
    const apiEndpoint = "https://api.paystack.co/transaction/initialize";
    const secretKey = process.env.PSK;
    if (!secretKey) {
      return NextResponse.json(
        { message: "Payment secret not configured" },
        { status: 500 },
      );
    }

    let amount = "25000"; // default
    if (plan === "monthly") amount = "80000";
    if (plan === "weekly") amount = "25000";

    const headers = {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    };

    const data = {
      email: user.email,
      amount,
    };

    let access_code = "";
    let reference = "";

    try {
      const response = await axios.post(apiEndpoint, data, { headers });
      access_code = response.data.data.access_code;
      reference = response.data.data.reference;
    } catch (error) {
      console.error("Paystack error:", error);
      return NextResponse.json(
        { message: "Error from payment channel" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { access_code, reference, message: "Success" },
      { status: 201 },
    );
  } catch (err) {
    console.error("Payment processing error:", err);
    return NextResponse.json(
      { message: "Payment Processing Error" },
      { status: 500 },
    );
  }
}
