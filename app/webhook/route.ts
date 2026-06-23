import { NextResponse } from "next/server";
import { query, getOne } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction_reference, status, mpesa_receipt_number, result_code } = body.data || body;

    if (!transaction_reference) {
      return NextResponse.json({ success: true, message: "Webhook received" });
    }

    const paymentStatus = result_code === 0 || status === "completed" ? "success" : "failed";

    await query(
      "UPDATE Payment SET status = ?, mpesaReceipt = ? WHERE transactionRef = ?",
      [paymentStatus, mpesa_receipt_number || null, transaction_reference]
    );

    if (paymentStatus === "success") {
      const payments = await query<any[]>(
        "SELECT bookingId FROM Payment WHERE transactionRef = ?",
        [transaction_reference]
      );
      if (payments.length > 0) {
        const bookingId = payments[0].bookingId;
        const ref = `BK-${transaction_reference}`;
        await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [ref, bookingId]);
        await sendTicketEmailFromBooking(bookingId, ref);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch {
    return NextResponse.json({ success: true, message: "Webhook received" });
  }
}

async function sendTicketEmailFromBooking(bookingId: string, qrCode: string) {
  try {
    const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [bookingId]);
    if (!booking) return;

    const show = await getOne<any>("SELECT * FROM Show WHERE id = ?", [booking.showId]);
    const movie = await getOne<any>("SELECT * FROM Movie WHERE id = ?", [booking.movieId]);
    const cinema = await getOne<any>("SELECT * FROM Cinema WHERE id = ?", [booking.cinemaId]);
    const screen = await getOne<any>("SELECT * FROM Screen WHERE id = ?", [booking.screenId]);
    const user = await getOne<any>("SELECT * FROM User WHERE id = ?", [booking.userId]);
    if (!show || !movie || !cinema || !screen || !user) return;

    const seats = JSON.parse(booking.seats || "[]");

    await sendTicketEmail({
      email: user.email,
      name: user.name || "Valued Customer",
      movieTitle: movie.title,
      cinemaName: cinema.name,
      screenName: screen.name,
      showTime: show.startTime,
      seats: seats.map((s: any) => ({ row: s.row || "", col: s.col || 0, type: s.type || "standard" })),
      qrCode,
      totalAmount: booking.totalAmount,
      bookingRef: booking.id,
    });
  } catch (err) {
    console.error("Failed to send ticket email:", err);
  }
}
