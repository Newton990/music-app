import { NextRequest, NextResponse } from "next/server";
import { getOne } from "@/lib/db";
import { queryPaymentStatus } from "@/lib/paynecta";

async function getPaynectaKey(): Promise<string> {
  const setting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paynecta_payment_code'");
  return setting?.value || process.env.PAYNECTA_PAYMENT_CODE || "";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("transactionRef");
  const bookingId = searchParams.get("bookingId");

  if (ref) {
    try {
      const result = await queryPaymentStatus(ref);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: "Failed to query payment status" }, { status: 502 });
    }
  }

  if (bookingId) {
    let payment = await getOne<any>(
      "SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1",
      [bookingId]
    );
    if (!payment) return NextResponse.json({ status: "not_found" });

    // If M-Pesa payment is still pending, check Paynecta for live status
    if (payment.method === "mpesa" && payment.status === "pending" && payment.transactionRef) {
      try {
        const paynectaKey = await getPaynectaKey();
        if (paynectaKey) {
          const statusResult = await queryPaymentStatus(payment.transactionRef);
          if (statusResult.success && statusResult.data?.status === "completed") {
            const ref = `BK-${payment.transactionRef}`;
            await Promise.all([
              getOne("UPDATE Payment SET status='success', paidAt=NOW() WHERE transactionRef=?", [payment.transactionRef]),
              getOne("UPDATE Booking SET status='confirmed', qrCode=? WHERE id=?", [ref, bookingId]),
            ]);
            payment.status = "success";
            payment.paidAt = new Date().toISOString();
          } else if (statusResult.data?.status === "failed") {
            await getOne("UPDATE Payment SET status='failed' WHERE transactionRef=?", [payment.transactionRef]);
            payment.status = "failed";
          }
        }
      } catch { /* keep pending status, will retry */ }
    }

    return NextResponse.json(payment);
  }

  return NextResponse.json({ error: "transactionRef or bookingId required" }, { status: 400 });
}
