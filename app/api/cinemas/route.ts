import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cinemas = await query<any[]>(
      `SELECT ci.*, COUNT(sc.id) as screenCount
       FROM Cinema ci
       LEFT JOIN Screen sc ON sc.cinemaId = ci.id
       GROUP BY ci.id`
    );
    return NextResponse.json(cinemas);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
