import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({ uri: url, ssl: {} });

  const fks = [
    `ALTER TABLE Account ADD CONSTRAINT Account_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE Session ADD CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE Screen ADD CONSTRAINT Screen_cinemaId_fkey FOREIGN KEY (cinemaId) REFERENCES Cinema(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE \`Show\` ADD CONSTRAINT Show_movieId_fkey FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE \`Show\` ADD CONSTRAINT Show_cinemaId_fkey FOREIGN KEY (cinemaId) REFERENCES Cinema(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE \`Show\` ADD CONSTRAINT Show_screenId_fkey FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE Seat ADD CONSTRAINT Seat_screenId_fkey FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE Booking ADD CONSTRAINT Booking_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE Booking ADD CONSTRAINT Booking_showId_fkey FOREIGN KEY (showId) REFERENCES \`Show\`(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE Booking ADD CONSTRAINT Booking_movieId_fkey FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE Payment ADD CONSTRAINT Payment_bookingId_fkey FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE ON UPDATE CASCADE`,
  ];

  for (const sql of fks) {
    try {
      await conn.execute(sql);
      console.log("OK:", sql.slice(0, 60));
    } catch (e: any) {
      console.log("SKIP:", e.message?.slice(0, 80));
    }
  }
  await conn.end();
  console.log("FKs done");
}

main().catch(console.error);
