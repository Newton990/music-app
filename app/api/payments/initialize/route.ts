import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";
import { initializePayment } from "@/lib/paynecta";

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

  // Simulated payment for non-mpesa or when Paynecta key not set
  const ref = `TXN${Date.now()}`;
  await query(
    "INSERT INTO Payment (id, bookingId, amount, method, status, transactionRef, paidAt) VALUES (?,?,?,?,'success',?,NOW())",
    [`py${Date.now()}`, bookingId, booking.totalAmount, method || "mpesa", ref]
  );
  await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [`BK-${ref}`, bookingId]);

  return NextResponse.json({ success: true, transactionRef: ref, simulated: true });
}
