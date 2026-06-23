import { NextResponse } from "next/server";
import { query, getOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const record = await getOne<any>(
      "SELECT * FROM VerificationToken WHERE identifier = ? AND token = ? AND expires > NOW()",
      [phone, otp]
    );

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    await query("DELETE FROM VerificationToken WHERE identifier = ? AND token = ?", [phone, otp]);

    let user = await getOne<any>("SELECT id, name, email, phone, role FROM User WHERE phone = ?", [phone]);

    if (!user) {
      const id = `u${Date.now()}`;
      const sanitizedPhone = phone.replace(/[^0-9]/g, "");
      const email = `phone_${sanitizedPhone}@cinemake.otp`;
      const name = `User ${sanitizedPhone.slice(-4)}`;

      await query(
        "INSERT INTO User (id, name, email, phone, password, role, createdAt) VALUES (?,?,?,?,?,?,NOW())",
        [id, name, email, phone, "", "customer"]
      );

      user = { id, name, email, phone, role: "customer" };
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
