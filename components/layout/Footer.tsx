import Link from "next/link";
import { Film, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#060a10] border-t border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center">
                <Film className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-gradient-gold">Cinema</span>
                <span className="text-white">KE</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Kenya's premier online movie ticket booking platform. Experience cinema like never before.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-cinema-card border border-cinema-border flex items-center justify-center hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/movies", label: "Now Showing" },
                { href: "/movies?status=coming_soon", label: "Coming Soon" },
                { href: "/cinemas", label: "Cinemas" },
                { href: "/dashboard", label: "My Bookings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/faq", label: "FAQ" },
                { href: "/refund-policy", label: "Refund Policy" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 text-sm hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                Kenya Highlands University, Kericho, Kenya
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                +254 700 000 000
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                info@cinemake.co.ke
              </li>
            </ul>
            {/* Payment icons */}
            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2">Supported Payments</p>
              <div className="flex gap-2">
                {["M-Pesa", "Visa", "M/C", "PayPal"].map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-cinema-card border border-cinema-border px-2 py-1 rounded text-slate-400 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-cinema-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {year} CinemaKE. Kenya Highlands University — BIT/007/2022
          </p>
          <p className="text-slate-600 text-xs">
            Developed by Faith Ogutu Moraa · Supervisor: Geofrey Rotich
          </p>
        </div>
      </div>
    </footer>
  );
}
