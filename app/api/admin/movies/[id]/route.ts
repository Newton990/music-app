import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, getOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getOne<any>("SELECT id FROM Movie WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, genre, duration, rating, imdbRating, description, director, cast, language, posterUrl, backdropUrl, status, releaseDate } = body;

    await query(
      `UPDATE Movie SET title=?, genre=?, duration=?, rating=?, imdbRating=?, description=?, director=?, cast=?, language=?, posterUrl=?, backdropUrl=?, status=?, releaseDate=? WHERE id=?`,
      [title, JSON.stringify(genre || []), Number(duration || 0), rating || "PG", Number(imdbRating || 0), description || "", director || "", JSON.stringify(cast || []), language || "English", posterUrl || "", backdropUrl || "", status || "now_showing", releaseDate || new Date().toISOString(), params.id]
    );

    return NextResponse.json({ message: "Movie updated" });
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

    const existing = await getOne<any>("SELECT id FROM Movie WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    await query("DELETE FROM Movie WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Movie deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
