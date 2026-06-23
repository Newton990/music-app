"use client";
import { useEffect, useState } from "react";
import { Ticket, Search, Eye } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      setBookings(data);
    } catch { toast.error("Failed to load bookings"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      case "refunded": return "bg-blue-500/20 text-blue-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="h-64 bg-cinema-card rounded-2xl" /></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">View and manage all bookings</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search by booking ID, movie, or user..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-cinema pl-11 pr-12" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-300 font-medium px-2 py-1">Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {["", "confirmed", "pending", "cancelled", "refunded"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-2 rounded-lg border transition-all ${statusFilter === s ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "border-cinema-border text-slate-400 hover:border-slate-600"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card-cinema overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Booking ID</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Movie</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-cinema-border/50 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs font-mono text-slate-300">#{b.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{b.userName}</p>
                    <p className="text-xs text-slate-500">{b.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{b.movieTitle}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-400 font-semibold">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(b.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/booking/confirmation?bookingId=${b.id}`} className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium">
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
