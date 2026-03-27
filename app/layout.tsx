import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { BookingProvider } from "@/context/booking-context";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "CinemaKE — Online Movie Ticket Booking",
  description:
    "Kenya's premier online movie ticket booking platform. Browse movies, select seats, and pay securely with M-Pesa or card.",
  keywords: "cinema, movies, tickets, Kenya, online booking, M-Pesa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cinema-bg text-white antialiased">
        <AuthProvider>
          <BookingProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0f1623",
                  color: "#e2e8f0",
                  border: "1px solid #1e2d45",
                  fontFamily: "Inter, sans-serif",
                },
                success: {
                  iconTheme: { primary: "#f5a623", secondary: "#080c14" },
                },
                error: {
                  iconTheme: { primary: "#e53e3e", secondary: "#fff" },
                },
              }}
            />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
