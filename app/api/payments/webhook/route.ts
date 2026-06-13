import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
      const payment = await query<any[]>(
        "SELECT bookingId FROM Payment WHERE transactionRef = ?",
        [transaction_reference]
      );
      if (payment.length > 0) {
        const ref = `BK-${transaction_reference}`;
        await query("UPDATE Booking SET status = 'confirmed', qrCode = ? WHERE id = ?", [ref, payment[0].bookingId]);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch {
    return NextResponse.json({ success: true, message: "Webhook received" });
  }
}
