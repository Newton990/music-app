"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Clock, Play, ArrowRight, Ticket, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { MOCK_MOVIES, MOCK_SHOWS, MOCK_CINEMAS } from "@/lib/mock-data";
import { formatDuration, formatTime } from "@/lib/utils";
import MovieCard from "@/components/movies/MovieCard";

const HERO_MOVIES = MOCK_MOVIES.filter((m) => m.status === "now_showing").slice(0, 4);
const NOW_SHOWING = MOCK_MOVIES.filter((m) => m.status === "now_showing");
const COMING_SOON = MOCK_MOVIES.filter((m) => m.status === "coming_soon");

const MOVIE_BG_COLORS: Record<string, string> = {
  m1: "from-blue-900/60 to-indigo-900/40",
  m2: "from-orange-900/60 to-red-900/40",
  m3: "from-stone-900/60 to-amber-900/40",
  m4: "from-pink-900/60 to-rose-900/40",
  m5: "from-green-900/60 to-teal-900/40",
  m6: "from-violet-900/60 to-purple-900/40",
};

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_MOVIES.length), 5000);
    return () => clearInterval(id);
  }, [autoplay]);

  const heroMovie = HERO_MOVIES[heroIndex];
  const heroShows = MOCK_SHOWS.filter((s) => s.movieId === heroMovie.id).slice(0, 3);
  const colorClass = MOVIE_BG_COLORS[heroMovie.id] ?? "from-slate-900/60 to-slate-800/40";

  return (
    <div className="pt-16">
      {/* ─── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden bg-slate-900">
        {heroMovie.backdropUrl && (
          <Image src={heroMovie.backdropUrl} alt={heroMovie.title} fill className="object-cover opacity-50 mix-blend-screen transition-opacity duration-1000" priority />
        )}
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} z-10 transition-all duration-700`} />
        {/* Dark overlay bottom */}
        <div className="absolute inset-0 bg-hero-gradient z-10" />
        {/* Mesh bg */}
        <div className="absolute inset-0 bg-cinema-bg" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #f5a623 0%, transparent 50%), radial-gradient(circle at 70% 60%, #3b82f6 0%, transparent 50%)" }} />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <div className="animate-fade-in">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {heroMovie.genre.map((g) => (
                  <span key={g} className="badge-genre">{g}</span>
                ))}
                <span className="badge-rating">{heroMovie.rating}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                {heroMovie.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-slate-300 mb-5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{heroMovie.imdbRating}</span>
                  <span className="text-slate-400">/10 IMDB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatDuration(heroMovie.duration)}
                </div>
                <span className="text-slate-400">{heroMovie.language}</span>
              </div>

              <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-lg line-clamp-3">
                {heroMovie.description}
              </p>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/movies/${heroMovie.id}`}
                  className="btn-gold flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets
                </Link>
                <Link
                  href={`/movies/${heroMovie.id}`}
                  className="btn-outline-gold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  More Info
                </Link>
              </div>

              {/* Showtimes preview */}
              {heroShows.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {heroShows.map((show) => (
                    <Link
                      key={show.id}
                      href={`/booking/${show.id}/seats`}
                      className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/40 rounded-lg text-white transition-colors"
                    >
                      {formatTime(show.startTime)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            <div className="flex lg:flex-col gap-3 items-end lg:items-end justify-start lg:justify-end">
              {HERO_MOVIES.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => { setHeroIndex(i); setAutoplay(false); }}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 flex-shrink-0 ${
                    i === heroIndex
                      ? "ring-2 ring-amber-500 shadow-gold scale-105"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ width: 90, height: 60 }}
                >
                  <Image src={m.backdropUrl || m.posterUrl} alt={m.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold z-10">
                    <span className="text-white text-center px-1 text-[10px] leading-tight drop-shadow-md">{m.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Carousel dots */}
          <div className="flex gap-2 mt-8">
            {HERO_MOVIES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setHeroIndex(i); setAutoplay(false); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === heroIndex ? "w-8 bg-amber-500" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <button
          onClick={() => { setHeroIndex((i) => (i - 1 + HERO_MOVIES.length) % HERO_MOVIES.length); setAutoplay(false); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/50 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setHeroIndex((i) => (i + 1) % HERO_MOVIES.length); setAutoplay(false); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-amber-500/20 border border-white/20 hover:border-amber-500/50 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ─── NOW SHOWING ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Now Showing</h2>
            <div className="h-1 w-16 bg-gold-gradient rounded-full mt-2" />
          </div>
          <Link href="/movies" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {NOW_SHOWING.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="bg-[#060a10] py-16 border-y border-cinema-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Book your favourite movie in three simple steps
            </p>
            <div className="h-1 w-16 bg-gold-gradient rounded-full mt-3 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Ticket,
                step: "01",
                title: "Choose Your Movie",
                desc: "Browse our selection of current and upcoming movies. Filter by genre, rating, or showtime.",
              },
              {
                icon: CheckCircle,
                step: "02",
                title: "Select Your Seats",
                desc: "Pick your preferred seats from our interactive real-time seat map with multiple seat categories.",
              },
              {
                icon: CreditCard,
                step: "03",
                title: "Pay Securely",
                desc: "Pay instantly via M-Pesa, Visa card, or digital wallet. Get your e-ticket via SMS and email.",
              },
            ].map((item, i) => (
              <div key={i} className="card-cinema p-8 relative text-center group hover:border-amber-500/30 transition-colors">
                <div className="text-6xl font-black text-amber-500/10 group-hover:text-amber-500/20 transition-colors absolute top-4 right-6 select-none">
                  {item.step}
                </div>
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:shadow-gold transition-shadow">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMING SOON ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Coming Soon</h2>
            <div className="h-1 w-16 bg-gold-gradient rounded-full mt-2" />
          </div>
          <Link href="/movies?status=coming_soon" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {COMING_SOON.map((movie) => (
            <MovieCard key={movie.id} movie={movie} comingSoon />
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden card-cinema rounded-3xl p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="text-amber-400 font-semibold text-sm mb-2 uppercase tracking-wider">Start Today</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                Never Wait in Line Again
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Join thousands of movie lovers in Kenya who book their cinema seats online. Fast, secure, and convenient.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/register" className="btn-gold flex items-center gap-2 whitespace-nowrap">
                <Smartphone className="w-4 h-4" />
                Get Started Free
              </Link>
              <Link href="/movies" className="btn-outline-gold whitespace-nowrap">
                Browse Movies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
