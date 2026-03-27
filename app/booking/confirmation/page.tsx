"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Share2, Calendar, MapPin, Ticket, QrCode, Home } from "lucide-react";
import { useBooking } from "@/context/booking-context";
import { MOCK_MOVIES, MOCK_SHOWS, MOCK_CINEMAS, MOCK_SCREENS } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId") ?? "";
  const { bookings, payments } = useBooking();

  const booking = bookings.find((b) => b.id === bookingId);
  const payment = payments.find((p) => p.bookingId === bookingId);
  const show = booking ? MOCK_SHOWS.find((s) => s.id === booking.showId) : null;
  const movie = show ? MOCK_MOVIES.find((m) => m.id === show.movieId) : null;
  const cinema = show ? MOCK_CINEMAS.find((c) => c.id === show.cinemaId) : null;
  const screen = show ? MOCK_SCREENS.find((s) => s.id === show.screenId) : null;

  if (!booking || !movie || !show) {
    return (
      <div className="pt-24 text-center">
        <p className="text-slate-400">Booking not found.</p>
        <button onClick={() => router.push("/")} className="btn-gold mt-4">Go Home</button>
      </div>
    );
  }

  const seatLabels = booking.seats.map((s) => {
    const parts = s.seatId.split("-");
    return parts[parts.length - 1];
  });

  return (
    <div className="pt-20 pb-16 min-h-screen max-w-lg mx-auto px-4">
      {/* Success header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Booking Confirmed!</h1>
        <p className="text-slate-400 text-sm">Your tickets are ready. Enjoy the show! 🎬</p>
      </div>

      {/* Ticket card */}
      <div className="card-cinema overflow-hidden mb-6 animate-slide-up">
        {/* Top colored band */}
        <div className="h-2 bg-gold-gradient" />

        <div className="p-6">
          {/* Movie title */}
          <h2 className="text-xl font-black text-white mb-1">{movie.title}</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {movie.genre.map((g) => <span key={g} className="badge-genre">{g}</span>)}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-semibold text-white">{formatDate(show.startTime)}</p>
              <p className="text-sm text-amber-400 font-bold">{formatTime(show.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cinema</p>
              <p className="text-sm font-semibold text-white line-clamp-1">{cinema?.name}</p>
              <p className="text-xs text-slate-400">{screen?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Seats</p>
              <div className="flex flex-wrap gap-1">
                {seatLabels.map((s) => (
                  <span key={s} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-lg font-black text-amber-400">{formatCurrency(booking.totalAmount)}</p>
              {payment && (
                <p className="text-xs text-slate-500 capitalize">{payment.method}</p>
              )}
            </div>
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-cinema-border my-4 relative">
            <div className="absolute -left-6 -top-3 w-6 h-6 rounded-full bg-cinema-bg" />
            <div className="absolute -right-6 -top-3 w-6 h-6 rounded-full bg-cinema-bg" />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-4">
            <div className="qr-container mb-3">
              {/* Simulated QR Code grid */}
              <div className="w-36 h-36 grid grid-cols-9 gap-0.5">
                {Array.from({ length: 81 }).map((_, i) => {
                  const hash = (booking.id.charCodeAt(i % booking.id.length) + i * 7) % 3;
                  return (
                    <div
                      key={i}
                      className={`rounded-sm ${hash === 0 ? "bg-black" : "bg-white"}`}
                    />
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono">{booking.id}</p>
            <p className="text-xs text-slate-600 mt-1">Show this at the cinema entrance</p>
          </div>

          {/* Payment ref */}
          {payment && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 mt-2">
              <p className="text-xs text-green-400">
                ✅ Payment confirmed · Ref: <span className="font-mono font-bold">{payment.transactionRef}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="btn-outline-gold flex items-center justify-center gap-2 text-sm py-3">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="btn-outline-gold flex items-center justify-center gap-2 text-sm py-3">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="btn-outline-gold flex items-center justify-center gap-2 text-sm py-3">
          <Ticket className="w-4 h-4" />
          My Bookings
        </Link>
        <Link href="/" className="btn-gold flex items-center justify-center gap-2 text-sm py-3">
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-slate-400">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
