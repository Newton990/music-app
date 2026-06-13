const BASE_URL = process.env.PAYNECTA_BASE_URL || "https://paynecta.co.ke/api/v1";
const API_KEY = process.env.PAYNECTA_API_KEY || "";
const EMAIL = process.env.PAYNECTA_EMAIL || "";

interface PaynectaResponse {
  success: boolean;
  message: string;
  data?: any;
}

async function request(method: string, endpoint: string, data?: any): Promise<PaynectaResponse> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      "X-API-Key": API_KEY,
      "X-User-Email": EMAIL,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
}

export async function initializePayment(code: string, mobileNumber: string, amount: number) {
  const formatted = mobileNumber.replace(/[\s\-\+]/g, "");
  const msisdn = formatted.startsWith("0")
    ? "254" + formatted.slice(1)
    : formatted.startsWith("254")
      ? formatted
      : "254" + formatted;

  return request("POST", "/payment/initialize", {
    code,
    mobile_number: msisdn,
    amount,
  });
}

export async function queryPaymentStatus(transactionRef: string) {
  return request("GET", `/payment/status?transaction_reference=${transactionRef}`);
}
