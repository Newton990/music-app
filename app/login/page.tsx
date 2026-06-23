"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Eye, EyeOff, Mail, Lock, Phone, KeyRound } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";

type Tab = "email" | "phone";

export default function LoginPage() {
  const { login, loginWithOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

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

  const handleSendOtp = async () => {
    if (!phone) { toast.error("Enter your phone number"); return; }
    setOtpLoading(true);
    try {
      await loginWithOtp(phone);
      setOtpSent(true);
      toast.success("OTP sent to your phone");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { toast.error("Enter the OTP code"); return; }
    setOtpLoading(true);
    const result = await verifyOtp(phone, otp);
    setOtpLoading(false);
    if (result.success) {
      toast.success("Welcome back! 🎬");
      router.push("/");
    } else {
      toast.error(result.error ?? "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-gradient rounded-2xl shadow-gold mb-4">
            <Film className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your CinemaKE account</p>
        </div>

        <div className="card-cinema p-8">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-700 mb-6">
            <button
              onClick={() => setTab("email")}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === "email"
                  ? "text-amber-400 border-amber-400"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setTab("phone")}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === "phone"
                  ? "text-amber-400 border-amber-400"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Phone OTP
            </button>
          </div>

          {/* Email/Password form */}
          {tab === "email" && (
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
                <label className="text-xs text-slate-400 mb-1.5">Password</label>
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
          )}

          {/* Phone OTP form */}
          {tab === "phone" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    className="input-cinema pl-10"
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <><div className="w-4 h-4 spinner" /> Sending OTP...</>
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Send OTP</>
                  )}
                </button>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5">OTP Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="input-cinema text-center text-lg tracking-widest"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <><div className="w-4 h-4 spinner" /> Verifying...</>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors w-full text-center"
                  >
                    Change phone number
                  </button>
                </>
              )}
            </div>
          )}
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
