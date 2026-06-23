import { NextRequest, NextResponse } from "next/server";
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

    const movies = await query<any[]>("SELECT * FROM Movie ORDER BY createdAt DESC");
    return NextResponse.json(
      movies.map((m: any) => ({
        ...m,
        genre: typeof m.genre === "string" ? JSON.parse(m.genre) : m.genre,
        cast: typeof m.cast === "string" ? JSON.parse(m.cast) : (m.cast || []),
      }))
    );
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
    const { title, genre, duration, rating, imdbRating, description, director, cast, language, posterUrl, backdropUrl, status, releaseDate } = body;

    if (!title || !duration || !genre) {
      return NextResponse.json({ error: "Title, duration, and genre are required" }, { status: 400 });
    }

    const id = `mv${Date.now()}`;
    await query(
      `INSERT INTO Movie (id, title, genre, duration, rating, imdbRating, description, director, cast, language, posterUrl, backdropUrl, status, releaseDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, JSON.stringify(genre), Number(duration), rating || "PG", Number(imdbRating || 0), description || "", director || "", JSON.stringify(cast || []), language || "English", posterUrl || "", backdropUrl || "", status || "now_showing", releaseDate || new Date().toISOString()]
    );

    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
