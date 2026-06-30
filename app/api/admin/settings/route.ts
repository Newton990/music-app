import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export const dynamic = "force-dynamic";

const SETTING_KEYS = [
  'paystack_public_key',
  'paystack_secret_key',
  'paynecta_api_key',
  'paynecta_email',
  'paynecta_payment_code',
  'paynecta_base_url',
  'site_name',
  'site_currency',
] as const;

const DEFAULTS: Record<string, string> = {
  paystack_public_key: '',
  paystack_secret_key: '',
  paynecta_api_key: '',
  paynecta_email: '',
  paynecta_payment_code: '',
  paynecta_base_url: 'https://paynecta.co.ke/api/v1',
  site_name: 'CinemaKE',
  site_currency: 'KES',
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await query<any[]>("SELECT `key`, `value` FROM Setting");
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, value } = await req.json();
    if (!key || !SETTING_KEYS.includes(key as any)) {
      return NextResponse.json({ error: "Invalid setting key" }, { status: 400 });
    }

    await execute(
      "INSERT INTO Setting (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [key, value, value]
    );

    return NextResponse.json({ success: true, key, value });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
