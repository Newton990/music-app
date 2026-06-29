export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
      <div className="h-1 w-16 bg-teal-gradient rounded-full mb-8" />
      <div className="card-cinema p-6 text-slate-400 text-sm space-y-4">
        <p>We collect your name, email, and phone number solely for ticket booking and payment processing.</p>
        <p>Your data is never shared with third parties except Paynecta for M-Pesa transactions.</p>
        <p>You may request deletion of your account and associated data by contacting support.</p>
      </div>
    </div>
  );
}
