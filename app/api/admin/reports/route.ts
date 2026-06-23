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

    const [totalRevenue] = await query<any[]>("SELECT COALESCE(SUM(totalAmount), 0) as total FROM Booking WHERE status = 'confirmed'");
    const [totalBookings] = await query<any[]>("SELECT COUNT(*) as count FROM Booking");
    const [confirmedCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking WHERE status = 'confirmed'");
    const [pendingCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking WHERE status = 'pending'");
    const [cancelledCount] = await query<any[]>("SELECT COUNT(*) as count FROM Booking WHERE status = 'cancelled'");

    const [totalShows] = await query<any[]>("SELECT COUNT(*) as count FROM `Show`");
    const [upcomingShows] = await query<any[]>("SELECT COUNT(*) as count FROM `Show` WHERE startTime > NOW()");

    const popularMovies = await query<any[]>(
      `SELECT m.id, m.title, m.posterUrl, COUNT(bk.id) as bookingCount, COALESCE(SUM(bk.totalAmount), 0) as revenue
       FROM Movie m
       LEFT JOIN Booking bk ON bk.movieId = m.id AND bk.status = 'confirmed'
       GROUP BY m.id
       ORDER BY bookingCount DESC
       LIMIT 10`
    );

    const monthlyRevenue = await query<any[]>(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COALESCE(SUM(totalAmount), 0) as revenue
       FROM Booking WHERE status = 'confirmed'
       GROUP BY month ORDER BY month DESC LIMIT 12`
    );

    const [todayShows] = await query<any[]>(
      `SELECT COUNT(*) as count FROM \`Show\` WHERE DATE(startTime) = CURDATE()`
    );

    return NextResponse.json({
      totalRevenue: totalRevenue.total,
      totalBookings: totalBookings.count,
      confirmedBookings: confirmedCount.count,
      pendingBookings: pendingCount.count,
      cancelledBookings: cancelledCount.count,
      totalShows: totalShows.count,
      upcomingShows: upcomingShows.count,
      todayShows: todayShows.count,
      popularMovies,
      monthlyRevenue,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
