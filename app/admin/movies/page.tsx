"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Film, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "", genre: "", duration: "", rating: "PG", imdbRating: "",
    description: "", director: "", cast: "", language: "English",
    posterUrl: "", backdropUrl: "", status: "now_showing", releaseDate: "",
  });

  const load = async () => {
    try {
      const res = await fetch("/api/admin/movies");
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load movies"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      genre: form.genre.split(",").map((g: string) => g.trim()).filter(Boolean),
      cast: form.cast.split(",").map((c: string) => c.trim()).filter(Boolean),
      duration: Number(form.duration),
      imdbRating: Number(form.imdbRating),
    };

    try {
      if (editing) {
        const res = await fetch(`/api/admin/movies/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        toast.success("Movie updated");
      } else {
        const res = await fetch("/api/admin/movies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        toast.success("Movie created");
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      load();
    } catch { toast.error("Failed to save movie"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    try {
      const res = await fetch(`/api/admin/movies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Movie deleted");
      load();
    } catch { toast.error("Failed to delete movie"); }
  };

  const startEdit = (movie: any) => {
    setForm({
      title: movie.title, genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre,
      duration: String(movie.duration), rating: movie.rating, imdbRating: String(movie.imdbRating),
      description: movie.description, director: movie.director,
      cast: Array.isArray(movie.cast) ? movie.cast.join(", ") : movie.cast,
      language: movie.language, posterUrl: movie.posterUrl, backdropUrl: movie.backdropUrl,
      status: movie.status, releaseDate: movie.releaseDate,
    });
    setEditing(movie);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: "", genre: "", duration: "", rating: "PG", imdbRating: "", description: "", director: "", cast: "", language: "English", posterUrl: "", backdropUrl: "", status: "now_showing", releaseDate: "" });
    setEditing(null);
  };

  const filtered = movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-cinema-card rounded" /><div className="h-64 bg-cinema-card rounded-2xl" /></div></div>;

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Movies</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all movies</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-cinema pl-11" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card-cinema w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? "Edit Movie" : "Add Movie"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 mb-1 block">Title *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Genre (comma-separated) *</label><input required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Duration (min) *</label><input required type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Rating</label><select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="input-cinema"><option value="G">G</option><option value="PG">PG</option><option value="PG-13">PG-13</option><option value="R">R</option><option value="16+">16+</option><option value="18+">18+</option></select></div>
                <div><label className="text-xs text-slate-400 mb-1 block">IMDb Rating</label><input type="number" step="0.1" value={form.imdbRating} onChange={(e) => setForm({ ...form, imdbRating: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Language</label><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-cinema"><option value="now_showing">Now Showing</option><option value="coming_soon">Coming Soon</option></select></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Release Date</label><input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Director</label><input value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Cast (comma-separated)</label><input value={form.cast} onChange={(e) => setForm({ ...form, cast: e.target.value })} className="input-cinema" /></div>
                <div className="md:col-span-2"><label className="text-xs text-slate-400 mb-1 block">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Poster URL</label><input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} className="input-cinema" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Backdrop URL</label><input value={form.backdropUrl} onChange={(e) => setForm({ ...form, backdropUrl: e.target.value })} className="input-cinema" /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-gold flex-1">{editing ? "Update Movie" : "Create Movie"}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-outline-gold flex-1">Cancel</button>
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
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Genre</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Duration</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Rating</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((movie) => (
                <tr key={movie.id} className="border-b border-cinema-border/50 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-cinema-card border border-cinema-border overflow-hidden shrink-0">
                        {movie.posterUrl ? <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-slate-600" /></div>}
                      </div>
                      <span className="text-white text-sm font-medium">{movie.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(movie.genre) ? movie.genre : []).map((g: string) => (
                        <span key={g} className="badge-genre text-[10px]">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{movie.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${movie.status === "now_showing" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="badge-rating text-[10px]">{movie.rating}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(movie)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-400" /></button>
                      <button onClick={() => handleDelete(movie.id)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No movies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
