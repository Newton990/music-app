import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";
import { initializePayment } from "@/lib/paynecta";
import { sendTicketEmail } from "@/lib/email";
import { initializeTransaction as paystackInit } from "@/lib/paystack";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const { bookingId, phone, method } = await req.json();
  if (!bookingId || !phone) {
    return NextResponse.json({ error: "bookingId and phone are required" }, { status: 400 });
  }

  const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [bookingId]);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (method === "mpesa") {
    const paynectaKey = process.env.PAYNECTA_PAYMENT_CODE;
    if (paynectaKey) {
      const result = await initializePayment(paynectaKey, phone, booking.totalAmount);
      if (result.success) {
        const ref = result.data?.transaction_reference;
        await query(
          "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef, paynectaRef) VALUES (?,?,?,?,'pending',?,?)",
          [`py${Date.now()}`, bookingId, booking.totalAmount, "mpesa", ref, result.data?.CheckoutRequestID || null]
        );
        return NextResponse.json({ success: true, transactionRef: ref });
      }
      return NextResponse.json({ error: result.message || "Payment initiation failed" }, { status: 502 });
    }
  }

  if (method === "card") {
    const paystackSetting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
    const paystackSecret = paystackSetting?.value || process.env.PAYSTACK_SECRET_KEY || "";
    if (paystackSecret) {
      const ref = `PS-${Date.now()}`;
      const callbackUrl = `${process.env.NEXTAUTH_URL || "https://ticketbookings.vercel.app"}/api/payments/paystack/callback?bookingId=${bookingId}`;
      const result = await paystackInit(session.user.email!, booking.totalAmount, ref, callbackUrl, paystackSecret);
      if (result.status) {
        await query(
          "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef) VALUES (?,?,?,?,'pending',?)",
          [`py${Date.now()}`, bookingId, booking.totalAmount, "card", ref]
        );
        return NextResponse.json({ success: true, transactionRef: ref, authorizationUrl: result.data.authorization_url });
      }
      return NextResponse.json({ error: result.message || "Paystack initialization failed" }, { status: 502 });
    }
  }

  // Simulated payment for non-mpesa/card or when payment keys not set
  const ref = `TXN${Date.now()}`;
  await query(
    "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef, paidAt) VALUES (?,?,?,?,'success',?,NOW())",
    [`py${Date.now()}`, bookingId, booking.totalAmount, method || "mpesa", ref]
  );
  const qrCode = `BK-${ref}`;
  await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [qrCode, bookingId]);

  // Send ticket email (fire-and-forget)
  sendTicketEmailFromBooking(booking, qrCode, session).catch(console.error);

  return NextResponse.json({ success: true, transactionRef: ref, simulated: true });
}

async function sendTicketEmailFromBooking(booking: any, qrCode: string, session: any) {
  try {
    const show = await getOne<any>("SELECT * FROM Show WHERE id = ?", [booking.showId]);
    const movie = await getOne<any>("SELECT * FROM Movie WHERE id = ?", [booking.movieId]);
    const cinema = await getOne<any>("SELECT * FROM Cinema WHERE id = ?", [booking.cinemaId]);
    const screen = await getOne<any>("SELECT * FROM Screen WHERE id = ?", [booking.screenId]);
    if (!show || !movie || !cinema || !screen) return;

    const seats = JSON.parse(booking.seats || "[]");
    const user = session.user;

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
