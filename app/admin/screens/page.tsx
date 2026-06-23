"use client";
import { useEffect, useState } from "react";
import { Plus, Monitor, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ cinemaId: "", name: "", rows: "", cols: "" });

  const load = async () => {
    try {
      const [screensRes, cinemasRes] = await Promise.all([fetch("/api/admin/screens"), fetch("/api/cinemas")]);
      const screensData = await screensRes.json();
      const cinemasData = await cinemasRes.json();
      setScreens(Array.isArray(screensData) ? screensData : []);
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cinemaId || !form.name || !form.rows || !form.cols) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/screens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rows: Number(form.rows), cols: Number(form.cols) }) });
      if (!res.ok) throw new Error();
      toast.success("Screen created");
      setShowForm(false);
      setForm({ cinemaId: "", name: "", rows: "", cols: "" });
      load();
    } catch { toast.error("Failed to create screen"); }
  };

  const filtered = screens.filter((s) => (s.name || "").toLowerCase().includes(search.toLowerCase()) || (s.cinemaName || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="h-64 bg-cinema-card rounded-2xl" /></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Screens</h1>
          <p className="text-slate-400 text-sm mt-1">Manage cinema screens</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Add Screen
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Search screens..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-cinema pl-11" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card-cinema w-full max-w-md max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Screen</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Cinema *</label><select required value={form.cinemaId} onChange={(e) => setForm({ ...form, cinemaId: e.target.value })} className="input-cinema"><option value="">Select cinema</option>{cinemas.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.location}</option>)}</select></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Screen Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-cinema" placeholder="e.g. Screen 1, IMAX" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-400 mb-1 block">Rows *</label><input required type="number" min="1" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Cols *</label><input required type="number" min="1" value={form.cols} onChange={(e) => setForm({ ...form, cols: e.target.value })} className="input-cinema" /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-gold flex-1">Create Screen</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((screen) => (
          <div key={screen.id} className="card-cinema p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{screen.name}</h3>
                <p className="text-xs text-slate-400">{screen.cinemaName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span><span className="text-amber-400 font-semibold">{screen.rows}</span> rows</span>
              <span><span className="text-amber-400 font-semibold">{screen.cols}</span> cols</span>
              <span><span className="text-amber-400 font-semibold">{Number(screen.rows) * Number(screen.cols)}</span> seats</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 card-cinema">
            <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No screens found</p>
          </div>
        )}
      </div>
    </div>
  );
}
