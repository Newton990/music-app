"use client";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Calendar, Film, Ticket } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-6"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-28 bg-cinema-card rounded-2xl" /><div className="h-28 bg-cinema-card rounded-2xl" /><div className="h-28 bg-cinema-card rounded-2xl" /></div></div></div>;

  if (!data) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><p className="text-slate-400">Failed to load reports</p></div>;

  const confirmedPct = data.totalBookings > 0 ? ((data.confirmedBookings / data.totalBookings) * 100).toFixed(1) : "0";
  const cancelledPct = data.totalBookings > 0 ? ((data.cancelledBookings / data.totalBookings) * 100).toFixed(1) : "0";

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Sales Reports</h1>
          <p className="text-slate-400">Platform performance and analytics</p>
          <div className="h-1 w-16 bg-teal-gradient rounded-full mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-400" /></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p></div>
          </div>
          <p className="text-3xl font-black text-green-400">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">From confirmed bookings</p>
        </div>

        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Ticket className="w-5 h-5 text-blue-400" /></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Bookings</p></div>
          </div>
          <p className="text-3xl font-black text-blue-400">{data.totalBookings}</p>
          <div className="flex gap-4 mt-1 text-xs">
            <span className="text-green-400">{data.confirmedBookings} confirmed</span>
            <span className="text-yellow-400">{data.pendingBookings} pending</span>
            <span className="text-red-400">{data.cancelledBookings} cancelled</span>
          </div>
        </div>

        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-400" /></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider">Shows</p></div>
          </div>
          <p className="text-3xl font-black text-purple-400">{data.totalShows}</p>
          <div className="flex gap-4 mt-1 text-xs">
            <span className="text-teal-400">{data.upcomingShows} upcoming</span>
            <span className="text-slate-400">{data.todayShows} today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white">Popular Movies</h3>
          </div>
          {data.popularMovies.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.popularMovies.map((m: any, i: number) => (
                <div key={m.id} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{m.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{m.bookingCount} bookings</span>
                      <span>{formatCurrency(m.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-cinema-bg rounded-full overflow-hidden">
                    <div className="h-full bg-teal-gradient rounded-full" style={{ width: `${Math.min(100, (m.bookingCount / Math.max(...data.popularMovies.map((x: any) => x.bookingCount))) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white">Booking Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Confirmed</span><span className="text-green-400 font-semibold">{data.confirmedBookings} ({confirmedPct}%)</span></div>
              <div className="h-2.5 bg-cinema-bg rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${confirmedPct}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Pending</span><span className="text-yellow-400 font-semibold">{data.pendingBookings} ({data.totalBookings > 0 ? ((data.pendingBookings / data.totalBookings) * 100).toFixed(1) : "0"}%)</span></div>
              <div className="h-2.5 bg-cinema-bg rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: `${data.totalBookings > 0 ? (data.pendingBookings / data.totalBookings) * 100 : 0}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Cancelled</span><span className="text-red-400 font-semibold">{data.cancelledBookings} ({cancelledPct}%)</span></div>
              <div className="h-2.5 bg-cinema-bg rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${cancelledPct}%` }} /></div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-teal-400" />
              Monthly Revenue
            </h4>
            {data.monthlyRevenue.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No revenue data yet</p>
            ) : (
              <div className="space-y-2">
                {data.monthlyRevenue.slice(0, 6).map((m: any) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-16">{m.month}</span>
                    <div className="flex-1 h-4 bg-cinema-bg rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (m.revenue / Math.max(...data.monthlyRevenue.map((x: any) => x.revenue))) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-teal-400 font-semibold w-24 text-right">{formatCurrency(m.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
