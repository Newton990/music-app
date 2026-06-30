import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOne, query } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const { bookingId, callbackUrl } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [bookingId]);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const setting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
  const secretKey = setting?.value || process.env.PAYSTACK_SECRET_KEY || "";
  if (!secretKey) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 502 });
  }

  const ref = `PS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cbUrl = callbackUrl || `${process.env.NEXTAUTH_URL || "https://ticketbookings.vercel.app"}/api/payments/paystack/callback?bookingId=${bookingId}`;

  const result = await initializeTransaction(
    session.user.email!,
    booking.totalAmount,
    ref,
    cbUrl,
    secretKey
  );

  if (!result.status) {
    return NextResponse.json({ error: result.message || "Paystack initialization failed" }, { status: 502 });
  }

  await query(
    "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef) VALUES (?,?,?,?,'pending',?)",
    [`py${Date.now()}`, bookingId, booking.totalAmount, "card", ref]
  );

  return NextResponse.json({
    success: true,
    transactionRef: ref,
    authorizationUrl: result.data.authorization_url,
  });
}
