"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useBooking } from "@/context/booking-context";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Ticket, Calendar, MapPin, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { getUserBookings, payments } = useBooking();
  const [bookings, setBookings] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/login?redirect=/dashboard");
    else getUserBookings().then(setBookings);
  }, [user, router]);

  if (!mounted || !user) return null;

  const userBookings = bookings
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user.name}</p>
          <div className="h-1 w-16 bg-teal-gradient rounded-full mt-3" />
        </div>
        <div className="card-cinema px-6 py-4 flex gap-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-2xl font-black text-teal-400">{userBookings.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tickets Bought</p>
            <p className="text-2xl font-black text-white">
              {userBookings.reduce((sum, b) => sum + b.seats.length, 0)}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-teal-400" />
        Booking History
      </h2>

      {userBookings.length === 0 ? (
        <div className="text-center py-20 card-cinema">
          <p className="text-5xl mb-4">🎟️</p>
          <p className="text-slate-300 text-lg font-semibold">No bookings yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">You haven&apos;t booked any movie tickets.</p>
          <button onClick={() => router.push("/movies")} className="btn-teal mx-auto">
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBookings.map((booking: any) => {
            const isUpcoming = booking.startTime && new Date(booking.startTime) > new Date();

            return (
              <div
                key={booking.id}
                className={`card-cinema overflow-hidden transition-all ${
                  isUpcoming ? "border-teal-500/30 shadow-[0_4px_20px_rgba(45,212,191,0.05)]" : "opacity-80"
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      isUpcoming ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{booking.id.split("-")[0]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">
                    {booking.movieTitle ?? "Unknown Movie"}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                      {booking.startTime ? formatDate(booking.startTime) : "N/A"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                      {booking.startTime ? formatTime(booking.startTime) : "N/A"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="line-clamp-1">{booking.cinemaName ?? "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-5">
                    {(typeof booking.seats === "string" ? JSON.parse(booking.seats) : booking.seats).map((s: any) => (
                      <span key={s.seatId} className="text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400">
                        {s.seatId.split("-").slice(-1)[0]}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-cinema-border pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-bold text-teal-400">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => router.push(`/booking/confirmation?bookingId=${booking.id}`)}
                        className="text-xs px-3 py-1.5 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-colors"
                      >
                        View Ticket
                      </button>
                    )}
                    {booking.status === "pending" && (
                      <button
                        onClick={() => router.push(`/booking/${booking.showId}/payment?bookingId=${booking.id}`)}
                        className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
