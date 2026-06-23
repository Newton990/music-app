import QRCode from "qrcode";

interface TicketEmailParams {
  email: string;
  name: string;
  movieTitle: string;
  cinemaName: string;
  screenName: string;
  showTime: string;
  seats: { row: string; col: number; type: string }[];
  qrCode: string;
  totalAmount: number;
  bookingRef: string;
}

export async function sendTicketEmail(params: TicketEmailParams) {
  const { email, name, movieTitle, cinemaName, screenName, showTime, seats, qrCode, totalAmount, bookingRef } = params;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(qrCode);
  } catch {
    qrDataUrl = qrCode;
  }

  const seatList = seats.map((s) => `${s.row}${s.col} (${s.type})`).join(", ");

  const emailContent = [
    "=========================================",
    "        CINEMAKE - TICKET CONFIRMED",
    "=========================================",
    "",
    `Dear ${name},`,
    "",
    `Your ticket booking has been confirmed!`,
    "",
    `Booking Reference: ${bookingRef}`,
    `Movie: ${movieTitle}`,
    `Cinema: ${cinemaName}`,
    `Screen: ${screenName}`,
    `Show Time: ${new Date(showTime).toLocaleString("en-KE")}`,
    `Seats: ${seatList}`,
    `Total Paid: KES ${totalAmount.toLocaleString("en-KE")}`,
    `QR Code: ${qrCode}`,
    "",
    "Show this QR code at the cinema entrance to gain access.",
    "",
    "Thank you for choosing CinemaKE!",
    "=========================================",
  ].join("\n");

  console.log("========== EMAIL SERVICE ==========");
  console.log(`To: ${email}`);
  console.log(`Subject: Your CinemaKE Ticket - ${movieTitle}`);
  console.log(emailContent);

  if (qrDataUrl !== qrCode) {
    console.log("QR Code Data URL: [generated successfully]");
  }
  console.log("========== END EMAIL ==========");

  return { success: true };
}
