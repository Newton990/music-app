import { NextResponse } from "next/server";
import { getOne, query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const movie = await getOne<any>("SELECT * FROM Movie WHERE id = ?", [params.id]);
  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

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
}
