export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../db";
import redisClient from "../../../redis";
import {
  getCurrentDateString,
  getYesterdayDateString,
} from "../../tools/dateitems";

interface SavedGameUpdate {
  option: "two2win" | "point5" | "point5pro";
  result: "Won" | "Lost";
  day: "yest" | "today";
  index: number | string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const savedHeader = request.headers.get("saved");
    const tok = request.headers.get("tok");

    if (!savedHeader || !tok) {
      return NextResponse.json({ message: "Incomplete data" }, { status: 400 });
    }

    const saved: SavedGameUpdate = JSON.parse(savedHeader);
    const { option: dbName, result, day, index } = saved;

    if (!dbName || !result || !day || index === undefined || index === null) {
      return NextResponse.json({ message: "Incomplete data" }, { status: 400 });
    }

    const date =
      day === "yest" ? getYesterdayDateString() : getCurrentDateString();

    // --- Validate admin user ---
    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await dbClient.db(); // <--- await here
    const usr = await db.collection("users").findOne({ userID: usr_id });

    if (!usr || usr.email !== "richardchekwas@gmail.com") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- Determine collection ---
    const collections = ["two2win", "point5", "point5pro"] as const;
    if (!collections.includes(dbName)) {
      return NextResponse.json(
        { message: "Invalid database option" },
        { status: 400 },
      );
    }

    const collection = db.collection(dbName);

    const idx = typeof index === "string" ? parseInt(index, 10) : index;

    const updateResult = await collection.updateOne(
      {
        date,
        [`game.${idx}.status`]: "Pending",
      },
      {
        $set: {
          [`game.${idx}.status`]: result,
        },
      },
    );

    if (!updateResult.acknowledged) {
      return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (err) {
    console.error("Admin update game error:", err);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 400 },
    );
  }
}
