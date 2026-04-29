import { NextResponse } from "next/server";
import dbClient from "../../../../db";
import redisClient from "../../../../redis";
import crypto from "crypto";
import { checknumber, checkpwd } from "../../../tools/func";

interface User {
  email: string;
  password: string;
  fname?: string;
  lname?: string;
  mobile?: string;
  accbal?: string;
  currency?: string;
  rating?: string;
  sub?: string;
  TGames?: string;
  TWon?: string;
  TLost?: string;
  nickname?: string;
  jdate?: string;
}

interface ResetRequestBody {
  token: string;
  auth_header: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const dd: ResetRequestBody = await request.json();
    const { token, auth_header } = dd;

    if (!auth_header || !token) {
      return NextResponse.json({ message: "Incomplete data" }, { status: 400 });
    }

    const decoded_usr_str = Buffer.from(auth_header, "base64").toString(
      "utf-8",
    );
    const usr_details = decoded_usr_str.split(":");
    const email = usr_details[0];
    const passwordRaw = usr_details[1];
    const pwd = crypto.createHash("sha256").update(passwordRaw).digest("hex");

    if (!email || !passwordRaw) {
      await redisClient.del(email);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!checkpwd(email) || !checkpwd(passwordRaw)) {
      await redisClient.del(email);
      return NextResponse.json(
        { message: "Invalid characters" },
        { status: 401 },
      );
    }

    if (!checknumber(token)) {
      await redisClient.del(email);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const tok = await redisClient.get(email);
    if (!tok)
      return NextResponse.json({ message: "Token expired" }, { status: 401 });

    const mainstr = tok.slice(0, 6);
    const mainval = parseInt(tok.slice(-1), 10) + 1;

    await redisClient.del(email);

    if (mainstr !== token.toString() || mainval > 5) {
      return NextResponse.json(
        { message: "Token mismatch or limit exceeded" },
        { status: 401 },
      );
    }

    const db = await dbClient.db();
    const user: User | null = await db
      .collection<User>("users")
      .findOne({ email });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 401 });

    await db
      .collection<User>("users")
      .updateOne({ email }, { $set: { password: pwd } });

    return NextResponse.json(
      { email: user.email, message: "Password reset successful" },
      { status: 201 },
    );
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 400 },
    );
  }
}
