import { NextResponse } from "next/server";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, movieTitle, cinemaName, screenName, showTime, seats, qrCode, totalAmount, bookingRef } = body;

    if (!email || !movieTitle || !bookingRef) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendTicketEmail({
      email,
      name: name || "Valued Customer",
      movieTitle,
      cinemaName: cinemaName || "",
      screenName: screenName || "",
      showTime: showTime || new Date().toISOString(),
      seats: seats || [],
      qrCode: qrCode || "",
      totalAmount: totalAmount || 0,
      bookingRef,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Email notification error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
