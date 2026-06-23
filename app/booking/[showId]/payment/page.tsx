"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Smartphone, CreditCard, Wallet, ArrowLeft, Shield, CheckCircle, XCircle } from "lucide-react";
import { useBooking } from "@/context/booking-context";
import { useAuth } from "@/context/auth-context";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Suspense } from "react";

type PaymentMethod = "mpesa" | "card" | "wallet";
type PaymentState = "idle" | "processing" | "success" | "failed";

function PaymentContent({ showId }: { showId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const { user } = useAuth();
  const { processPayment } = useBooking();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [phone, setPhone] = useState("07");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [payState, setPayState] = useState<PaymentState>("idle");
  const [txRef, setTxRef] = useState("");

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/booking/${showId}/payment${bookingId ? `?bookingId=${bookingId}` : ""}`);
      return;
    }
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`).then(r => r.json()).then(data => { setBooking(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId, user, router, showId]);

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!booking) {
    return (
      <div className="pt-24 text-center text-slate-400">
        <p className="text-5xl mb-4">⚠️</p>
        <p>Booking not found. Please start again.</p>
        <button onClick={() => router.push("/movies")} className="btn-gold mt-4">Browse Movies</button>
      </div>
    );
  }

  const handlePay = async () => {
    if (method === "mpesa" && phone.replace(/\s/g, "").length < 9) {
      toast.error("Enter a valid phone number"); return;
    }
    if (method === "card" && (cardNumber.length < 16 || !cardName || !expiry || !cvv)) {
      toast.error("Fill in all card details"); return;
    }

    setPayState("processing");
    const result = await processPayment(bookingId, method, phone);
    setTxRef(result.ref);

    if (result.success) {
      setPayState("success");
      toast.success("Payment successful!");
      setTimeout(() => router.push(`/booking/confirmation?bookingId=${bookingId}`), 2500);
    } else {
      setPayState("failed");
      toast.error("Payment failed. Please try again.");
    }
  };

  if (payState === "processing") {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="card-cinema p-10 text-center max-w-sm mx-auto animate-fade-in">
          <div className="w-16 h-16 spinner mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
          <p className="text-slate-400 text-sm">{method === "mpesa" ? "Check your phone for the M-Pesa prompt..." : "Verifying with your bank..."}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><Shield className="w-3 h-3" />256-bit SSL encrypted</div>
        </div>
      </div>
    );
  }

  if (payState === "success") {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="card-cinema p-10 text-center max-w-sm mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-400" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
          <p className="text-slate-400 text-sm mb-3">Your tickets have been confirmed.</p>
          <p className="text-xs text-slate-500">Ref: <span className="text-amber-400 font-mono">{txRef}</span></p>
          <p className="text-xs text-slate-500 mt-2">Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  if (payState === "failed") {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="card-cinema p-10 text-center max-w-sm mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-400" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
          <p className="text-slate-400 text-sm mb-6">Your seats are still held. Please try again.</p>
          <button onClick={() => setPayState("idle")} className="btn-gold w-full">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen max-w-4xl mx-auto px-4 sm:px-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-black text-white mb-2">Complete Payment</h1>
      <div className="h-1 w-16 bg-gold-gradient rounded-full mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <div className="card-cinema p-5">
            <h2 className="font-bold text-white mb-4">Payment Method</h2>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: "mpesa", label: "M-Pesa", icon: Smartphone, color: "text-green-400", bg: "bg-green-500/10 border-green-500/40" },
                { id: "card", label: "Card", icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/40" },
                { id: "wallet", label: "Wallet", icon: Wallet, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/40" },
              ] as const).map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === m.id ? `${m.bg} shadow-inner` : "border-cinema-border hover:border-slate-500"}`}>
                  <m.icon className={`w-5 h-5 ${method === m.id ? m.color : "text-slate-400"}`} />
                  <span className={`text-xs font-semibold ${method === m.id ? "text-white" : "text-slate-400"}`}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-cinema p-5">
            {method === "mpesa" && (
              <div>
                <h3 className="font-bold text-white mb-1">M-Pesa Payment</h3>
                <p className="text-slate-400 text-xs mb-4">Enter your Safaricom number to receive the payment prompt</p>
                <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                <div className="flex gap-2 mb-3">
                  <div className="bg-cinema-bg border border-cinema-border rounded-xl px-3 py-3 text-sm text-slate-300 shrink-0">🇰🇪 +254</div>
                  <input className="input-cinema" placeholder="7XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, "").slice(0, 12))} maxLength={12} />
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-xs text-green-300">💡 You will receive an STK push notification on your phone. Enter your M-Pesa PIN to confirm.</div>
              </div>
            )}
            {method === "card" && (
              <div className="space-y-4">
                <h3 className="font-bold text-white mb-1">Card Payment</h3>
                <p className="text-slate-400 text-xs mb-4">Visa, Mastercard, or American Express accepted</p>
                <div><label className="block text-xs text-slate-400 mb-1.5">Card Number</label><input className="input-cinema" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} maxLength={16} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">Cardholder Name</label><input className="input-cinema" placeholder="FAITH OGUTU" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-slate-400 mb-1.5">Expiry Date</label><input className="input-cinema" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} maxLength={5} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1.5">CVV</label><input className="input-cinema" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} type="password" maxLength={3} /></div>
                </div>
              </div>
            )}
            {method === "wallet" && (
              <div>
                <h3 className="font-bold text-white mb-1">Digital Wallet</h3>
                <p className="text-slate-400 text-xs mb-4">Pay with PayPal, Skrill, or similar platforms</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["PayPal", "Skrill", "Apple Pay"].map((w) => (
                    <div key={w} className="p-3 text-center bg-cinema-bg border border-cinema-border rounded-xl text-sm text-slate-300 cursor-pointer hover:border-purple-500/40 transition-all">{w}</div>
                  ))}
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">💡 You will be redirected to your wallet provider to complete the payment securely.</div>
              </div>
            )}
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Shield className="w-3.5 h-3.5" />Payments are encrypted with 256-bit SSL. We never store card details.</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-cinema p-5 sticky top-24">
            <h2 className="font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div><p className="text-slate-400 text-xs">Movie</p><p className="text-white font-semibold">{booking.movieTitle}</p></div>
              <div><p className="text-slate-400 text-xs">Show</p><p className="text-white text-sm">{formatDate(booking.startTime)} at {formatTime(booking.startTime)}</p></div>
              <div><p className="text-slate-400 text-xs">Cinema</p><p className="text-white text-sm">{booking.cinemaName}</p></div>
              <div><p className="text-slate-400 text-xs">Seats</p><div className="flex flex-wrap gap-1 mt-1">
                {(typeof booking.seats === "string" ? JSON.parse(booking.seats) : booking.seats).map((s: any) => (
                  <span key={s.seatId} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">{s.seatId.split("-").slice(-1)[0]}</span>
                ))}
              </div></div>
            </div>
            <div className="border-t border-cinema-border pt-4">
              <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-sm">Subtotal</span><span className="text-slate-200">{formatCurrency(booking.totalAmount)}</span></div>
              <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-sm">Booking fee</span><span className="text-slate-200">KES 0</span></div>
              <div className="flex justify-between items-center border-t border-cinema-border pt-3 mt-3"><span className="text-white font-bold">Total</span><span className="text-2xl font-black text-amber-400">{formatCurrency(booking.totalAmount)}</span></div>
            </div>
            <button onClick={handlePay} className="btn-gold w-full mt-5 py-4 flex items-center justify-center gap-2">Pay {formatCurrency(booking.totalAmount)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ params }: { params: { showId: string } }) {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-slate-400">Loading...</div>}>
      <PaymentContent showId={params.showId} />
    </Suspense>
  );
}
