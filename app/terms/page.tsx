export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-2">Terms & Conditions</h1>
      <div className="h-1 w-16 bg-teal-gradient rounded-full mb-8" />
      <div className="card-cinema p-6 text-slate-400 text-sm space-y-4">
        <p>By using CinemaKE, you agree to these terms. Tickets are non-refundable unless the show is cancelled by the cinema.</p>
        <p>We reserve the right to cancel bookings suspected of fraud. Pricing is in KES and includes applicable taxes.</p>
        <p>CinemaKE is not liable for loss or damage of personal belongings at partner cinema locations.</p>
      </div>
    </div>
  );
}
