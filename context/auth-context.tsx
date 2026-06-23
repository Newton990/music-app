"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (phone: string) => Promise<{ step: "send" }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        password: "",
        role: (session.user.role as any) || "customer",
        createdAt: "",
      }
    : null;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      setIsLoading(false);
      if (result?.error) return { success: false, error: "Invalid email or password." };
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const loginWithOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      setIsLoading(false);
      if (!res.ok) throw new Error(json.error || "Failed to send OTP");
      return { step: "send" as const };
    } catch {
      setIsLoading(false);
      throw new Error("Failed to send OTP");
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: json.error || "Invalid OTP" };
      }
      const result = await signIn("credentials", {
        email: json.user.email,
        password: "__otp__",
        redirect: false,
      });
      setIsLoading(false);
      if (result?.error) return { success: false, error: "Login failed after OTP verification." };
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Verification failed. Please try again." };
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: json.error || "Registration failed." };
      }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithOtp,
        verifyOtp,
        register,
        logout,
        isLoading: isLoading || status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
