import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";
import { initializePayment } from "@/lib/paynecta";
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
    const paynectaSetting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paynecta_payment_code'");
    const paynectaKey = paynectaSetting?.value || process.env.PAYNECTA_PAYMENT_CODE || "";
    if (!paynectaKey) {
      return NextResponse.json({ error: "M-Pesa payment not configured. Go to Admin > Settings to set up Paynecta." }, { status: 502 });
    }
    const result = await initializePayment(paynectaKey, phone, booking.totalAmount);
    if (result.success) {
      const ref = result.data?.transaction_reference;
      await query(
        "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef, paynectaRef) VALUES (?,?,?,?,'pending',?,?)",
        [`py${Date.now()}`, bookingId, booking.totalAmount, "mpesa", ref, result.data?.CheckoutRequestID || null]
      );
      return NextResponse.json({ success: true, transactionRef: ref, pending: true });
    }
    return NextResponse.json({ error: result.message || "M-Pesa payment initiation failed" }, { status: 502 });
  }

  if (method === "card") {
    const paystackSetting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
    const paystackSecret = paystackSetting?.value || process.env.PAYSTACK_SECRET_KEY || "";
    if (!paystackSecret) {
      return NextResponse.json({ error: "Card payment not configured. Go to Admin > Settings to set up Paystack." }, { status: 502 });
    }
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

  return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
}
