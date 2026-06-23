import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let sql = `
      SELECT bk.*, m.title as movieTitle, m.posterUrl, ci.name as cinemaName,
             sc.name as screenName, sh.startTime, sh.endTime, u.name as userName, u.email as userEmail
      FROM Booking bk
      JOIN Movie m ON m.id = bk.movieId
      JOIN Cinema ci ON ci.id = bk.cinemaId
      JOIN Screen sc ON sc.id = bk.screenId
      JOIN \`Show\` sh ON sh.id = bk.showId
      JOIN User u ON u.id = bk.userId
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += " AND bk.status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND (bk.id LIKE ? OR m.title LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += " ORDER BY bk.createdAt DESC LIMIT 200";

    const bookings = await query<any[]>(sql, params);
    return NextResponse.json(bookings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
