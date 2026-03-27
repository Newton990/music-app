import type { Movie, Show, Cinema, Screen, Seat, Booking, Payment, User } from "./types";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Faith Ogutu Moraa",
    email: "faith@cinema.com",
    phone: "0712345678",
    password: "password123",
    role: "customer",
    createdAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "u2",
    name: "Admin User",
    email: "admin@cinema.com",
    phone: "0700000001",
    password: "admin123",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "u3",
    name: "John Doe",
    email: "john@demo.com",
    phone: "0711000001",
    password: "demo123",
    role: "customer",
    createdAt: "2025-03-01T00:00:00Z",
  },
];

// ─── CINEMA ───────────────────────────────────────────────────────────────────
export const MOCK_CINEMAS: Cinema[] = [
  {
    id: "c1",
    name: "Kenya Highlands Cineplex",
    location: "Kericho Town, Kenya",
  },
  {
    id: "c2",
    name: "Nairobi CineWorld",
    location: "Westlands, Nairobi",
  },
];

// ─── SCREENS ─────────────────────────────────────────────────────────────────
export const MOCK_SCREENS: Screen[] = [
  { id: "sc1", cinemaId: "c1", name: "Screen 1 — Gold Hall", rows: 8, cols: 10 },
  { id: "sc2", cinemaId: "c1", name: "Screen 2 — Silver Hall", rows: 6, cols: 8 },
  { id: "sc3", cinemaId: "c2", name: "IMAX Hall", rows: 10, cols: 12 },
];

// ─── MOVIES ───────────────────────────────────────────────────────────────────
export const MOCK_MOVIES: Movie[] = [
  {
    id: "m1",
    title: "Echoes of Tomorrow",
    genre: ["Sci-Fi", "Thriller"],
    duration: 132,
    rating: "PG-13",
    imdbRating: 8.2,
    description:
      "A brilliant physicist discovers a way to send messages to the past, but each echo she sends unravels the fabric of reality in unexpected ways. A race against time to save the future begins.",
    director: "Amara Osei",
    cast: ["Lupita Nyong'o", "Idris Elba", "Florence Kasumba"],
    language: "English",
    posterUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1600",
    status: "now_showing",
    releaseDate: "2025-03-01",
  },
  {
    id: "m2",
    title: "Savannah Fire",
    genre: ["Action", "Drama"],
    duration: 118,
    rating: "PG-13",
    imdbRating: 7.8,
    description:
      "When a devastating wildfire threatens a remote Kenyan village, a fearless ranger and a city journalist must put aside their differences to save hundreds of lives.",
    director: "David Kamau",
    cast: ["Nick Mutuma", "Celestine Gachuhi", "Peter Mwangi"],
    language: "Swahili / English",
    posterUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=1600",
    status: "now_showing",
    releaseDate: "2025-02-14",
  },
  {
    id: "m3",
    title: "The Last Kingdom: Rise",
    genre: ["Historical", "Action"],
    duration: 155,
    rating: "R",
    imdbRating: 8.5,
    description:
      "An epic tale of a young warrior who must unite warring African kingdoms against a ruthless colonial force threatening to destroy their land and culture forever.",
    director: "Wanuri Kahiu",
    cast: ["John Boyega", "Danai Gurira", "Akin Omotoso"],
    language: "English",
    posterUrl: "https://images.unsplash.com/photo-1620215701830-6d4590325d73?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1620215701830-6d4590325d73?auto=format&fit=crop&q=80&w=1600",
    status: "now_showing",
    releaseDate: "2025-03-10",
  },
  {
    id: "m4",
    title: "Midnight Bloom",
    genre: ["Romance", "Drama"],
    duration: 105,
    rating: "PG",
    imdbRating: 7.4,
    description:
      "Two strangers meet every midnight in an empty Nairobi coffee shop, never knowing each other's names—until one night changes everything.",
    director: "Mildred Achoch",
    cast: ["Brenda Wairimu", "Tyler Mbaya", "Serah Ndanu"],
    language: "Swahili / English",
    posterUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1600",
    status: "now_showing",
    releaseDate: "2025-02-28",
  },
  {
    id: "m5",
    title: "Digital Ghosts",
    genre: ["Horror", "Sci-Fi"],
    duration: 98,
    rating: "R",
    imdbRating: 7.1,
    description:
      "A software developer releases an AI model that begins to haunt the digital—and physical—lives of everyone who interacts with it.",
    director: "Samuel Osei",
    cast: ["Daniel Kaluuya", "Letitia Wright"],
    language: "English",
    posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=1600",
    status: "now_showing",
    releaseDate: "2025-03-15",
  },
  {
    id: "m6",
    title: "Horizon: The New World",
    genre: ["Adventure", "Sci-Fi"],
    duration: 148,
    rating: "PG-13",
    imdbRating: 8.7,
    description:
      "Earth's last hope rests on an interstellar crew destined for a new world. But when they arrive, they realize the planet has a dark secret.",
    director: "Amma Asante",
    cast: ["Chadwick Boseman Jr.", "Zoe Saldaña", "Chiwetel Ejiofor"],
    language: "English",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1600",
    status: "coming_soon",
    releaseDate: "2025-04-18",
  },
  {
    id: "m7",
    title: "The Matchmaker of Mombasa",
    genre: ["Comedy", "Romance"],
    duration: 95,
    rating: "PG",
    imdbRating: 7.6,
    description:
      "A quirky wedding planner in Mombasa accidentally ends up planning her own love story while orchestrating the most chaotic wedding the coast has ever seen.",
    director: "Ngozi Adichike",
    cast: ["Lupita Nyong'o", "Femi Adeyemi"],
    language: "Swahili / English",
    posterUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1600",
    status: "coming_soon",
    releaseDate: "2025-05-02",
  },
  {
    id: "m8",
    title: "Red Horizon",
    genre: ["Thriller", "Crime"],
    duration: 122,
    rating: "R",
    imdbRating: 8.0,
    description:
      "An elite detective is drawn into an underground crime syndicate that operates entirely in virtual reality, where the rules of reality no longer apply.",
    director: "Ridley Okonkwo",
    cast: ["Idris Elba", "Naomie Harris", "David Oyelowo"],
    language: "English",
    posterUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&q=80&w=800",
    backdropUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&q=80&w=1600",
    status: "coming_soon",
    releaseDate: "2025-04-30",
  },
];

