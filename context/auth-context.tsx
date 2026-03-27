"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// In-memory user registry (persisted to sessionStorage so page refresh keeps session)
const USER_REGISTRY_KEY = "cinema_users";
const SESSION_KEY = "cinema_session";

function getRegistry(): User[] {
  if (typeof window === "undefined") return [...MOCK_USERS];
  const stored = sessionStorage.getItem(USER_REGISTRY_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User[];
    } catch {
      return [...MOCK_USERS];
    }
  }
  // Seed defaults
  sessionStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(MOCK_USERS));
  return [...MOCK_USERS];
}

function saveRegistry(users: User[]) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800)); // simulate network delay
    const registry = getRegistry();
    const found = registry.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }
    setUser(found);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return { success: true };
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 1000));
    const registry = getRegistry();
    if (registry.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "Email already registered." };
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    const updated = [...registry, newUser];
    saveRegistry(updated);
    setUser(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
