"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch { toast.error("Failed to load settings"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleReveal = (key: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${key} saved`);
    } catch { toast.error(`Failed to save ${key}`); }
  };

  if (loading) return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-cinema-card rounded" />
        <div className="h-64 bg-cinema-card rounded-2xl" />
      </div>
    </div>
  );

  const renderField = (key: string, label: string, opts?: { type?: string; masked?: boolean; placeholder?: string }) => {
    const { masked, placeholder } = opts || {};
    const isRevealed = revealed.has(key);
    const inputType = masked && !isRevealed ? "password" : "text";

    return (
      <div key={key} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">{label}</label>
          <input
            type={inputType}
            placeholder={placeholder || label}
            value={settings[key] || ""}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            className="input-cinema"
          />
        </div>
        {masked && (
          <button
            type="button"
            onClick={() => toggleReveal(key)}
            className="p-2.5 mb-0.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isRevealed ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSave(key, settings[key] || "")}
          className="btn-teal text-sm px-4 py-2.5 flex items-center gap-2 whitespace-nowrap"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure payment gateways and site preferences</p>
        <div className="h-1 w-16 bg-teal-gradient rounded-full mt-3" />
      </div>

      <div className="space-y-8">
        <div className="card-cinema p-6">
          <h2 className="text-lg font-bold text-white mb-5">Paystack (Card Payments)</h2>
          <div className="space-y-4">
            {renderField("paystack_public_key", "Public Key", { masked: true, placeholder: "pk_live_xxxxxxxx" })}
            {renderField("paystack_secret_key", "Secret Key", { masked: true, placeholder: "sk_live_xxxxxxxx" })}
          </div>
        </div>

        <div className="card-cinema p-6">
          <h2 className="text-lg font-bold text-white mb-5">Paynecta (M-Pesa)</h2>
          <div className="space-y-4">
            {renderField("paynecta_api_key", "API Key", { masked: true })}
            {renderField("paynecta_email", "Email", { placeholder: "api@example.com" })}
            {renderField("paynecta_payment_code", "Payment Code")}
            {renderField("paynecta_base_url", "Base URL", { placeholder: "https://paynecta.co.ke/api/v1" })}
          </div>
        </div>

        <div className="card-cinema p-6">
          <h2 className="text-lg font-bold text-white mb-5">General</h2>
          <div className="space-y-4">
            {renderField("site_name", "Site Name", { placeholder: "CinemaKE" })}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Currency</label>
                <select
                  value={settings["site_currency"] || "KES"}
                  onChange={(e) => setSettings({ ...settings, site_currency: e.target.value })}
                  className="input-cinema"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleSave("site_currency", settings["site_currency"] || "KES")}
                className="btn-teal text-sm px-4 py-2.5 flex items-center gap-2 whitespace-nowrap"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
