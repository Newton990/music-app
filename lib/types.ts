// Mock data store — all state lives in-memory (no real DB)
// In a production app this would be backed by a real database.

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // plain text for demo
  role: UserRole;
  createdAt: string;
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
}

export interface Screen {
  id: string;
  cinemaId: string;
  name: string;
  rows: number;
  cols: number;
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  duration: number; // minutes
  rating: string; // PG, PG-13, R, etc.
  imdbRating: number;
  description: string;
  director: string;
  cast: string[];
  language: string;
  posterUrl: string;
  backdropUrl: string;
  status: "now_showing" | "coming_soon";
  releaseDate: string;
}

export interface Show {
  id: string;
  movieId: string;
  screenId: string;
  cinemaId: string;
  startTime: string; // ISO string
  endTime: string;
  price: number; // base price KES
  vipPrice: number;
  premiumPrice: number;
}

export type SeatType = "standard" | "vip" | "premium";
export type SeatStatus = "available" | "reserved" | "selected";

export interface Seat {
  id: string;
  screenId: string;
  row: string; // A, B, C...
  col: number;
  type: SeatType;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";
export type PaymentMethod = "mpesa" | "card" | "wallet";
export type PaymentStatus = "pending" | "success" | "failed";

export interface BookingSeat {
  seatId: string;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  seats: BookingSeat[];
  totalAmount: number;
  status: BookingStatus;
  qrCode: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  paidAt: string;
}
