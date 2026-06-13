import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config({ path: ".env" });

const url = process.env.DATABASE_URL!;

async function seed() {
  const conn = await mysql.createConnection({ uri: url, ssl: {} });

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const now = new Date();

  // Users
  await conn.execute(
    `INSERT IGNORE INTO User (id, name, email, password, phone, role, createdAt) VALUES (?,?,?,?,?,?,?)`,
    ["u1", "Faith Ogutu Moraa", "faith@cinema.com", hash("password123"), "0712345678", "customer", now]
  );
  await conn.execute(
    `INSERT IGNORE INTO User (id, name, email, password, phone, role, createdAt) VALUES (?,?,?,?,?,?,?)`,
    ["u2", "Admin User", "admin@cinema.com", hash("admin123"), "0700000001", "admin", now]
  );
  await conn.execute(
    `INSERT IGNORE INTO User (id, name, email, password, phone, role, createdAt) VALUES (?,?,?,?,?,?,?)`,
    ["u3", "John Doe", "john@demo.com", hash("demo123"), "0711000001", "customer", now]
  );

  // Cinemas
  await conn.execute("INSERT IGNORE INTO Cinema (id, name, location) VALUES (?,?,?)", ["c1", "Kenya Highlands Cineplex", "Kericho Town, Kenya"]);
  await conn.execute("INSERT IGNORE INTO Cinema (id, name, location) VALUES (?,?,?)", ["c2", "Nairobi CineWorld", "Westlands, Nairobi"]);

  // Screens
  await conn.execute("INSERT IGNORE INTO Screen (id, cinemaId, name, `rows`, cols) VALUES (?,?,?,?,?)", ["sc1", "c1", "Screen 1 — Gold Hall", 8, 10]);
  await conn.execute("INSERT IGNORE INTO Screen (id, cinemaId, name, `rows`, cols) VALUES (?,?,?,?,?)", ["sc2", "c1", "Screen 2 — Silver Hall", 6, 8]);
  await conn.execute("INSERT IGNORE INTO Screen (id, cinemaId, name, `rows`, cols) VALUES (?,?,?,?,?)", ["sc3", "c2", "IMAX Hall", 10, 12]);

  // Movies
  const movies = [
    { id: "m1", title: "Echoes of Tomorrow", genre: JSON.stringify(["Sci-Fi", "Thriller"]), duration: 132, rating: "PG-13", imdbRating: 8.2, description: "A brilliant physicist discovers a way to send messages to the past, but each echo she sends unravels the fabric of reality in unexpected ways. A race against time to save the future begins.", director: "Amara Osei", cast: JSON.stringify(["Lupita Nyong'o", "Idris Elba", "Florence Kasumba"]), language: "English", posterUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1600", status: "now_showing", releaseDate: "2025-03-01" },
    { id: "m2", title: "Savannah Fire", genre: JSON.stringify(["Action", "Drama"]), duration: 118, rating: "PG-13", imdbRating: 7.8, description: "When a devastating wildfire threatens a remote Kenyan village, a fearless ranger and a city journalist must put aside their differences to save hundreds of lives.", director: "David Kamau", cast: JSON.stringify(["Nick Mutuma", "Celestine Gachuhi", "Peter Mwangi"]), language: "Swahili / English", posterUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=1600", status: "now_showing", releaseDate: "2025-02-14" },
    { id: "m3", title: "The Last Kingdom: Rise", genre: JSON.stringify(["Historical", "Action"]), duration: 155, rating: "R", imdbRating: 8.5, description: "An epic tale of a young warrior who must unite warring African kingdoms against a ruthless colonial force threatening to destroy their land and culture forever.", director: "Wanuri Kahiu", cast: JSON.stringify(["John Boyega", "Danai Gurira", "Akin Omotoso"]), language: "English", posterUrl: "https://images.unsplash.com/photo-1620215701830-6d4590325d73?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1620215701830-6d4590325d73?auto=format&fit=crop&q=80&w=1600", status: "now_showing", releaseDate: "2025-03-10" },
    { id: "m4", title: "Midnight Bloom", genre: JSON.stringify(["Romance", "Drama"]), duration: 105, rating: "PG", imdbRating: 7.4, description: "Two strangers meet every midnight in an empty Nairobi coffee shop, never knowing each other's names—until one night changes everything.", director: "Mildred Achoch", cast: JSON.stringify(["Brenda Wairimu", "Tyler Mbaya", "Serah Ndanu"]), language: "Swahili / English", posterUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1600", status: "now_showing", releaseDate: "2025-02-28" },
    { id: "m5", title: "Digital Ghosts", genre: JSON.stringify(["Horror", "Sci-Fi"]), duration: 98, rating: "R", imdbRating: 7.1, description: "A software developer releases an AI model that begins to haunt the digital—and physical—lives of everyone who interacts with it.", director: "Samuel Osei", cast: JSON.stringify(["Daniel Kaluuya", "Letitia Wright"]), language: "English", posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=1600", status: "now_showing", releaseDate: "2025-03-15" },
    { id: "m6", title: "Horizon: The New World", genre: JSON.stringify(["Adventure", "Sci-Fi"]), duration: 148, rating: "PG-13", imdbRating: 8.7, description: "Earth's last hope rests on an interstellar crew destined for a new world. But when they arrive, they realize the planet has a dark secret.", director: "Amma Asante", cast: JSON.stringify(["Chadwick Boseman Jr.", "Zoe Saldaña", "Chiwetel Ejiofor"]), language: "English", posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1600", status: "coming_soon", releaseDate: "2025-04-18" },
    { id: "m7", title: "The Matchmaker of Mombasa", genre: JSON.stringify(["Comedy", "Romance"]), duration: 95, rating: "PG", imdbRating: 7.6, description: "A quirky wedding planner in Mombasa accidentally ends up planning her own love story while orchestrating the most chaotic wedding the coast has ever seen.", director: "Ngozi Adichike", cast: JSON.stringify(["Lupita Nyong'o", "Femi Adeyemi"]), language: "Swahili / English", posterUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1600", status: "coming_soon", releaseDate: "2025-05-02" },
    { id: "m8", title: "Red Horizon", genre: JSON.stringify(["Thriller", "Crime"]), duration: 122, rating: "R", imdbRating: 8.0, description: "An elite detective is drawn into an underground crime syndicate that operates entirely in virtual reality, where the rules of reality no longer apply.", director: "Ridley Okonkwo", cast: JSON.stringify(["Idris Elba", "Naomie Harris", "David Oyelowo"]), language: "English", posterUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&q=80&w=800", backdropUrl: "https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&q=80&w=1600", status: "coming_soon", releaseDate: "2025-04-30" },
  ];
  for (const m of movies) {
    await conn.execute(
      "INSERT IGNORE INTO Movie (id, title, genre, duration, rating, imdbRating, description, director, cast, language, posterUrl, backdropUrl, status, releaseDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [m.id, m.title, m.genre, m.duration, m.rating, m.imdbRating, m.description, m.director, m.cast, m.language, m.posterUrl, m.backdropUrl, m.status, m.releaseDate]
    );
  }

  // Shows (seeded with dynamic dates relative to "today")
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const showDate = (dayOffset: number, hour: number, min = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, min, 0, 0);
    return d;
  };
  const endTime = (start: Date, dur: number) => {
    const d = new Date(start);
    d.setMinutes(d.getMinutes() + dur);
    return d;
  };

  const shows = [
    { id: "sh1", movieId: "m1", screenId: "sc1", cinemaId: "c1", start: showDate(0, 10), dur: 132, price: 600, vipPrice: 900, premiumPrice: 1200 },
    { id: "sh2", movieId: "m1", screenId: "sc1", cinemaId: "c1", start: showDate(0, 14, 30), dur: 132, price: 650, vipPrice: 950, premiumPrice: 1250 },
    { id: "sh3", movieId: "m1", screenId: "sc2", cinemaId: "c1", start: showDate(0, 19), dur: 132, price: 700, vipPrice: 1000, premiumPrice: 1300 },
    { id: "sh4", movieId: "m1", screenId: "sc1", cinemaId: "c1", start: showDate(1, 10), dur: 132, price: 600, vipPrice: 900, premiumPrice: 1200 },
    { id: "sh5", movieId: "m1", screenId: "sc1", cinemaId: "c1", start: showDate(2, 15), dur: 132, price: 650, vipPrice: 950, premiumPrice: 1250 },
    { id: "sh6", movieId: "m2", screenId: "sc1", cinemaId: "c1", start: showDate(0, 12), dur: 118, price: 550, vipPrice: 850, premiumPrice: 1100 },
    { id: "sh7", movieId: "m2", screenId: "sc2", cinemaId: "c1", start: showDate(0, 17), dur: 118, price: 600, vipPrice: 900, premiumPrice: 1200 },
    { id: "sh8", movieId: "m2", screenId: "sc1", cinemaId: "c1", start: showDate(1, 11), dur: 118, price: 550, vipPrice: 850, premiumPrice: 1100 },
    { id: "sh9", movieId: "m2", screenId: "sc3", cinemaId: "c2", start: showDate(0, 16), dur: 118, price: 700, vipPrice: 1000, premiumPrice: 1400 },
    { id: "sh10", movieId: "m3", screenId: "sc1", cinemaId: "c1", start: showDate(0, 18, 30), dur: 155, price: 700, vipPrice: 1000, premiumPrice: 1300 },
    { id: "sh11", movieId: "m3", screenId: "sc3", cinemaId: "c2", start: showDate(1, 19), dur: 155, price: 800, vipPrice: 1100, premiumPrice: 1500 },
    { id: "sh12", movieId: "m4", screenId: "sc2", cinemaId: "c1", start: showDate(0, 13), dur: 105, price: 500, vipPrice: 750, premiumPrice: 1000 },
    { id: "sh13", movieId: "m4", screenId: "sc2", cinemaId: "c1", start: showDate(1, 15, 30), dur: 105, price: 500, vipPrice: 750, premiumPrice: 1000 },
    { id: "sh14", movieId: "m5", screenId: "sc1", cinemaId: "c1", start: showDate(0, 22), dur: 98, price: 650, vipPrice: 950, premiumPrice: 1250 },
    { id: "sh15", movieId: "m5", screenId: "sc3", cinemaId: "c2", start: showDate(1, 21), dur: 98, price: 700, vipPrice: 1000, premiumPrice: 1300 },
  ];
  for (const s of shows) {
    await conn.execute(
      "INSERT IGNORE INTO `Show` (id, movieId, screenId, cinemaId, startTime, endTime, price, vipPrice, premiumPrice) VALUES (?,?,?,?,?,?,?,?,?)",
      [s.id, s.movieId, s.screenId, s.cinemaId, s.start, endTime(s.start, s.dur), s.price, s.vipPrice, s.premiumPrice]
    );
  }

  // Seats
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const screenConfigs = [
    { id: "sc1", rows: 8, cols: 10 },
    { id: "sc2", rows: 6, cols: 8 },
    { id: "sc3", rows: 10, cols: 12 },
  ];
  for (const sc of screenConfigs) {
    for (let r = 0; r < sc.rows; r++) {
      for (let c = 1; c <= sc.cols; c++) {
        const type = r < 2 ? "premium" : r < Math.ceil(sc.rows / 2) ? "vip" : "standard";
        const seatId = `${sc.id}-${rowLabels[r]}${c}`;
        await conn.execute(
          "INSERT IGNORE INTO Seat (id, screenId, `row`, col, type) VALUES (?,?,?,?,?)",
          [seatId, sc.id, rowLabels[r], c, type]
        );
      }
    }
  }

  // Bookings
  await conn.execute(
    "INSERT IGNORE INTO Booking (id, userId, showId, movieId, cinemaId, screenId, seats, totalAmount, status, qrCode, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ["bk1", "u1", "sh1", "m1", "c1", "sc1", JSON.stringify([{ seatId: "sc1-A1", price: 1200 }, { seatId: "sc1-A2", price: 1200 }]), 2400, "confirmed", "BK1-QR-2025-03-27", new Date()]
  );
  await conn.execute(
    "INSERT IGNORE INTO Booking (id, userId, showId, movieId, cinemaId, screenId, seats, totalAmount, status, qrCode, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ["bk2", "u3", "sh6", "m2", "c1", "sc1", JSON.stringify([{ seatId: "sc1-C5", price: 550 }]), 550, "confirmed", "BK2-QR-2025-03-27", new Date()]
  );

  // Payments
  await conn.execute(
    "INSERT IGNORE INTO Payment (id, bookingId, amount, method, status, transactionRef, paidAt) VALUES (?,?,?,?,?,?,?)",
    ["py1", "bk1", 2400, "mpesa", "success", "MP25031234", new Date()]
  );
  await conn.execute(
    "INSERT IGNORE INTO Payment (id, bookingId, amount, method, status, transactionRef, paidAt) VALUES (?,?,?,?,?,?,?)",
    ["py2", "bk2", 550, "card", "success", "CRD25036789", new Date()]
  );

  await conn.end();
  console.log("Seed complete!");
}

seed().catch(console.error);
