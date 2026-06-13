"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Booking, Payment } from "@/lib/types";

interface BookingContextType {
  bookings: Booking[];
  payments: Payment[];
  reservedByShow: Record<string, string[]>;
  createBooking: (data: { showId: string; selectedSeats: { seatId: string; price: number }[]; totalAmount: number }) => Promise<{ id: string; status: string } | null>;
  processPayment: (bookingId: string, method: string, phone?: string) => Promise<{ success: boolean; ref: string }>;
  getUserBookings: () => Promise<Booking[]>;
  getShowReservedSeats: (showId: string) => Promise<string[]>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservedByShow, setReservedByShow] = useState<Record<string, string[]>>({});

  const createBooking = async (data: { showId: string; selectedSeats: { seatId: string; price: number }[]; totalAmount: number }) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json;
    } catch {
      return null;
    }
  };

  const processPayment = async (bookingId: string, method: string, phone?: string) => {
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, method, phone }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, ref: "" };
      if (json.transactionRef) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b)));
      }
      return { success: true, ref: json.transactionRef };
    } catch {
      return { success: false, ref: "" };
    }
  };

  const getUserBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) return [];
      const json = await res.json();
      setBookings(json);
      return json;
    } catch {
      return [];
    }
  };

  const getShowReservedSeats = async (showId: string) => {
    if (reservedByShow[showId]) return reservedByShow[showId];
    try {
      const res = await fetch(`/api/seats?showId=${showId}`);
      if (!res.ok) return [];
      const json = await res.json();
      const seats = json.reservedSeats || [];
      setReservedByShow((prev) => ({ ...prev, [showId]: seats }));
      return seats;
    } catch {
      return [];
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "PATCH" });
      if (!res.ok) return false;
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)));
      return true;
    } catch {
      return false;
    }
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
