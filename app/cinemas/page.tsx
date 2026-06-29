"use client";
import { useState, useEffect } from "react";
import { MapPin, Presentation } from "lucide-react";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/cinemas").then(r => r.json()).then(setCinemas);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">Our Cinemas</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Experience world-class entertainment across our state-of-the-art cinema locations in Kenya.
        </p>
        <div className="h-1 w-16 bg-teal-gradient rounded-full mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cinemas.map((cinema: any) => (
          <div key={cinema.id} className="card-cinema overflow-hidden group hover:border-teal-500/30 transition-colors">
            <div className="h-40 bg-cinema-bg relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <MapPin className="w-10 h-10 text-teal-500/30 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">{cinema.name}</h2>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {cinema.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Presentation className="w-4 h-4 text-teal-400" />
                <span>{cinema.screenCount} Screen{cinema.screenCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
