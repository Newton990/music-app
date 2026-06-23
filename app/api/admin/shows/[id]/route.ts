import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getOne<any>("SELECT id FROM `Show` WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    const body = await req.json();
    const { movieId, screenId, cinemaId, startTime, price, vipPrice, premiumPrice } = body;

    let endTime = body.endTime;
    if (startTime && movieId) {
      const movie = await getOne<any>("SELECT duration FROM Movie WHERE id = ?", [movieId]);
      if (movie) {
        const start = new Date(startTime);
        endTime = new Date(start.getTime() + movie.duration * 60000).toISOString();
      }
    }

    await query(
      `UPDATE \`Show\` SET movieId=?, screenId=?, cinemaId=?, startTime=?, endTime=?, price=?, vipPrice=?, premiumPrice=? WHERE id=?`,
      [movieId, screenId, cinemaId, startTime, endTime, Number(price), Number(vipPrice || price), Number(premiumPrice || price), params.id]
    );

    return NextResponse.json({ message: "Show updated" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getOne<any>("SELECT id FROM `Show` WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    await query("DELETE FROM `Show` WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Show deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
