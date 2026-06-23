"use client";
import { useEffect, useState } from "react";
import { Film, Clapperboard, Ticket, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-6"><div className="h-8 w-64 bg-cinema-card rounded" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="h-32 bg-cinema-card rounded-2xl" /><div className="h-32 bg-cinema-card rounded-2xl" /><div className="h-32 bg-cinema-card rounded-2xl" /><div className="h-32 bg-cinema-card rounded-2xl" /></div></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage your cinema platform</p>
          <div className="h-1 w-16 bg-gold-gradient rounded-full mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Film} label="Total Movies" value={stats?.totalMovies ?? 0} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={Clapperboard} label="Total Shows" value={stats?.totalShows ?? 0} color="text-purple-400" bg="bg-purple-500/10" />
        <StatCard icon={Ticket} label="Total Bookings" value={stats?.totalBookings ?? 0} color="text-green-400" bg="bg-green-500/10" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Booking Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Confirmed</span><span className="text-green-400 font-semibold">{stats?.totalBookings ? stats.totalBookings - (stats.pendingBookings + stats.cancelledBookings) : 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Pending</span><span className="text-yellow-400 font-semibold">{stats?.pendingBookings ?? 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Cancelled</span><span className="text-red-400 font-semibold">{stats?.cancelledBookings ?? 0}</span></div>
          </div>
        </div>

        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Revenue</h3>
          </div>
          <p className="text-3xl font-black text-amber-400">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
          <p className="text-xs text-slate-500 mt-1">Total confirmed revenue</p>
        </div>

        <div className="card-cinema p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <a href="/admin/movies" className="block w-full text-center btn-outline-gold text-sm py-2">Manage Movies</a>
            <a href="/admin/shows" className="block w-full text-center btn-outline-gold text-sm py-2">Manage Shows</a>
            <a href="/admin/bookings" className="block w-full text-center btn-outline-gold text-sm py-2">View Bookings</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="card-cinema p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}
