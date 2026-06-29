"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/auth-context";
import { BookingProvider } from "@/context/booking-context";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
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
              success: { iconTheme: { primary: "#2dd4bf", secondary: "#080c14" } },
              error: { iconTheme: { primary: "#e53e3e", secondary: "#fff" } },
            }}
          />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </BookingProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
