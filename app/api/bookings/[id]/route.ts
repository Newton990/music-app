import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await getOne<any>(
    `SELECT bk.*, m.title as movieTitle, m.posterUrl, m.duration, m.rating,
            ci.name as cinemaName, sc.name as screenName,
            sh.startTime, sh.endTime, py.status as paymentStatus, py.method, py.transactionRef, py.mpesaReceipt
     FROM Booking bk
     JOIN Movie m ON m.id = bk.movieId
     JOIN Cinema ci ON ci.id = bk.cinemaId
     JOIN Screen sc ON sc.id = bk.screenId
     JOIN \`Show\` sh ON sh.id = bk.showId
     LEFT JOIN Payment py ON py.bookingId = bk.id
     WHERE bk.id = ?`,
    [params.id]
  );

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const userId = (session.user as any).id;
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(booking);
}
