import dbClient from "../../../../db";
import { NextResponse } from "next/server";
import redisClient from "../../../../redis";
import axios from "axios";
import {
  getDateTimeString,
  isDateInPast,
  getSeventhDay,
  getThirtiethDay,
} from "../../../tools/dateitems";
import { Db, WithId, Document } from "mongodb";

interface User {
  userID: string;
  sub: string;
  [key: string]: any;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const reference: string | null = request.headers.get("reference");
    const tok: string | null = request.headers.get("tok");

    if (!tok || !reference) {
      return NextResponse.json(
        { message: "Incomplete data supplied" },
        { status: 400 },
      );
    }

    // Validate token in Redis
    const usr_id: string | null = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json(
        { message: "User access denied. Try Login" },
        { status: 401 },
      );
    }

    // Get user from DB
    const db: Db = await dbClient.db();
    const user: WithId<User> | null = await db
      .collection<User>("users")
      .findOne({ userID: usr_id });

    if (!user) {
      return NextResponse.json(
        { message: "User has no access. Try signup" },
        { status: 401 },
      );
    }

    // Verify payment with Paystack
    const apiEndpoint = `https://api.paystack.co/transaction/verify/${reference}`;
    const secretKey = process.env.PSK || "";

    const headers = {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    };

    let status = "";
    let amount = 0;

    try {
      const response = await axios.get(apiEndpoint, { headers });
      status = response.data.data.status;
      amount = response.data.data.amount;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Error from payment channel" },
        { status: 401 },
      );
    }

    if (status === "success") {
      let subs = "";
      let curDay = "";

      // Determine subscription start date
      curDay = isDateInPast(user.sub.slice(-8))
        ? getDateTimeString()
        : user.sub.slice(-8);

      if (amount / 100 === 800) {
        subs = `mont_${getThirtiethDay(curDay)}`;
      } else {
        subs = `week_${getSeventhDay(curDay)}`;
      }

      const updateResult = await db
        .collection<User>("users")
        .updateOne({ userID: usr_id }, { $set: { sub: subs } });

      if (!updateResult.acknowledged) {
        return NextResponse.json(
          { message: "Error updating records" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { status, message: "Payment Successful" },
        { status: 201 },
      );
    } else {
      return NextResponse.json(
        { status, message: `Payment ${status}` },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Payment Verification Error" },
      { status: 401 },
    );
  }
}
