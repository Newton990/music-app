import { NextRequest, NextResponse } from "next/server";
import { getOne } from "@/lib/db";
import { queryPaymentStatus } from "@/lib/paynecta";

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
    const payment = await getOne<any>(
      "SELECT * FROM Payment WHERE bookingId = ? ORDER BY paidAt DESC LIMIT 1",
      [bookingId]
    );
    return NextResponse.json(payment || { status: "not_found" });
  }

  return NextResponse.json({ error: "transactionRef or bookingId required" }, { status: 400 });
}
