import { getOne } from "./db";

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

async function getApiKey(): Promise<string> {
  if (process.env.PAYSTACK_SECRET_KEY) return process.env.PAYSTACK_SECRET_KEY;
  const setting = await getOne<any>("SELECT `value` FROM Setting WHERE `key` = 'paystack_secret_key'");
  return setting?.value || "";
}

async function request(method: string, endpoint: string, data?: any, apiKey?: string): Promise<PaystackResponse> {
  const key = apiKey || await getApiKey();
  if (!key) return { status: false, message: "Paystack secret key not configured" };

  const url = `https://api.paystack.co${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
}

export async function initializeTransaction(
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string,
  apiKey?: string
): Promise<PaystackResponse> {
  return request("POST", "/transaction/initialize", {
    email,
    amount: Math.round(amount * 100),
    reference,
    callback_url: callbackUrl,
  }, apiKey);
}

export async function verifyTransaction(reference: string, apiKey?: string): Promise<PaystackResponse> {
  return request("GET", `/transaction/verify/${reference}`, undefined, apiKey);
}