// ─── SHOWS (next 7 days) ──────────────────────────────────────────────────────
function addDays(baseDate: Date, days: number): Date {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function showDate(dayOffset: number, hour: number, min = 0): string {
  const d = addDays(new Date("2025-03-27"), dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function endTime(startIso: string, durationMins: number): string {
  const d = new Date(startIso);
  d.setMinutes(d.getMinutes() + durationMins);
  return d.toISOString();
}

export const MOCK_SHOWS: Show[] = [
  // Movie 1 — Echoes of Tomorrow
  { id: "sh1", movieId: "m1", screenId: "sc1", cinemaId: "c1", startTime: showDate(0, 10), endTime: endTime(showDate(0, 10), 132), price: 600, vipPrice: 900, premiumPrice: 1200 },
  { id: "sh2", movieId: "m1", screenId: "sc1", cinemaId: "c1", startTime: showDate(0, 14, 30), endTime: endTime(showDate(0, 14, 30), 132), price: 650, vipPrice: 950, premiumPrice: 1250 },
  { id: "sh3", movieId: "m1", screenId: "sc2", cinemaId: "c1", startTime: showDate(0, 19), endTime: endTime(showDate(0, 19), 132), price: 700, vipPrice: 1000, premiumPrice: 1300 },
  { id: "sh4", movieId: "m1", screenId: "sc1", cinemaId: "c1", startTime: showDate(1, 10), endTime: endTime(showDate(1, 10), 132), price: 600, vipPrice: 900, premiumPrice: 1200 },
  { id: "sh5", movieId: "m1", screenId: "sc1", cinemaId: "c1", startTime: showDate(2, 15), endTime: endTime(showDate(2, 15), 132), price: 650, vipPrice: 950, premiumPrice: 1250 },

  // Movie 2 — Savannah Fire
  { id: "sh6", movieId: "m2", screenId: "sc1", cinemaId: "c1", startTime: showDate(0, 12), endTime: endTime(showDate(0, 12), 118), price: 550, vipPrice: 850, premiumPrice: 1100 },
  { id: "sh7", movieId: "m2", screenId: "sc2", cinemaId: "c1", startTime: showDate(0, 17), endTime: endTime(showDate(0, 17), 118), price: 600, vipPrice: 900, premiumPrice: 1200 },
  { id: "sh8", movieId: "m2", screenId: "sc1", cinemaId: "c1", startTime: showDate(1, 11), endTime: endTime(showDate(1, 11), 118), price: 550, vipPrice: 850, premiumPrice: 1100 },
  { id: "sh9", movieId: "m2", screenId: "sc3", cinemaId: "c2", startTime: showDate(0, 16), endTime: endTime(showDate(0, 16), 118), price: 700, vipPrice: 1000, premiumPrice: 1400 },

  // Movie 3 — The Last Kingdom
  { id: "sh10", movieId: "m3", screenId: "sc1", cinemaId: "c1", startTime: showDate(0, 18, 30), endTime: endTime(showDate(0, 18, 30), 155), price: 700, vipPrice: 1000, premiumPrice: 1300 },
  { id: "sh11", movieId: "m3", screenId: "sc3", cinemaId: "c2", startTime: showDate(1, 19), endTime: endTime(showDate(1, 19), 155), price: 800, vipPrice: 1100, premiumPrice: 1500 },

  // Movie 4 — Midnight Bloom
  { id: "sh12", movieId: "m4", screenId: "sc2", cinemaId: "c1", startTime: showDate(0, 13), endTime: endTime(showDate(0, 13), 105), price: 500, vipPrice: 750, premiumPrice: 1000 },
  { id: "sh13", movieId: "m4", screenId: "sc2", cinemaId: "c1", startTime: showDate(1, 15, 30), endTime: endTime(showDate(1, 15, 30), 105), price: 500, vipPrice: 750, premiumPrice: 1000 },

  // Movie 5 — Digital Ghosts
  { id: "sh14", movieId: "m5", screenId: "sc1", cinemaId: "c1", startTime: showDate(0, 22), endTime: endTime(showDate(0, 22), 98), price: 650, vipPrice: 950, premiumPrice: 1250 },
  { id: "sh15", movieId: "m5", screenId: "sc3", cinemaId: "c2", startTime: showDate(1, 21), endTime: endTime(showDate(1, 21), 98), price: 700, vipPrice: 1000, premiumPrice: 1300 },
];

// ─── SEATS ────────────────────────────────────────────────────────────────────
function generateSeats(screenId: string, rows: number, cols: number): Seat[] {
  const seats: Seat[] = [];
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const type =
        r < 2 ? "premium" : r < Math.ceil(rows / 2) ? "vip" : "standard";
      seats.push({
        id: `${screenId}-${rowLabels[r]}${c}`,
        screenId,
        row: rowLabels[r],
        col: c,
        type: type as any,
      });
    }
  }
  return seats;
}

export const MOCK_SEATS: Seat[] = [
  ...generateSeats("sc1", 8, 10),
  ...generateSeats("sc2", 6, 8),
  ...generateSeats("sc3", 10, 12),
];

// ─── BOOKINGS (pre-seeded reservations for demo) ─────────────────────────────
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk1",
    userId: "u1",
    showId: "sh1",
    movieId: "m1",
    cinemaId: "c1",
    screenId: "sc1",
    seats: [
      { seatId: "sc1-A1", price: 1200 },
      { seatId: "sc1-A2", price: 1200 },
    ],
    totalAmount: 2400,
    status: "confirmed",
    qrCode: "BK1-QR-2025-03-27",
    createdAt: "2025-03-26T12:00:00Z",
  },
  {
    id: "bk2",
    userId: "u3",
    showId: "sh6",
    movieId: "m2",
    cinemaId: "c1",
    screenId: "sc1",
    seats: [{ seatId: "sc1-C5", price: 550 }],
    totalAmount: 550,
    status: "confirmed",
    qrCode: "BK2-QR-2025-03-27",
    createdAt: "2025-03-26T15:30:00Z",
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "py1",
    bookingId: "bk1",
    amount: 2400,
    method: "mpesa",
    status: "success",
    transactionRef: "MP25031234",
    paidAt: "2025-03-26T12:05:00Z",
  },
  {
    id: "py2",
    bookingId: "bk2",
    amount: 550,
    method: "card",
    status: "success",
    transactionRef: "CRD25036789",
    paidAt: "2025-03-26T15:32:00Z",
  },
];

// ─── Reserved seat IDs per show (pre-seeded) ─────────────────────────────────
export const RESERVED_SEATS_BY_SHOW: Record<string, string[]> = {
  sh1: ["sc1-A1", "sc1-A2", "sc1-B3", "sc1-B4", "sc1-C1", "sc1-D5", "sc1-E2", "sc1-E3"],
  sh6: ["sc1-C5", "sc1-C6", "sc1-D1", "sc1-D2", "sc1-D3"],
  sh10: ["sc1-A3", "sc1-A4", "sc1-B1", "sc1-B5"],
  sh12: ["sc2-A1", "sc2-B2", "sc2-C3"],
};
