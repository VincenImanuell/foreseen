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
        // Oracle palette pulled from the Foreseen logo: deep void, mystic
        // purple, scrying cyan, prophetic gold.
        void: "#0a0a14",
        panel: "#12121f",
        oracle: {
          purple: "#7c5cff",
          cyan: "#37e6ff",
          gold: "#f5c451",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(124, 92, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
