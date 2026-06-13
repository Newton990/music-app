import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

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

  sql += " ORDER BY status, releaseDate DESC";

  const movies = await query<any[]>(sql, params);
  return NextResponse.json(movies.map(m => ({ ...m, genre: typeof m.genre === "string" ? JSON.parse(m.genre) : m.genre })));
}
