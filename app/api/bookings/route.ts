import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne, transaction } from "@/lib/db";

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

  try {
    const bookingId = await transaction(async (conn) => {
      await conn.execute(
        "UPDATE Booking SET status = 'cancelled' WHERE showId = ? AND status = 'pending' AND createdAt < NOW() - INTERVAL 10 MINUTE",
        [showId]
      );

      const [rows] = await conn.execute<any[]>(
        `SELECT seats FROM Booking
         WHERE showId = ? AND ((status = 'pending' AND createdAt >= NOW() - INTERVAL 10 MINUTE) OR status = 'confirmed')
         FOR UPDATE`,
        [showId]
      );

      const lockedSeats: string[] = [];
      for (const b of rows) {
        const parsed = typeof b.seats === "string" ? JSON.parse(b.seats) : b.seats;
        if (Array.isArray(parsed)) {
          for (const s of parsed) lockedSeats.push(s.seatId);
        }
      }

      const requestedIds = selectedSeats.map((s: any) => s.seatId);
      const conflict = requestedIds.find((id: string) => lockedSeats.includes(id));
      if (conflict) {
        throw Object.assign(new Error(`Seat ${conflict} is already booked or locked`), { statusCode: 409 });
      }

      const id = `bk${Date.now()}`;
      const seatsJson = JSON.stringify(selectedSeats.map((s: any) => ({ seatId: s.seatId, price: s.price })));

      await conn.execute(
        `INSERT INTO Booking (id, userId, showId, movieId, cinemaId, screenId, seats, totalAmount, status, createdAt)
         VALUES (?,?,?,?,?,?,?,?,'pending',NOW())`,
        [id, userId, showId, show.movieId, show.cinemaId, show.screenId, seatsJson, totalAmount]
      );

      return id;
    });

    return NextResponse.json({ id: bookingId, status: "pending" }, { status: 201 });
  } catch (error: any) {
    if (error.statusCode === 409) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
