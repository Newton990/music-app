"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { useBooking } from "@/context/booking-context";
import { useAuth } from "@/context/auth-context";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import type { Seat } from "@/lib/types";
import toast from "react-hot-toast";

export default function SeatSelectionPage({ params }: { params: { showId: string } }) {
  const { showId } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { getShowReservedSeats, createBooking } = useBooking();

  const [show, setShow] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/shows/${showId}`).then(r => r.json()),
      getShowReservedSeats(showId),
    ]).then(([showData, reserved]) => {
      if (cancelled) return;
      if (showData?.error) { setLoading(false); return; }
      setShow(showData);
      setSeats(showData.seats || []);
      setReservedIds(reserved);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [showId]);

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!show) return <div className="pt-24 text-center text-slate-400">Show not found</div>;

  const rows = Array.from(new Set(seats.map((s: any) => s.row))).sort();

  const getSeatPrice = (type: string) => {
    if (type === "premium") return show.premiumPrice;
    if (type === "vip") return show.vipPrice;
    return show.price;
  };

  const toggleSeat = (seat: any) => {
    if (reservedIds.includes(seat.id)) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 8) { toast.error("Maximum 8 seats per booking"); return prev; }
      return [...prev, seat];
    });
  };

  const getSeatClass = (seat: any) => {
    if (reservedIds.includes(seat.id)) return "seat-reserved";
    if (selectedSeats.find((s) => s.id === seat.id)) return "seat-selected";
    if (seat.type === "premium") return "seat-premium-available";
    if (seat.type === "vip") return "seat-vip-available";
    return "seat-available";
  };

  const total = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.type), 0);

  const handleContinue = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      router.push(`/login?redirect=/booking/${showId}/seats`);
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    const result = await createBooking({
      showId,
      selectedSeats: selectedSeats.map((seat) => ({ seatId: seat.id, price: getSeatPrice(seat.type) })),
      totalAmount: total,
    });
    if (!result) { toast.error("Failed to create booking. A selected seat may already be taken."); return; }
    router.push(`/booking/${showId}/payment?bookingId=${result.id}`);
  };

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="card-cinema p-5 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{show.movieTitle}</h1>
            <p className="text-slate-400 text-sm">{show.cinemaName} · {show.screenName}</p>
            <p className="text-amber-400 font-semibold text-sm mt-1">{formatDate(show.startTime)} at {formatTime(show.startTime)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Selected</p>
            <p className="text-2xl font-black text-amber-400">{selectedSeats.length}</p>
            <p className="text-xs text-slate-400">seat{selectedSeats.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block w-3/4 max-w-sm h-3 rounded-t-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-2" />
          <p className="text-xs text-slate-500 uppercase tracking-widest">SCREEN</p>
        </div>

        <div className="card-cinema p-6 mb-6 overflow-x-auto">
          <div className="min-w-max mx-auto">
            {rows.map((row) => {
              const rowSeats = seats.filter((s: any) => s.row === row).sort((a: any, b: any) => a.col - b.col);
              return (
                <div key={row} className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 text-xs text-slate-500 font-mono text-right shrink-0">{row}</span>
                  <div className="flex gap-1.5">
                    {rowSeats.map((seat: any) => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        className={`w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                        title={`${seat.row}${seat.col} — ${seat.type} — ${formatCurrency(getSeatPrice(seat.type))}`}
                      >
                        {seat.col}
                      </button>
                    ))}
                  </div>
                  <span className="w-5 text-xs text-slate-500 font-mono shrink-0">{row}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 justify-center text-xs">
          {[
            { label: "Standard", cls: "seat-available", price: formatCurrency(show.price) },
            { label: "VIP", cls: "seat-vip-available", price: formatCurrency(show.vipPrice) },
            { label: "Premium", cls: "seat-premium-available", price: formatCurrency(show.premiumPrice) },
            { label: "Selected", cls: "seat-selected", price: "" },
            { label: "Reserved", cls: "seat-reserved", price: "" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded text-[9px] flex items-center justify-center font-bold ${item.cls}`}>{item.label[0]}</div>
              <span className="text-slate-400">{item.label}{item.price ? ` · ${item.price}` : ""}</span>
            </div>
          ))}
        </div>

        {selectedSeats.length > 0 && (
          <div className="card-cinema p-5 mb-6 animate-slide-up">
            <h3 className="font-bold text-white mb-3">Selected Seats</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-amber-400 font-bold text-sm">{seat.row}{seat.col}</span>
                  <span className="text-slate-400 text-xs capitalize">({seat.type})</span>
                  <button onClick={() => toggleSeat(seat)} className="text-slate-500 hover:text-red-400 ml-1 transition-colors text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-cinema-border">
              <span className="text-slate-400">Total Amount</span>
              <span className="text-2xl font-black text-amber-400">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleContinue} disabled={selectedSeats.length === 0} className="btn-gold flex-1 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed">
            Continue to Payment
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          Seats are held for 10 minutes after selection
        </p>
      </div>
    </div>
  );
}
