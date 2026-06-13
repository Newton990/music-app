import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, getOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    const existing = await getOne<any>("SELECT id FROM User WHERE email = ?", [email]);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = `u${Date.now()}`;
    await query(
      "INSERT INTO User (id, name, email, phone, password, role, createdAt) VALUES (?,?,?,?,?,?,NOW())",
      [id, name, email, phone || null, hashed, "customer"]
    );
    return NextResponse.json({ id, name, email, phone, role: "customer" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
