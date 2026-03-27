import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} at ${formatTime(iso)}`;
}

export function generateBookingId(): string {
  return `BK${Date.now().toString(36).toUpperCase()}`;
}

export function generateTransactionRef(method: string): string {
  const prefix = method === "mpesa" ? "MP" : method === "card" ? "CRD" : "WLT";
  return `${prefix}${Math.floor(Math.random() * 90000000 + 10000000)}`;
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function getSeatPrice(
  seatType: "standard" | "vip" | "premium",
  show: { price: number; vipPrice: number; premiumPrice: number }
): number {
  if (seatType === "premium") return show.premiumPrice;
  if (seatType === "vip") return show.vipPrice;
  return show.price;
}
