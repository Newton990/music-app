import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseMovie(m: any) {
  return {
    ...m,
    genre: typeof m.genre === "string" ? JSON.parse(m.genre) : m.genre,
    cast: typeof m.cast === "string" ? JSON.parse(m.cast) : (m.cast || []),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const date = searchParams.get("date");

    let sql = "SELECT * FROM Movie WHERE 1=1";
    const params: any[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (genre) {
      sql += " AND genre LIKE ?";
      params.push(`%"${genre}"%`);
    }
    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (date) {
      sql = `SELECT DISTINCT m.* FROM Movie m JOIN \`Show\` sh ON sh.movieId = m.id WHERE DATE(sh.startTime) = ?`;
      params.push(date);
      if (status) { sql += " AND m.status = ?"; params.push(status); }
      if (genre) { sql += " AND m.genre LIKE ?"; params.push(`%"${genre}"%`); }
      if (search) { sql += " AND (m.title LIKE ? OR m.description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    }

    sql += date ? " ORDER BY m.status, m.releaseDate DESC" : " ORDER BY status, releaseDate DESC";

    const movies = await query<any[]>(sql, params);
    return NextResponse.json(movies.map(parseMovie));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
