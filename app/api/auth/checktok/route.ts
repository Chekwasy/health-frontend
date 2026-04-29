import dbClient from "../../../../db";
import redisClient from "../../../../redis";
import { NextResponse } from "next/server";
import { checknumber, checkpwd } from "../../../tools/func";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!checkpwd(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!checknumber(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const tok = await redisClient.get(email);

    if (!tok) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const mainstr = tok.slice(0, 6);
    const mainval = Number(tok.slice(-1)) + 1;
    const finalstr = mainstr + mainval;

    await redisClient.del(email);
    await redisClient.set(email, finalstr, 5 * 60);

    if (mainval > 5) {
      await redisClient.del(email);
      return NextResponse.json({ error: "Too many attempts" }, { status: 400 });
    }

    if (mainstr !== token.toString()) {
      return NextResponse.json({ error: "Token mismatch" }, { status: 400 });
    }

    const user = await dbClient
      .db()
      .then((db) => db.collection("users").findOne({ email }));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    return NextResponse.json(
      {
        email: user.email,
        message: "Token Verified",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 400 });
  }
}
