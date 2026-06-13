import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const booking = await getOne<any>("SELECT * FROM Booking WHERE id = ?", [params.id]);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
  }

  await query("UPDATE Booking SET status = 'cancelled' WHERE id = ?", [params.id]);
  return NextResponse.json({ message: "Booking cancelled" });
}
