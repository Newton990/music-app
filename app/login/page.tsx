"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Fill in all fields"); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back! 🎬");
      router.push("/");
    } else {
      toast.error(result.error ?? "Login failed");
    }
  };

  const demoLogin = async (e: string, p: string) => {
    setLoading(true);
    const result = await login(e, p);
    setLoading(false);
    if (result.success) { toast.success("Demo login successful!"); router.push("/"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 pt-24">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-gradient rounded-2xl shadow-gold mb-4">
            <Film className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your CinemaKE account</p>
        </div>

        {/* Card */}
        <div className="card-cinema p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="input-cinema pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-slate-400">Password</label>
                <button type="button" className="text-xs text-amber-400 hover:text-amber-300">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  className="input-cinema pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 spinner" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="border-t border-cinema-border" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cinema-card px-3 text-xs text-slate-500">
              or use demo account
            </span>
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => demoLogin("faith@cinema.com", "password123")}
              disabled={loading}
              className="btn-outline-gold text-xs py-2.5"
            >
              👤 Customer
            </button>
            <button
              onClick={() => demoLogin("admin@cinema.com", "admin123")}
              disabled={loading}
              className="btn-outline-gold text-xs py-2.5"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-amber-400 hover:text-amber-300 font-semibold">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
