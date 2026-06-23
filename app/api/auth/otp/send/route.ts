import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await query("DELETE FROM VerificationToken WHERE identifier = ?", [phone]);
    await query(
      "INSERT INTO VerificationToken (identifier, token, expires) VALUES (?, ?, ?)",
      [phone, otp, expires]
    );

    console.log(`[OTP] For ${phone}: ${otp}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
