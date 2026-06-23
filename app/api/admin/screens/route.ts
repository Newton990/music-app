import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const screens = await query<any[]>(
      `SELECT sc.*, ci.name as cinemaName
       FROM Screen sc
       JOIN Cinema ci ON ci.id = sc.cinemaId
       ORDER BY ci.name, sc.name`
    );

    return NextResponse.json(screens);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cinemaId, name, rows, cols } = body;

    if (!cinemaId || !name || !rows || !cols) {
      return NextResponse.json({ error: "cinemaId, name, rows, and cols are required" }, { status: 400 });
    }

    const id = `sc${Date.now()}`;
    await query(
      "INSERT INTO Screen (id, cinemaId, name, rows, cols) VALUES (?, ?, ?, ?, ?)",
      [id, cinemaId, name, Number(rows), Number(cols)]
    );

    return NextResponse.json({ id, cinemaId, name, rows: Number(rows), cols: Number(cols) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
