import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SDLE Platform v5 Color System (from landing page)
        teal: {
          DEFAULT: "#4A8FA3",
          mid: "#7BB3C4",
          light: "#D5E8F0",
          dark: "#357a8f",
        },
        navy: {
          DEFAULT: "#1A1A2E",
          mid: "#252545",
          light: "#2e2e50",
        },
        "off-white": "#F5F9FB",
        white: "#ffffff",
        gray: {
          DEFAULT: "#6B7280",
          light: "#E5E7EB",
          border: "#dde4ea",
        },
        black: "#111111",
        green: "#22c55e",
        amber: "#f59e0b",
        red: "#ef4444",
        // Legacy colors (for backward compatibility)
        "dall-teal": {
          DEFAULT: "#4A8FA8",
          dark: "#2E6B82",
          light: "#7AB8CC",
          mid: "#C4DDE8",
          wash: "#EAF4F8",
        },
        dall: {
          50: "var(--dall-cloud)",
          100: "var(--dall-teal-wash)",
          200: "var(--dall-teal-mid)",
          300: "var(--dall-teal-light)",
          400: "var(--dall-teal)",
          500: "var(--dall-teal-dark)",
          600: "var(--dall-charcoal)",
          700: "var(--dall-ink)",
          800: "#000000",
          900: "#000000",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        arabic: ["IBM Plex Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
