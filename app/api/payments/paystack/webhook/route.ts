import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOne, query } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { sendTicketEmail } from "@/lib/email";

async function getSecretKey(): Promise<string> {
  if (process.env.PAYSTACK_SECRET_KEY) return process.env.PAYSTACK_SECRET_KEY;
  const setting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
  return setting?.value || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-paystack-signature");

    const secret = await getSecretKey();
    if (!secret) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 502 });
    }

    if (signature) {
      const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = body.event;
    const data = body.data;

    if (event === "charge.success" && data?.reference) {
      const verifyResult = await verifyTransaction(data.reference, secret);
      if (verifyResult.status && verifyResult.data?.status === "success") {
        await query(
          "UPDATE Payment SET status = 'success', paidAt = NOW() WHERE transactionRef = ?",
          [data.reference]
        );

        const payment = await getOne<any>("SELECT bookingId FROM Payment WHERE transactionRef = ?", [data.reference]);
        if (payment?.bookingId) {
          const qrCode = `BK-${data.reference}`;
          await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [qrCode, payment.bookingId]);

          const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [payment.bookingId]);
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
                  bookingRef: payment.bookingId,
                }).catch(console.error);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, message: "Webhook received" });
  }
}
