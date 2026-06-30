"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Film, Clapperboard, Monitor, Ticket, BarChart3, Settings, ChevronLeft, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/cinemas", label: "Cinemas", icon: Building2 },
  { href: "/admin/movies", label: "Movies", icon: Film },
  { href: "/admin/shows", label: "Shows", icon: Clapperboard },
  { href: "/admin/screens", label: "Screens", icon: Monitor },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login?redirect=/admin");
    } else if (user.role !== "admin") {
      router.push("/");
    }
  }, [user, router, isLoading]);

  if (isLoading) return null;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="pt-16 min-h-screen bg-cinema-bg">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-cinema-card border-r border-cinema-border p-4 sticky top-16">
          <nav className="space-y-1 flex-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all mt-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Site
          </Link>
        </aside>
        <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
