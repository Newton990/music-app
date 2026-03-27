"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Booking, Payment } from "@/lib/types";
import { MOCK_BOOKINGS, MOCK_PAYMENTS, RESERVED_SEATS_BY_SHOW } from "@/lib/mock-data";
import { generateBookingId, generateTransactionRef } from "@/lib/utils";

const BOOKING_KEY = "cinema_bookings";
const PAYMENT_KEY = "cinema_payments";
const RESERVED_KEY = "cinema_reserved";

interface BookingContextType {
  bookings: Booking[];
  payments: Payment[];
  reservedByShow: Record<string, string[]>;
  createBooking: (booking: Omit<Booking, "id" | "createdAt" | "qrCode">) => Booking;
  processPayment: (bookingId: string, method: string, amount: number) => Promise<{ success: boolean; ref: string }>;
  getUserBookings: (userId: string) => Booking[];
  getShowReservedSeats: (showId: string) => string[];
  cancelBooking: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const s = sessionStorage.getItem(key);
  if (s) { try { return JSON.parse(s); } catch { /* */ } }
  sessionStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function save(key: string, val: unknown) {
  if (typeof window !== "undefined") sessionStorage.setItem(key, JSON.stringify(val));
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservedByShow, setReservedByShow] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setBookings(load(BOOKING_KEY, MOCK_BOOKINGS));
    setPayments(load(PAYMENT_KEY, MOCK_PAYMENTS));
    setReservedByShow(load(RESERVED_KEY, RESERVED_SEATS_BY_SHOW));
  }, []);

  const createBooking = (data: Omit<Booking, "id" | "createdAt" | "qrCode">): Booking => {
    const booking: Booking = {
      ...data,
      id: generateBookingId(),
      qrCode: `${generateBookingId()}-QR-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookings, booking];
    setBookings(updated);
    save(BOOKING_KEY, updated);

    // Lock seats for show
    const seatIds = data.seats.map((s) => s.seatId);
    const updatedReserved = {
      ...reservedByShow,
      [data.showId]: [...(reservedByShow[data.showId] ?? []), ...seatIds],
    };
    setReservedByShow(updatedReserved);
    save(RESERVED_KEY, updatedReserved);

    return booking;
  };

  const processPayment = async (
    bookingId: string,
    method: string,
    amount: number
  ): Promise<{ success: boolean; ref: string }> => {
    await new Promise((r) => setTimeout(r, 2000)); // simulate gateway delay
    const success = Math.random() > 0.05; // 95% success rate
    const ref = generateTransactionRef(method);

    const payment: Payment = {
      id: `py${Date.now()}`,
      bookingId,
      amount,
      method: method as any,
      status: success ? "success" : "failed",
      transactionRef: ref,
      paidAt: new Date().toISOString(),
    };

    const updatedP = [...payments, payment];
    setPayments(updatedP);
    save(PAYMENT_KEY, updatedP);

    if (success) {
      const updatedB = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "confirmed" as const } : b
      );
      setBookings(updatedB);
      save(BOOKING_KEY, updatedB);
    }

    return { success, ref };
  };

  const getUserBookings = (userId: string) =>
    bookings.filter((b) => b.userId === userId);

  const getShowReservedSeats = (showId: string) =>
    reservedByShow[showId] ?? [];

  const cancelBooking = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    setBookings(updated);
    save(BOOKING_KEY, updated);
  };

  return (
    <BookingContext.Provider
      value={{ bookings, payments, reservedByShow, createBooking, processPayment, getUserBookings, getShowReservedSeats, cancelBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be inside BookingProvider");
  return ctx;
}
