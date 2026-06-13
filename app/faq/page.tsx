export default function FAQPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-2">FAQ</h1>
      <div className="h-1 w-16 bg-gold-gradient rounded-full mb-8" />
      <div className="space-y-6">
        {[
          { q: "How do I book a ticket?", a: "Browse movies, select a showtime, pick your seats, and proceed to payment via M-Pesa." },
          { q: "Can I cancel my booking?", a: "Yes, from your dashboard. Cancellation is subject to our refund policy." },
          { q: "How do I get my ticket?", a: "A QR code is generated after successful payment. Show it at the cinema." },
        ].map((item, i) => (
          <div key={i} className="card-cinema p-6">
            <h3 className="text-white font-semibold mb-2">{item.q}</h3>
            <p className="text-slate-400 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
