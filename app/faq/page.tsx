import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I book a ticket?", a: "Browse our movies, select a showtime, pick your preferred seats, and proceed to payment via M-Pesa. You'll receive a QR code ticket instantly." },
  { q: "Can I cancel my booking?", a: "Yes, from your dashboard. Cancellations made 24+ hours before the show receive a full refund. See our refund policy for details." },
  { q: "How do I get my ticket?", a: "After successful payment, a QR code is generated and linked to your account. Show it at the cinema entrance to be let in." },
  { q: "What payment methods are accepted?", a: "We accept M-Pesa, Visa, Mastercard, and PayPal. M-Pesa is the fastest and most popular option." },
  { q: "Can I choose my seats?", a: "Absolutely! Our interactive seat map lets you pick specific seats when booking. You can see which seats are taken in real-time." },
  { q: "Is my payment secure?", a: "Yes. All payments are processed securely through Paynecta (M-Pesa) and our payment partners. We never store your payment details." },
];

export default function FAQPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-slate-400">Everything you need to know about CinemaKE</p>
        <div className="h-1 w-16 bg-teal-gradient rounded-full mx-auto mt-4" />
      </div>
      <div className="space-y-3">
        {faqs.map((item, i) => (
          <details key={i} className="group card-cinema [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
              <span className="text-white font-medium text-sm">{item.q}</span>
              <ChevronDown className="w-4 h-4 text-teal-400 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 border-t border-cinema-border mt-3 pt-3">
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
