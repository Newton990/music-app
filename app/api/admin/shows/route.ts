import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shows = await query<any[]>(
      `SELECT sh.*, m.title as movieTitle, m.posterUrl, sc.name as screenName, ci.name as cinemaName
       FROM \`Show\` sh
       JOIN Movie m ON m.id = sh.movieId
       JOIN Screen sc ON sc.id = sh.screenId
       JOIN Cinema ci ON ci.id = sh.cinemaId
       ORDER BY sh.startTime DESC`
    );

    return NextResponse.json(shows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, screenId, cinemaId, startTime, price, vipPrice, premiumPrice } = body;

    if (!movieId || !screenId || !cinemaId || !startTime || !price) {
      return NextResponse.json({ error: "movieId, screenId, cinemaId, startTime, and price are required" }, { status: 400 });
    }

    const movie = await getOne<any>("SELECT duration FROM Movie WHERE id = ?", [movieId]);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    const id = `sh${Date.now()}`;
    await query(
      `INSERT INTO \`Show\` (id, movieId, screenId, cinemaId, startTime, endTime, price, vipPrice, premiumPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, movieId, screenId, cinemaId, start, end, Number(price), Number(vipPrice || price), Number(premiumPrice || price)]
    );

    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
