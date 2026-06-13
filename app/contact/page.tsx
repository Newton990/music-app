export default function ContactPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-2">Contact Us</h1>
      <div className="h-1 w-16 bg-gold-gradient rounded-full mb-8" />
      <div className="card-cinema p-6 text-slate-400 text-sm space-y-4">
        <p>Email: support@cinemake.co.ke</p>
        <p>Phone: +254 700 123 456</p>
        <p>Follow us on social media for updates on new releases and promotions.</p>
      </div>
    </div>
  );
}
