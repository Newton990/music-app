"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Search, X, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", location: "" });

  const load = async () => {
    try {
      const res = await fetch("/api/admin/cinemas");
      const data = await res.json();
      setCinemas(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load cinemas"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      toast.error("Name and location are required");
      return;
    }
    try {
      if (editing) {
        const res = await fetch(`/api/admin/cinemas/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) throw new Error();
        toast.success("Cinema updated");
      } else {
        const res = await fetch("/api/admin/cinemas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || "Failed to create cinema"); return; }
        toast.success("Cinema created");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", location: "" });
      load();
    } catch { toast.error("Failed to save cinema"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this cinema? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/cinemas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Cinema deleted");
      load();
    } catch { toast.error("Failed to delete cinema"); }
  };

  const startEdit = (cinema: any) => {
    setForm({ name: cinema.name, location: cinema.location });
    setEditing(cinema);
    setShowForm(true);
  };

  const filtered = cinemas.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="h-64 bg-cinema-card rounded-2xl" /></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Cinemas</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all cinemas</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: "", location: "" }); setShowForm(true); }} className="btn-teal text-sm px-5 py-2.5 flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Add Cinema
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Search cinemas..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-cinema pl-11" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card-cinema w-full max-w-md max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? "Edit Cinema" : "Add Cinema"}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm({ name: "", location: "" }); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Cinema Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-cinema" placeholder="e.g. Kenya Highlands Cineplex" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Location *</label><input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-cinema" placeholder="e.g. Kericho Town, Kenya" /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-teal flex-1">{editing ? "Update Cinema" : "Create Cinema"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm({ name: "", location: "" }); }} className="btn-outline-teal flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cinema) => (
          <div key={cinema.id} className="card-cinema p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{cinema.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {cinema.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(cinema)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-slate-400 hover:text-teal-400" /></button>
                <button onClick={() => handleDelete(cinema.id)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" /></button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span><span className="text-teal-400 font-semibold">{cinema.screenCount ?? 0}</span> screens</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 card-cinema">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No cinemas found</p>
          </div>
        )}
      </div>
    </div>
  );
}
