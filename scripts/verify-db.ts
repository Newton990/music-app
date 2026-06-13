import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({ uri: url, ssl: {} });
  const [rows] = await conn.execute("SHOW TABLES");
  console.log(rows);
  await conn.end();
}

main().catch(console.error);
