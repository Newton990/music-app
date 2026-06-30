const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrate() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL not set");

  const u = new URL(raw);
  const conn = await mysql.createConnection({
    host: u.hostname,
    port: parseInt(u.port || "3306", 10),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: {},
  });

  console.log("Connected. Running migration...");

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Setting (
      \`key\` VARCHAR(255) PRIMARY KEY,
      \`value\` TEXT,
      \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("Setting table ready");

  const defaults = [
    ["paystack_public_key", ""],
    ["paystack_secret_key", ""],
    ["paynecta_api_key", ""],
    ["paynecta_email", ""],
    ["paynecta_payment_code", ""],
    ["paynecta_base_url", "https://paynecta.co.ke/api/v1"],
    ["site_name", "CinemaKE"],
    ["site_currency", "KES"],
  ];

  for (const [key, value] of defaults) {
    await conn.execute("INSERT IGNORE INTO Setting (`key`, `value`) VALUES (?, ?)", [key, value]);
  }
  console.log("Defaults inserted");

  await conn.end();
  console.log("Done.");
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
