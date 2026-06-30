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

    const cinemas = await query<any[]>(
      `SELECT ci.*, COUNT(sc.id) as screenCount
       FROM Cinema ci
       LEFT JOIN Screen sc ON sc.cinemaId = ci.id
       GROUP BY ci.id`
    );
    return NextResponse.json(cinemas);
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
    const { name, location, imageUrl } = body;

    if (!name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 });
    }

    const id = `ci${Date.now()}`;
    await query(
      "INSERT INTO Cinema (id, name, location, imageUrl) VALUES (?, ?, ?, ?)",
      [id, name, location, imageUrl || ""]
    );

    return NextResponse.json({ id, name, location, imageUrl: imageUrl || "" }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
