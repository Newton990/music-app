import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const showId = searchParams.get("showId");

  if (!showId) {
    return NextResponse.json({ error: "showId is required" }, { status: 400 });
  }

  const show = await query<any[]>(
    "SELECT sh.*, sc.rows, sc.cols, sc.id as screenId FROM `Show` sh JOIN Screen sc ON sc.id = sh.screenId WHERE sh.id = ?",
    [showId]
  );

  if (show.length === 0) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const seats = await query<any[]>(
    "SELECT * FROM Seat WHERE screenId = ? ORDER BY `row`, col",
    [show[0].screenId]
  );

  const bookings = await query<any[]>(
    "SELECT seats FROM Booking WHERE showId = ? AND status IN ('pending', 'confirmed')",
    [showId]
  );

  const reservedSeats: string[] = [];
  for (const b of bookings) {
    const parsed = typeof b.seats === "string" ? JSON.parse(b.seats) : b.seats;
    if (Array.isArray(parsed)) {
      for (const s of parsed) reservedSeats.push(s.seatId);
    }
  }

  return NextResponse.json({ seats, reservedSeats, screen: show[0] });
}
