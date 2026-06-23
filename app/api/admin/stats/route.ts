import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [movieCount] = await query<any[]>("SELECT COUNT(*) as count FROM Movie");
    const [showCount] = await query<any[]>("SELECT COUNT(*) as count FROM `Show`");
    const [bookingCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking");
    const [revenue] = await query<any[]>("SELECT COALESCE(SUM(totalAmount), 0) as total FROM Booking WHERE status = 'confirmed'");
    const [pendingCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking WHERE status = 'pending'");
    const [cancelledCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking WHERE status = 'cancelled'");

    return NextResponse.json({
      totalMovies: movieCount.count,
      totalShows: showCount.count,
      totalBookings: bookingCount.count,
      totalRevenue: revenue.total,
      pendingBookings: pendingCount.count,
      cancelledBookings: cancelledCount.count,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
