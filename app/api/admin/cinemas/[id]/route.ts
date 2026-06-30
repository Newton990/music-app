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

    const existing = await getOne<any>("SELECT id FROM Cinema WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Cinema not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, location, imageUrl } = body;

    await query(
      "UPDATE Cinema SET name=?, location=?, imageUrl=? WHERE id=?",
      [name, location, imageUrl || "", params.id]
    );

    return NextResponse.json({ message: "Cinema updated" });
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

    const existing = await getOne<any>("SELECT id FROM Cinema WHERE id = ?", [params.id]);
    if (!existing) {
      return NextResponse.json({ error: "Cinema not found" }, { status: 404 });
    }

    await query("DELETE FROM Cinema WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Cinema deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
