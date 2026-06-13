import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("movieId");
  const cinemaId = searchParams.get("cinemaId");
  const date = searchParams.get("date");

  let sql = `
    SELECT sh.*, m.title as movieTitle, m.duration, sc.name as screenName, ci.name as cinemaName
    FROM \`Show\` sh
    JOIN Movie m ON m.id = sh.movieId
    JOIN Screen sc ON sc.id = sh.screenId
    JOIN Cinema ci ON ci.id = sh.cinemaId
    WHERE 1=1
  `;
  const params: any[] = [];

  if (movieId) { sql += " AND sh.movieId = ?"; params.push(movieId); }
  if (cinemaId) { sql += " AND sh.cinemaId = ?"; params.push(cinemaId); }
  if (date) { sql += " AND DATE(sh.startTime) = ?"; params.push(date); }

  sql += " ORDER BY sh.startTime";

  const shows = await query<any[]>(sql, params);
  return NextResponse.json(shows);
}
