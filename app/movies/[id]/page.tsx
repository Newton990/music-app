"use client";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Star, Clock, Calendar, Globe, User, ArrowLeft, Ticket, ChevronRight
} from "lucide-react";
import { MOCK_MOVIES, MOCK_SHOWS, MOCK_CINEMAS, MOCK_SCREENS } from "@/lib/mock-data";
import { formatDuration, formatTime, formatDate, formatCurrency } from "@/lib/utils";
import { use } from "react";

const POSTER_BG: Record<string, string> = {
  m1: "linear-gradient(145deg, #0d1b3e, #1a237e, #0d47a1)",
  m2: "linear-gradient(145deg, #4a1000, #b71c1c, #7b2d0a)",
  m3: "linear-gradient(145deg, #2e1a00, #5d3a00, #ff8f00)",
  m4: "linear-gradient(145deg, #4a0e2a, #880e4f, #c62828)",
  m5: "linear-gradient(145deg, #0a2e1a, #1b5e20, #004d40)",
  m6: "linear-gradient(145deg, #1a0a2e, #4a148c, #1a237e)",
  m7: "linear-gradient(145deg, #0a2e0a, #2e7d32, #43a047)",
  m8: "linear-gradient(145deg, #3e0000, #b71c1c, #8b0000)",
};
const POSTER_EMOJI: Record<string, string> = {
  m1: "🚀", m2: "🔥", m3: "⚔️", m4: "🌸", m5: "👻", m6: "🌌", m7: "💍", m8: "🔴",
};

// Group shows by date
function groupShowsByDate(shows: typeof MOCK_SHOWS) {
  const groups: Record<string, typeof MOCK_SHOWS> = {};
  shows.forEach((s) => {
    const day = new Date(s.startTime).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(s);
  });
  return groups;
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const movie = MOCK_MOVIES.find((m) => m.id === id);
  if (!movie) return notFound();

  const shows = MOCK_SHOWS.filter((s) => s.movieId === id);
  const showGroups = groupShowsByDate(shows);
  const dates = Object.keys(showGroups);
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");

  const dayShows = showGroups[selectedDate] ?? [];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-end overflow-hidden bg-slate-900">
        <Image src={movie.backdropUrl || movie.posterUrl} alt={movie.title} fill className="object-cover opacity-40 mix-blend-screen" priority />
        <div className="absolute inset-0 bg-hero-gradient z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-wrap gap-2 mb-3">
            {movie.genre.map((g) => (
              <span key={g} className="badge-genre">{g}</span>
            ))}
            <span className="badge-rating">{movie.rating}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">{movie.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{movie.imdbRating}</span>/10
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatDuration(movie.duration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              {movie.language}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatDate(movie.releaseDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="card-cinema p-6">
              <h2 className="text-lg font-bold text-white mb-3">Synopsis</h2>
              <p className="text-slate-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Cast & Crew */}
            <div className="card-cinema p-6">
              <h2 className="text-lg font-bold text-white mb-4">Cast & Crew</h2>
              <div className="mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Director</p>
                <p className="text-slate-200 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  {movie.director}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cast</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((c) => (
                    <span key={c} className="px-3 py-1 bg-cinema-bg border border-cinema-border rounded-lg text-sm text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Showtimes */}
          <div className="space-y-4">
            {movie.status === "coming_soon" ? (
              <div className="card-cinema p-6 text-center">
                <p className="text-5xl mb-3">🗓️</p>
                <h3 className="text-white font-bold text-lg mb-2">Coming Soon</h3>
                <p className="text-slate-400 text-sm">
                  Releases on {formatDate(movie.releaseDate)}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Booking opens closer to release date.
                </p>
              </div>
            ) : (
              <div className="card-cinema p-5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  Book Tickets
                </h2>

                {/* Date selector */}
                <div className="flex gap-2 flex-wrap mb-5">
                  {dates.slice(0, 5).map((d) => {
                    const date = new Date(d);
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                          selectedDate === d
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-cinema-border text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-medium">
                          {date.toLocaleDateString("en-KE", { weekday: "short" })}
                        </span>
                        <span className="text-lg font-black">{date.getDate()}</span>
                        <span className="text-[10px]">
                          {date.toLocaleDateString("en-KE", { month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Showtimes */}
                <div className="space-y-3">
                  {dayShows.map((show) => {
                    const cinema = MOCK_CINEMAS.find((c) => c.id === show.cinemaId);
                    const screen = MOCK_SCREENS.find((s) => s.id === show.screenId);
                    return (
                      <Link
                        key={show.id}
                        href={`/booking/${show.id}/seats`}
                        className="block p-4 rounded-xl border border-cinema-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-lg">
                            {formatTime(show.startTime)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <div className="text-xs text-slate-400">
                          <p>{cinema?.name}</p>
                          <p>{screen?.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-slate-300">Standard: <span className="text-amber-400 font-semibold">{formatCurrency(show.price)}</span></span>
                          <span className="text-xs text-blue-300">VIP: <span className="text-blue-400 font-semibold">{formatCurrency(show.vipPrice)}</span></span>
                          <span className="text-xs text-purple-300">Premium: <span className="text-purple-400 font-semibold">{formatCurrency(show.premiumPrice)}</span></span>
                        </div>
                      </Link>
                    );
                  })}

                  {dayShows.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No shows on this date
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Seat types legend */}
            <div className="card-cinema p-5">
              <h3 className="text-sm font-bold text-white mb-3">Seat Categories</h3>
              <div className="space-y-2">
                {[
                  { type: "Standard", color: "bg-slate-600", desc: "Rows E–H" },
                  { type: "VIP", color: "bg-blue-700", desc: "Rows C–D" },
                  { type: "Premium", color: "bg-purple-800", desc: "Rows A–B (Front)" },
                ].map((s) => (
                  <div key={s.type} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded ${s.color} border border-white/20 shrink-0`} />
                    <div>
                      <p className="text-sm text-white font-medium">{s.type}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
