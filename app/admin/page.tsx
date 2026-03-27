"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Film, Ticket, TrendingUp, Calendar as CalendarIcon, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBooking } from "@/context/booking-context";
import { MOCK_MOVIES, MOCK_SHOWS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { bookings, payments } = useBooking();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "movies" | "bookings">("overview");

  useEffect(() => {
    setMounted(true);
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!mounted || !user || user.role !== "admin") return null;

  // Stats
  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const ticketsSold = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.seats.length, 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            Admin Portal
          </h1>
          <p className="text-slate-400">System overview and management</p>
          <div className="h-1 w-16 bg-gold-gradient rounded-full mt-3" />
        </div>
        
        {/* Tabs */}
        <div className="flex bg-cinema-card border border-cinema-border rounded-xl p-1">
          {(["overview", "movies", "bookings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === t
                  ? "bg-amber-500/10 text-amber-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Tickets Sold", value: ticketsSold, icon: Ticket, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Active Movies", value: MOCK_MOVIES.filter(m => m.status === "now_showing").length, icon: Film, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Total Bookings", value: bookings.length, icon: CalendarIcon, color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map((stat, i) => (
              <div key={i} className="card-cinema p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="card-cinema p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                <button onClick={() => setActiveTab("bookings")} className="text-xs text-amber-400 hover:text-amber-300">View All</button>
              </div>
              <div className="space-y-4">
                {recentBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-white">#{b.id.split("-")[0]}</p>
                      <p className="text-xs text-slate-400">{b.seats.length} ticket(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{formatCurrency(b.totalAmount)}</p>
                      <p className={`text-[10px] uppercase font-bold ${
                        b.status === "confirmed" ? "text-green-400" : "text-slate-400"
                      }`}>{b.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-cinema p-6">
              <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border border-cinema-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-cinema-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Film className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Add Movie</span>
                </button>
                <button className="p-4 border border-cinema-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-cinema-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Schedule Show</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "movies" && (
        <div className="card-cinema overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-cinema-border flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" /> Movie Catalog
            </h2>
            <button className="btn-gold text-sm py-2 px-4 shadow-none">
              + New Movie
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-cinema-bg border-b border-cinema-border">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MOVIES.map((movie) => (
                  <tr key={movie.id} className="border-b border-cinema-border hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{movie.title}</td>
                    <td className="px-6 py-4">{formatDate(movie.releaseDate)}</td>
                    <td className="px-6 py-4">{movie.rating}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold ${
                        movie.status === "now_showing" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {movie.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="card-cinema overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-cinema-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> All Bookings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-cinema-bg border-b border-cinema-border">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Seats</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking) => (
                  <tr key={booking.id} className="border-b border-cinema-border hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{booking.id.split("-")[0]}</td>
                    <td className="px-6 py-4">{formatDate(booking.createdAt)}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{formatCurrency(booking.totalAmount)}</td>
                    <td className="px-6 py-4">{booking.seats.length}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold ${
                        booking.status === "confirmed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
