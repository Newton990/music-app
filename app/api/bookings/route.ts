import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const bookings = await query<any[]>(
    `SELECT bk.*, m.title as movieTitle, m.posterUrl, ci.name as cinemaName,
            sh.startTime, sh.endTime
     FROM Booking bk
     JOIN Movie m ON m.id = bk.movieId
     JOIN Cinema ci ON ci.id = bk.cinemaId
     JOIN \`Show\` sh ON sh.id = bk.showId
     WHERE bk.userId = ?
     ORDER BY bk.createdAt DESC`,
    [userId]
  );

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const { showId, selectedSeats, totalAmount } = await req.json();
  if (!showId || !selectedSeats?.length) {
    return NextResponse.json({ error: "showId and selectedSeats are required" }, { status: 400 });
  }

  const show = await getOne<any>("SELECT * FROM `Show` WHERE id = ?", [showId]);
  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const bookingId = `bk${Date.now()}`;
  const seatsJson = JSON.stringify(selectedSeats.map((s: any) => ({ seatId: s.seatId, price: s.price })));

  await query(
    `INSERT INTO Booking (id, userId, showId, movieId, cinemaId, screenId, seats, totalAmount, status, createdAt)
     VALUES (?,?,?,?,?,?,?,?,'pending',NOW())`,
    [bookingId, userId, showId, show.movieId, show.cinemaId, show.screenId, seatsJson, totalAmount]
  );

  return NextResponse.json({ id: bookingId, status: "pending" }, { status: 201 });
}
