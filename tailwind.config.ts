import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        cinema: {
          bg: "#080c14",
          card: "#0f1623",
          border: "#1e2d45",
          gold: "#f5a623",
          "gold-light": "#fbbf24",
          red: "#e53e3e",
          "accent-blue": "#3b82f6",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f5a623 0%, #f59e0b 100%)",
        "hero-gradient":
          "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.8) 60%, rgba(8,12,20,1) 100%)",
        "card-gradient":
          "linear-gradient(145deg, #0f1623 0%, #0a1020 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-gold": "pulseGold 2s infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 166, 35, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(245, 166, 35, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        gold: "0 0 20px rgba(245, 166, 35, 0.3)",
        "gold-lg": "0 0 40px rgba(245, 166, 35, 0.4)",
        card: "0 4px 24px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
