import { MOCK_CINEMAS, MOCK_SCREENS } from "@/lib/mock-data";
import { MapPin, Presentation, Info, Phone, Navigation } from "lucide-react";

export default function CinemasPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3">Our Cinemas</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Experience world-class entertainment across our state-of-the-art cinema locations in Kenya.
        </p>
        <div className="h-1 w-16 bg-gold-gradient rounded-full mx-auto mt-4" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_CINEMAS.map((cinema) => {
          const screens = MOCK_SCREENS.filter((s) => s.cinemaId === cinema.id);
          
          return (
            <div key={cinema.id} className="card-cinema overflow-hidden group hover:border-amber-500/30 transition-colors">
              {/* Fake map/image header */}
              <div className="h-40 bg-cinema-bg relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "linear-gradient(#f5a623 1px, transparent 1px), linear-gradient(90deg, #f5a623 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <MapPin className="w-10 h-10 text-amber-500/30 group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-black text-white mb-2">{cinema.name}</h2>
                <p className="text-slate-400 text-sm mb-4 flex items-start gap-2 h-10">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  {cinema.location}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-cinema-bg border border-cinema-border rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1 flex justify-center"><Presentation className="w-5 h-5 text-blue-400" /></p>
                    <p className="text-xs text-slate-500 font-bold uppercase">{screens.length} Screens</p>
                  </div>
                  <div className="bg-cinema-bg border border-cinema-border rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1 flex justify-center"><Info className="w-5 h-5 text-green-400" /></p>
                    <p className="text-xs text-slate-500 font-bold uppercase">4K / Dolby</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="btn-outline-gold w-full text-sm py-2.5 flex justify-center items-center gap-2">
                    <Navigation className="w-4 h-4" /> Get Directions
                  </button>
                  <button className="w-full text-sm py-2.5 flex justify-center items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" /> Contact Box Office
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
