"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import MovieCard from "@/components/movies/MovieCard";
import type { Movie } from "@/lib/types";

const GENRES = ["All", "Action", "Drama", "Sci-Fi", "Thriller", "Romance", "Horror", "Comedy", "Adventure", "Historical"];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<"all" | "now_showing" | "coming_soon">("all");

  useEffect(() => {
    fetch("/api/movies").then(r => r.json()).then(data => { setMovies(data); setLoading(false); });
  }, []);

  const filtered = movies.filter((m) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.some((g) => g.toLowerCase().includes(search.toLowerCase()));
    const matchGenre = genre === "All" || m.genre.includes(genre);
    const matchStatus = status === "all" || m.status === status;
    return matchSearch && matchGenre && matchStatus;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          🎬 All Movies
        </h1>
        <div className="h-1 w-16 bg-gold-gradient rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search movies or genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-cinema pl-10"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(["all", "now_showing", "coming_soon"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                status === s
                  ? "bg-amber-500 text-black"
                  : "bg-cinema-card border border-cinema-border text-slate-300 hover:border-amber-500/40"
              }`}
            >
              {s === "all" ? "All" : s === "now_showing" ? "Now Showing" : "Coming Soon"}
            </button>
          ))}
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-8 horizontal-scroll">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              genre === g
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                : "bg-cinema-card border border-cinema-border text-slate-400 hover:text-slate-200 hover:border-slate-500"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-slate-400 text-sm mb-6">
        {filtered.length} movie{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎭</p>
          <p className="text-slate-300 text-lg font-semibold">No movies found</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} comingSoon={movie.status === "coming_soon"} />
          ))}
        </div>
      )}
    </div>
  );
}
