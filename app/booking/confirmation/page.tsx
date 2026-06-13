"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Ticket, Home } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId") ?? "";
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`).then(r => r.json()).then(data => { setBooking(data); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!booking) {
    return (
      <div className="pt-24 text-center">
        <p className="text-slate-400">Booking not found.</p>
        <button onClick={() => router.push("/")} className="btn-gold mt-4">Go Home</button>
      </div>
    );
  }

  const seats = typeof booking.seats === "string" ? JSON.parse(booking.seats) : booking.seats;
  const seatLabels = seats.map((s: any) => s.seatId.split("-").slice(-1)[0]);

  // Generate simulated QR code
  const qrData = booking.qrCode || `BK-${bookingId}`;
  const qrChars = qrData.split("").map((c: string) => c.charCodeAt(0));

  return (
    <div className="pt-20 pb-16 min-h-screen max-w-lg mx-auto px-4">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h1>
        <p className="text-slate-400">Your tickets have been booked successfully.</p>
      </div>

      <div className="card-cinema p-6 mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Ticket</h2>
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
            {booking.status === "confirmed" ? "Paid" : booking.status}
          </span>
        </div>

        <div className="bg-cinema-bg rounded-xl p-5 border border-cinema-border mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-lg font-bold text-white">{booking.movieTitle}</p>
              <p className="text-xs text-slate-400">{booking.cinemaName} · {booking.screenName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-sm text-white font-semibold">{formatDate(booking.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Time</p>
                <p className="text-sm text-white font-semibold">{formatTime(booking.startTime)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="text-sm text-white font-semibold">{booking.cinemaName}</p>
            </div>
          </div>

          <div className="border-t border-cinema-border pt-3">
            <p className="text-xs text-slate-500 mb-2">Seats</p>
            <div className="flex flex-wrap gap-2">
              {seats.map((s: any) => (
                <span key={s.seatId} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm font-bold text-amber-400">{s.seatId.split("-").slice(-1)[0]}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-xl">
            <div className="grid grid-cols-8 gap-0.5">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-sm ${qrChars[i % qrChars.length] % 3 === 0 ? "bg-black" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-xs text-slate-500 font-mono">{qrData}</p>
        </div>

        <div className="flex justify-between items-center border-t border-cinema-border pt-4">
          <div>
            <p className="text-xs text-slate-500">Total Paid</p>
            <p className="text-xl font-black text-amber-400">{formatCurrency(booking.totalAmount)}</p>
          </div>
          {booking.transactionRef && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Ref</p>
              <p className="text-xs text-slate-300 font-mono">{booking.transactionRef}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/dashboard" className="btn-gold flex items-center justify-center gap-2 py-4">
          <Home className="w-4 h-4" /> Go to Dashboard
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
