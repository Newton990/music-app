import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "CinemaKE — Online Movie Ticket Booking",
  description:
    "Kenya's premier online movie ticket booking platform. Browse movies, select seats, and pay securely with M-Pesa or card.",
  keywords: "cinema, movies, tickets, Kenya, online booking, M-Pesa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cinema-bg text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
