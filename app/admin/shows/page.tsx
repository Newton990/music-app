"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Clapperboard, Search, X } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ movieId: "", screenId: "", cinemaId: "", startTime: "", price: "", vipPrice: "", premiumPrice: "" });

  const load = async () => {
    try {
      const [showsRes, moviesRes, screensRes] = await Promise.all([
        fetch("/api/admin/shows"), fetch("/api/admin/movies"), fetch("/api/admin/screens"),
      ]);
      setShows(await showsRes.json());
      setMovies(await moviesRes.json());
      setScreens(await screensRes.json());
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const screen = screens.find((s) => s.id === form.screenId);
    const payload = { ...form, price: Number(form.price), vipPrice: Number(form.vipPrice || form.price), premiumPrice: Number(form.premiumPrice || form.price), cinemaId: screen?.cinemaId || form.cinemaId };

    try {
      if (editing) {
        const res = await fetch(`/api/admin/shows/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        toast.success("Show updated");
      } else {
        const res = await fetch("/api/admin/shows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        toast.success("Show created");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ movieId: "", screenId: "", cinemaId: "", startTime: "", price: "", vipPrice: "", premiumPrice: "" });
      load();
    } catch { toast.error("Failed to save show"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this show?")) return;
    try {
      const res = await fetch(`/api/admin/shows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Show deleted");
      load();
    } catch { toast.error("Failed to delete show"); }
  };

  const startEdit = (show: any) => {
    setForm({
      movieId: show.movieId, screenId: show.screenId, cinemaId: show.cinemaId,
      startTime: new Date(show.startTime).toISOString().slice(0, 16),
      price: String(show.price), vipPrice: String(show.vipPrice), premiumPrice: String(show.premiumPrice),
    });
    setEditing(show);
    setShowForm(true);
  };

  const filtered = shows.filter((s) => (s.movieTitle || "").toLowerCase().includes(search.toLowerCase()));

  const getMovieDuration = (movieId: string) => {
    const m = movies.find((mv) => mv.id === movieId);
    return m ? m.duration : 0;
  };

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="h-64 bg-cinema-card rounded-2xl" /></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Shows</h1>
          <p className="text-slate-400 text-sm mt-1">Manage movie showtimes</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ movieId: "", screenId: "", cinemaId: "", startTime: "", price: "", vipPrice: "", premiumPrice: "" }); setShowForm(true); }} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Add Show
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Search shows..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-cinema pl-11" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card-cinema w-full max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? "Edit Show" : "Add Show"}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Movie *</label><select required value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} className="input-cinema"><option value="">Select movie</option>{movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Screen *</label><select required value={form.screenId} onChange={(e) => { const sc = screens.find((s) => s.id === e.target.value); setForm({ ...form, screenId: e.target.value, cinemaId: sc?.cinemaId || "" }); }} className="input-cinema"><option value="">Select screen</option>{screens.map((s) => <option key={s.id} value={s.id}>{s.cinemaName} - {s.name}</option>)}</select></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Start Time *</label><input required type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-cinema" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-slate-400 mb-1 block">Price (KES) *</label><input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">VIP Price</label><input type="number" value={form.vipPrice} onChange={(e) => setForm({ ...form, vipPrice: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Premium Price</label><input type="number" value={form.premiumPrice} onChange={(e) => setForm({ ...form, premiumPrice: e.target.value })} className="input-cinema" /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-gold flex-1">{editing ? "Update Show" : "Create Show"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline-gold flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-cinema overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Movie</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Cinema / Screen</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Start Time</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((show) => (
                <tr key={show.id} className="border-b border-cinema-border/50 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 rounded bg-cinema-card border border-cinema-border overflow-hidden shrink-0">
                        {show.posterUrl ? <img src={show.posterUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Clapperboard className="w-3 h-3 text-slate-600" /></div>}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{show.movieTitle}</p>
                        <p className="text-xs text-slate-500">{show.cinemaName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{show.screenName}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(show.startTime)}</td>
                  <td className="px-4 py-3 text-sm text-amber-400 font-semibold">{formatCurrency(show.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(show)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-400" /></button>
                      <button onClick={() => handleDelete(show.id)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">No shows found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
