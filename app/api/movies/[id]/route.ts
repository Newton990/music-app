import { NextResponse } from "next/server";
import { getOne, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const movie = await getOne<any>("SELECT * FROM Movie WHERE id = ?", [params.id]);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    movie.genre = typeof movie.genre === "string" ? JSON.parse(movie.genre) : (movie.genre || []);
    movie.cast = typeof movie.cast === "string" ? JSON.parse(movie.cast) : (movie.cast || []);

    const shows = await query<any[]>(
      `SELECT sh.*, sc.name as screenName, ci.name as cinemaName, ci.location
       FROM \`Show\` sh
       JOIN Screen sc ON sc.id = sh.screenId
       JOIN Cinema ci ON ci.id = sh.cinemaId
       WHERE sh.movieId = ?
       ORDER BY sh.startTime`,
      [params.id]
    );

    return NextResponse.json({ ...movie, shows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
