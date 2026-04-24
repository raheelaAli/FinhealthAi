/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // FinHealth AI Brand Colors — extracted from logo & banner
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",   // Primary CTA green
          700: "#15803d",   // Hover state
          800: "#1a7f4b",   // Logo text color
          900: "#14532d",   // Dark green
          950: "#052e16",   // Darkest
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",   // Banner teal accent
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      fontFamily: {
        sans:    ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        brand: "0 4px 24px 0 rgba(22, 163, 74, 0.15)",
        "brand-lg": "0 8px 40px 0 rgba(22, 163, 74, 0.20)",
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #16a34a 0%, #0d9488 100%)",
        "brand-gradient-light": "linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 100%)",
        "hero-mesh": "radial-gradient(ellipse at 70% 50%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(13,148,136,0.10) 0%, transparent 50%)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease both",
        "fade-in":   "fadeIn 0.4s ease both",
        "slide-in":  "slideIn 0.3s ease both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:     { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:     { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn:    { "0%": { opacity: "0", transform: "translateX(-8px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        pulseSoft:  { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
      },
    },
  },
  plugins: [],
};
