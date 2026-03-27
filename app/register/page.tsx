"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match"); return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Account created! Welcome to CinemaKE 🎬");
      router.push("/");
    } else {
      toast.error(result.error ?? "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-gradient rounded-2xl shadow-gold mb-4">
            <Film className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join CinemaKE and book tickets instantly</p>
        </div>

        <div className="card-cinema p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-cinema pl-10"
                  placeholder="Faith Ogutu Moraa"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="input-cinema pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Phone Number (Safaricom preferred)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-cinema pl-10"
                  placeholder="07XX XXX XXX"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  className="input-cinema pl-10 pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
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

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="input-cinema pl-10"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={set("confirm")}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              By signing up you agree to our{" "}
              <span className="text-amber-400 cursor-pointer hover:text-amber-300">Terms of Service</span> and{" "}
              <span className="text-amber-400 cursor-pointer hover:text-amber-300">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 spinner" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
