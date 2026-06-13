import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

async function exec(sql: string, label: string) {
  const conn = await mysql.createConnection({ uri: url, ssl: {} });
  try {
    await conn.execute(sql);
    console.log(`OK: ${label}`);
  } catch (err: any) {
    console.error(`FAIL: ${label} - ${err.message}`);
  } finally {
    await conn.end();
  }
}

async function main() {
  const sysUrl = url.replace("/cinemake", "/sys");
  const sys = await mysql.createConnection({ uri: sysUrl, ssl: {} });
  await sys.execute("CREATE DATABASE IF NOT EXISTS cinemake");
  await sys.end();

  await exec(`
    CREATE TABLE IF NOT EXISTS \`User\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NULL,
      \`email\` VARCHAR(191) NOT NULL,
      \`emailVerified\` DATETIME(3) NULL,
      \`image\` VARCHAR(191) NULL,
      \`password\` VARCHAR(191) NULL,
      \`phone\` VARCHAR(191) NULL,
      \`role\` VARCHAR(191) NOT NULL DEFAULT 'customer',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`User_email_key\`(\`email\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "User");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Account\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`type\` VARCHAR(191) NOT NULL,
      \`provider\` VARCHAR(191) NOT NULL,
      \`providerAccountId\` VARCHAR(191) NOT NULL,
      \`refresh_token\` VARCHAR(191) NULL,
      \`access_token\` VARCHAR(191) NULL,
      \`expires_at\` INT NULL,
      \`token_type\` VARCHAR(191) NULL,
      \`scope\` VARCHAR(191) NULL,
      \`id_token\` VARCHAR(191) NULL,
      \`session_state\` VARCHAR(191) NULL,
      UNIQUE INDEX \`Account_provider_providerAccountId_key\`(\`provider\`, \`providerAccountId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Account");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Session\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`sessionToken\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`expires\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`Session_sessionToken_key\`(\`sessionToken\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Session");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`VerificationToken\` (
      \`identifier\` VARCHAR(191) NOT NULL,
      \`token\` VARCHAR(191) NOT NULL,
      \`expires\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`VerificationToken_token_key\`(\`token\`),
      UNIQUE INDEX \`VerificationToken_identifier_token_key\`(\`identifier\`, \`token\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "VerificationToken");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Cinema\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`location\` VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Cinema");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Screen\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`cinemaId\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`rows\` INT NOT NULL,
      \`cols\` INT NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Screen");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Movie\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`genre\` TEXT NOT NULL,
      \`duration\` INT NOT NULL,
      \`rating\` VARCHAR(191) NOT NULL,
      \`imdbRating\` DOUBLE NOT NULL,
      \`description\` TEXT NOT NULL,
      \`director\` VARCHAR(191) NOT NULL,
      \`cast\` TEXT NOT NULL,
      \`language\` VARCHAR(191) NOT NULL,
      \`posterUrl\` VARCHAR(191) NOT NULL,
      \`backdropUrl\` VARCHAR(191) NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'now_showing',
      \`releaseDate\` VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Movie");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Show\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`movieId\` VARCHAR(191) NOT NULL,
      \`screenId\` VARCHAR(191) NOT NULL,
      \`cinemaId\` VARCHAR(191) NOT NULL,
      \`startTime\` DATETIME(3) NOT NULL,
      \`endTime\` DATETIME(3) NOT NULL,
      \`price\` DOUBLE NOT NULL,
      \`vipPrice\` DOUBLE NOT NULL,
      \`premiumPrice\` DOUBLE NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Show");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Seat\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`screenId\` VARCHAR(191) NOT NULL,
      \`row\` VARCHAR(191) NOT NULL,
      \`col\` INT NOT NULL,
      \`type\` VARCHAR(191) NOT NULL DEFAULT 'standard',
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Seat");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Booking\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`showId\` VARCHAR(191) NOT NULL,
      \`movieId\` VARCHAR(191) NOT NULL,
      \`cinemaId\` VARCHAR(191) NOT NULL,
      \`screenId\` VARCHAR(191) NOT NULL,
      \`seats\` TEXT NOT NULL,
      \`totalAmount\` DOUBLE NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'pending',
      \`qrCode\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Booking");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Payment\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`bookingId\` VARCHAR(191) NOT NULL,
      \`amount\` DOUBLE NOT NULL,
      \`method\` VARCHAR(191) NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'pending',
      \`transactionRef\` VARCHAR(191) NULL,
      \`paynectaRef\` VARCHAR(191) NULL,
      \`mpesaReceipt\` VARCHAR(191) NULL,
      \`paidAt\` DATETIME(3) NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `, "Payment");

  // Foreign keys
  await exec("ALTER TABLE `Account` ADD CONSTRAINT IF NOT EXISTS `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE", "FK Account->User");
  await exec("ALTER TABLE `Session` ADD CONSTRAINT IF NOT EXISTS `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE", "FK Session->User");
  await exec("ALTER TABLE `Screen` ADD CONSTRAINT IF NOT EXISTS `Screen_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE", "FK Screen->Cinema");
  await exec("ALTER TABLE `Show` ADD CONSTRAINT IF NOT EXISTS `Show_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Show->Movie");
  await exec("ALTER TABLE `Show` ADD CONSTRAINT IF NOT EXISTS `Show_cinemaId_fkey` FOREIGN KEY (`cinemaId`) REFERENCES `Cinema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Show->Cinema");
  await exec("ALTER TABLE `Show` ADD CONSTRAINT IF NOT EXISTS `Show_screenId_fkey` FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Show->Screen");
  await exec("ALTER TABLE `Seat` ADD CONSTRAINT IF NOT EXISTS `Seat_screenId_fkey` FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE", "FK Seat->Screen");
  await exec("ALTER TABLE `Booking` ADD CONSTRAINT IF NOT EXISTS `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Booking->User");
  await exec("ALTER TABLE `Booking` ADD CONSTRAINT IF NOT EXISTS `Booking_showId_fkey` FOREIGN KEY (`showId`) REFERENCES `Show`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Booking->Show");
  await exec("ALTER TABLE `Booking` ADD CONSTRAINT IF NOT EXISTS `Booking_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE", "FK Booking->Movie");
  await exec("ALTER TABLE `Payment` ADD CONSTRAINT IF NOT EXISTS `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE", "FK Payment->Booking");

  console.log("Migration complete!");
}

main().catch(console.error);
