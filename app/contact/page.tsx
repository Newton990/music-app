"use client";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-white mb-2">Get in Touch</h1>
        <p className="text-slate-400">We&apos;d love to hear from you</p>
        <div className="h-1 w-16 bg-gold-gradient rounded-full mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card-cinema p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Email</h3>
              <p className="text-slate-400 text-sm">support@cinemake.co.ke</p>
              <p className="text-slate-500 text-xs mt-1">We reply within 24 hours</p>
            </div>
          </div>

          <div className="card-cinema p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Phone</h3>
              <p className="text-slate-400 text-sm">+254 700 000 000</p>
              <p className="text-slate-500 text-xs mt-1">Mon-Sat, 8AM - 8PM</p>
            </div>
          </div>

          <div className="card-cinema p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Location</h3>
              <p className="text-slate-400 text-sm">Nairobi, Kenya</p>
            </div>
          </div>

          <div className="card-cinema p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Social Media</h3>
              <p className="text-slate-400 text-sm">Follow us on Facebook, Twitter, Instagram &amp; YouTube</p>
            </div>
          </div>
        </div>

        <div className="card-cinema p-6">
          <h3 className="text-white font-semibold mb-4">Send us a message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <textarea
                rows={4}
                placeholder="Your message"
                className="w-full bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gold-gradient text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
