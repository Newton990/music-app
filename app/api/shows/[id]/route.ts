import { NextResponse } from "next/server";
import { getOne, query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const show = await getOne<any>(
    `SELECT sh.*, m.title as movieTitle, m.duration, m.posterUrl, m.rating, sc.name as screenName,
            sc.rows, sc.cols, ci.name as cinemaName, ci.location
     FROM \`Show\` sh
     JOIN Movie m ON m.id = sh.movieId
     JOIN Screen sc ON sc.id = sh.screenId
     JOIN Cinema ci ON ci.id = sh.cinemaId
     WHERE sh.id = ?`,
    [params.id]
  );

  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  // Get reserved seat IDs for this show
  const reservedRows = await query<any[]>(
    "SELECT JSON_UNQUOTE(JSON_EXTRACT(js.seat, '$.seatId')) as seatId FROM Booking bk, JSON_TABLE(bk.seats, '$[*]' COLUMNS (seat JSON PATH '$')) js WHERE bk.showId = ? AND bk.status IN ('pending', 'confirmed')",
    [params.id]
  );
  // Fallback: parse seats JSON in JS if JSON_TABLE not supported
  const bookings = await query<any[]>(
    "SELECT seats FROM Booking WHERE showId = ? AND status IN ('pending', 'confirmed')",
    [params.id]
  );
  const reservedSeats: string[] = [];
  for (const b of bookings) {
    const parsed = typeof b.seats === "string" ? JSON.parse(b.seats) : b.seats;
    if (Array.isArray(parsed)) {
      for (const s of parsed) reservedSeats.push(s.seatId);
    }
  }

  // Get all seats for this screen
  const seats = await query<any[]>(
    "SELECT * FROM Seat WHERE screenId = ? ORDER BY `row`, col",
    [show.screenId]
  );

  return NextResponse.json({ ...show, seats, reservedSeats });
}
