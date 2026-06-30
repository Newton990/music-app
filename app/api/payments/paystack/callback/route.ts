import { NextRequest, NextResponse } from "next/server";
import { getOne, query } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { sendTicketEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const bookingId = searchParams.get("bookingId");

  if (!reference) {
    return NextResponse.redirect(new URL("/payment/failed", req.url));
  }

  const setting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
  const secretKey = setting?.value || process.env.PAYSTACK_SECRET_KEY || "";

  const result = await verifyTransaction(reference, secretKey);

  if (result.status && result.data?.status === "success") {
    await query(
      "UPDATE Payment SET status = 'success', paidAt = NOW() WHERE transactionRef = ?",
      [reference]
    );

    const payment = await getOne<any>("SELECT bookingId FROM Payment WHERE transactionRef = ?", [reference]);
    const bid = bookingId || payment?.bookingId;

    if (bid) {
      const qrCode = `BK-${reference}`;
      await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [qrCode, bid]);

      const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [bid]);
      if (booking) {
        const show = await getOne<any>("SELECT * FROM Show WHERE id = ?", [booking.showId]);
        const movie = await getOne<any>("SELECT * FROM Movie WHERE id = ?", [booking.movieId]);
        const cinema = await getOne<any>("SELECT * FROM Cinema WHERE id = ?", [booking.cinemaId]);
        const screen = await getOne<any>("SELECT * FROM Screen WHERE id = ?", [booking.screenId]);
        if (show && movie && cinema && screen) {
          const seats = JSON.parse(booking.seats || "[]");
          const user = await getOne<any>("SELECT * FROM User WHERE id = ?", [booking.userId]);
          if (user) {
            sendTicketEmail({
              email: user.email,
              name: user.name || "Valued Customer",
              movieTitle: movie.title,
              cinemaName: cinema.name,
              screenName: screen.name,
              showTime: show.startTime,
              seats: seats.map((s: any) => ({ row: s.row || "", col: s.col || 0, type: s.type || "standard" })),
              qrCode,
              totalAmount: booking.totalAmount,
              bookingRef: bid,
            }).catch(console.error);
          }
        }
      }
    }

    return NextResponse.redirect(new URL(`/booking/confirmation?bookingId=${bid || ""}`, req.url));
  }

  await query("UPDATE Payment SET status = 'failed' WHERE transactionRef = ?", [reference]);
  return NextResponse.redirect(new URL("/payment/failed", req.url));
}
