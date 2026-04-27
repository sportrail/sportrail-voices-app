import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sr-red": "#ED1C24",
        "sr-red-hover": "#c41920",
        "sr-black": "#0B0A0F",
        "sr-card": "#13121A",
        "sr-border": "#222130",
        "sr-grey": "#AAAAAA",
        "sr-grey-dim": "#666666",
        "sr-cream": "#FAF8F5",
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sr: "5px",
      },
    },
  },
  plugins: [],
};

export default config;
