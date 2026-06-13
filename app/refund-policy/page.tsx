export default function RefundPolicyPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-2">Refund Policy</h1>
      <div className="h-1 w-16 bg-gold-gradient rounded-full mb-8" />
      <div className="card-cinema p-6 text-slate-400 text-sm space-y-4">
        <p>Cancellations made 24+ hours before the show receive a full refund to the original M-Pesa account.</p>
        <p>Cancellations within 24 hours of the show are non-refundable. Refunds are processed within 3-5 business days.</p>
        <p>If a show is cancelled by the cinema, you will receive a full refund automatically.</p>
      </div>
    </div>
  );
}
