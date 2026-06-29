"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { User, Mail, Phone, Shield, Edit2, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your account details and preferences</p>
        <div className="h-1 w-16 bg-teal-gradient rounded-full mx-auto mt-4" />
      </div>

      <div className="card-cinema p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar side */}
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
            <div className="w-32 h-32 rounded-full bg-teal-500/10 border-2 border-teal-500/40 flex items-center justify-center text-5xl font-bold text-teal-500 shadow-[0_0_30px_rgba(45,212,191,0.1)] relative">
              {user.name.charAt(0).toUpperCase()}
              <button className="absolute bottom-0 right-0 p-2 bg-cinema-card border border-cinema-border rounded-full hover:bg-teal-500/20 hover:text-teal-400 transition-colors text-slate-400 cursor-not-allowed" title="Change Avatar (Not available in demo)">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-[10px] uppercase font-bold text-xs rounded-full ${
                user.role === "admin" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}>
                {user.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {user.role}
              </span>
            </div>
          </div>

          {/* Details side */}
          <div className="w-full md:w-2/3 space-y-6">
            <h3 className="font-bold text-white border-b border-cinema-border pb-3">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <User className="w-3 h-3 text-teal-400" /> Full Name
                </label>
                <div className="bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-slate-200">
                  {user.name}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-teal-400" /> Email Address
                </label>
                <div className="bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-slate-200">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-teal-400" /> Phone Number
                </label>
                <div className="bg-cinema-bg border border-cinema-border rounded-lg px-4 py-3 text-sm text-slate-200">
                  {user.phone}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-cinema-border flex items-center justify-between">
              <button className="btn-outline-teal text-sm cursor-not-allowed opacity-50" title="Editing disabled in mock mode">
                Edit Profile
              </button>

              <button 
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-4 py-2 hover:bg-red-500/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
