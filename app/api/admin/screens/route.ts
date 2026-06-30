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

    const screens = await query<any[]>(
      `SELECT sc.*, ci.name as cinemaName
       FROM Screen sc
       JOIN Cinema ci ON ci.id = sc.cinemaId
       ORDER BY ci.name, sc.name`
    );

    return NextResponse.json(screens);
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
    const { cinemaId, name, rows, cols } = body;

    if (!cinemaId || !name || !rows || !cols) {
      return NextResponse.json({ error: "cinemaId, name, rows, and cols are required" }, { status: 400 });
    }

    const id = `sc${Date.now()}`;
    const numRows = Number(rows);
    const numCols = Number(cols);
    await query(
      "INSERT INTO Screen (id, cinemaId, name, `rows`, `cols`) VALUES (?, ?, ?, ?, ?)",
      [id, cinemaId, name, numRows, numCols]
    );

    // Generate seats for the screen
    const seatValues: string[] = [];
    const seatParams: any[] = [];
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < numRows; r++) {
      const rowLabel = rowLetters[r] || `R${r + 1}`;
      // Last 2 rows are VIP, first 2 rows premium, rest standard
      let seatType = "standard";
      if (numRows - r <= 2) seatType = "vip";
      else if (r < 2) seatType = "premium";

      for (let c = 1; c <= numCols; c++) {
        seatValues.push("(?,?,?,?,?)");
        seatParams.push(`st${id}-${rowLabel}${c}`, id, rowLabel, c, seatType);
      }
    }
    if (seatValues.length > 0) {
      await query(
        `INSERT INTO Seat (id, screenId, \`row\`, col, type) VALUES ${seatValues.join(",")}`,
        seatParams
      );
    }

    return NextResponse.json({ id, cinemaId, name, rows: numRows, cols: numCols, seatsGenerated: seatValues.length }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
