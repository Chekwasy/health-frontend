export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Queue } from "bullmq";
import dbClient from "../../../db";
import redisClient from "../../../redis";
import {
  getCurrentDateString,
  getYesterdayDateString,
  getCurrentTimeString,
} from "../../tools/dateitems";
import { Db } from "mongodb";

interface SavedData {
  db: string[];
  totalOdd: string;
  code: string;
}

interface User {
  userID: string;
  email: string;
  sub?: string;
  [key: string]: any;
}

interface Game {
  time: string;
  Sbal: string;
  stake: string;
  odd: string;
  Ebal: string;
  status: "Pending" | "Won" | "Lost";
  code: string;
}

type CollectionName = "two2win" | "point5" | "point5pro";

// BullMQ connection options
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const savedHeader = request.headers.get("saved");
    const tok = request.headers.get("tok");

    if (!tok || !savedHeader) {
      return NextResponse.json(
        { message: "Incomplete data supplied" },
        { status: 400 },
      );
    }

    const saved: SavedData = JSON.parse(savedHeader);
    const { db, totalOdd: Todd, code } = saved;

    if (!db || !Todd || !code) {
      return NextResponse.json(
        { message: "Incomplete saved data" },
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

    const dbConn: Db = await dbClient.db();

    const user: User | null = await dbConn
      .collection<User>("users")
      .findOne({ userID: usr_id });
    if (!user) {
      return NextResponse.json(
        { message: "User has no access. Try signup" },
        { status: 401 },
      );
    }

    const usrAll: User[] = await dbConn
      .collection<User>("users")
      .find({})
      .toArray();
    if (user.email !== "richardchekwas@gmail.com") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const date = getCurrentDateString();
    const time = getCurrentTimeString();
    const yest = getYesterdayDateString();

    let Sbal = "";
    let stake = "";
    let Ebal = "";

    const two = ["20", "60", "140", "300", "620", "1260", "2540", "5100"];
    const p5 = ["100", "400", "1300", "4000", "12000"];
    const p5pro = ["100", "400", "1300", "4000", "12000"];

    const handleGameInsertOrUpdate = async (
      collectionName: CollectionName,
      presetArray: string[],
    ): Promise<NextResponse> => {
      const coll = dbConn.collection<{ date: string; game: Game[] }>(
        collectionName,
      );
      const g = await coll.findOne({ date });
      const yg = await coll.findOne({ date: yest });

      // Calculate balances
      if (!g) {
        if (!yg) {
          Sbal = collectionName === "two2win" ? "9980" : "17900";
          stake = presetArray[0];
          Ebal = (
            parseFloat(Sbal) +
            parseFloat(Todd) * parseFloat(stake)
          ).toString();
        }

        if (yg) {
          const last = yg.game[yg.game.length - 1];
          if (last.status === "Pending")
            return NextResponse.json("error not done", { status: 401 });

          if (last.status === "Won") {
            stake = presetArray[0];
            Sbal = (parseFloat(last.Ebal) - parseFloat(stake)).toString();
            Ebal = (
              parseFloat(Sbal) +
              parseFloat(stake) * parseFloat(Todd)
            ).toString();
          }

          if (last.status === "Lost") {
            const idx = presetArray.indexOf(last.stake);
            stake = presetArray[idx + 1];
            Sbal = (parseFloat(last.Sbal) - parseFloat(stake)).toString();
            Ebal = (
              parseFloat(Sbal) +
              parseFloat(stake) * parseFloat(Todd)
            ).toString();
          }
        }

        const r = await coll.insertOne({
          date,
          game: [
            { time, Sbal, stake, odd: Todd, Ebal, status: "Pending", code },
          ],
        });
        if (!r.acknowledged)
          return NextResponse.json("error not done", { status: 401 });
      } else {
        const last = g.game[g.game.length - 1];
        if (last.status === "Pending")
          return NextResponse.json("error not done", { status: 401 });

        if (last.status === "Won") {
          stake = presetArray[0];
          Sbal = (parseFloat(last.Ebal) - parseFloat(stake)).toString();
          Ebal = (
            parseFloat(Sbal) +
            parseFloat(stake) * parseFloat(Todd)
          ).toString();
        }

        if (last.status === "Lost") {
          const idx = presetArray.indexOf(last.stake);
          stake = presetArray[idx + 1];
          Sbal = (parseFloat(last.Sbal) - parseFloat(stake)).toString();
          Ebal = (
            parseFloat(Sbal) +
            parseFloat(stake) * parseFloat(Todd)
          ).toString();
        }

        const r = await coll.updateOne(
          { date },
          {
            $push: {
              game: {
                time,
                Sbal,
                stake,
                odd: Todd,
                Ebal,
                status: "Pending",
                code,
              },
            },
          },
        );
        if (!r.acknowledged)
          return NextResponse.json("error not done", { status: 401 });
      }

      // --- BullMQ Queue ---
      const notifyQueue = new Queue("Notify", { connection });
      await notifyQueue.add("notify-job", {
        usr: [...usrAll],
        option:
          collectionName === "two2win"
            ? "Two2Win"
            : collectionName === "point5"
              ? "Point5"
              : "Point5PRO",
        time,
        Sbal,
        stake,
        odd: Todd,
        Ebal,
        status: "Pending",
        code,
      });

      return NextResponse.json({ message: "Success" }, { status: 201 });
    };

    if (db[0] === "two2win") return handleGameInsertOrUpdate("two2win", two);
    if (db[0] === "point5") return handleGameInsertOrUpdate("point5", p5);
    if (db[0] === "point5pro")
      return handleGameInsertOrUpdate("point5pro", p5pro);

    return NextResponse.json("error", { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json("error", { status: 400 });
  }
}
