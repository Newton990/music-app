import Link from "next/link";
import { Star, Clock, Calendar } from "lucide-react";
import type { Movie } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
const POSTER_BG: Record<string, string> = {
  m1: "linear-gradient(145deg, #0d1b3e, #1a237e)",
  m2: "linear-gradient(145deg, #3e1a0a, #7b2d0a)",
  m3: "linear-gradient(145deg, #2e1a00, #5d3a00)",
  m4: "linear-gradient(145deg, #2e0a1a, #701a3a)",
  m5: "linear-gradient(145deg, #0a2e1a, #0d5c30)",
  m6: "linear-gradient(145deg, #1a0a3e, #3d0986)",
  m7: "linear-gradient(145deg, #1a3a1a, #2d6b2d)",
  m8: "linear-gradient(145deg, #3e0a0a, #8b0000)",
};

const POSTER_EMOJI: Record<string, string> = {
  m1: "🚀", m2: "🔥", m3: "⚔️", m4: "🌸", m5: "👻", m6: "🌌", m7: "💍", m8: "🔴",
};

interface Props {
  movie: Movie;
  comingSoon?: boolean;
}

export default function MovieCard({ movie, comingSoon = false }: Props) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className={cn(
        "group block card-cinema rounded-xl overflow-hidden hover:border-amber-500/40",
        "hover:shadow-[0_8px_30px_rgba(245,166,35,0.15)] transition-all duration-300 hover:-translate-y-1"
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] flex items-center justify-center overflow-hidden bg-slate-900">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 20vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-md px-2 py-0.5 backdrop-blur-sm">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-bold">{movie.imdbRating}</span>
        </div>

        {/* Coming soon badge */}
        {comingSoon && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-md">
            SOON
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-wrap gap-1 mb-1">
            {movie.genre.slice(0, 2).map((g) => (
              <span key={g} className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-medium">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(movie.duration)}
          </span>
          {comingSoon ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Calendar className="w-3 h-3" />
              {new Date(movie.releaseDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
            </span>
          ) : (
            <span className="badge-rating text-[9px]">{movie.rating}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
