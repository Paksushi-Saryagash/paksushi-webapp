import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pak: {
          ink: "#15110f",
          red: "#c6262e",
          redDark: "#8f151d",
          cream: "#fff9e8",
          paper: "#fffdf8",
          gold: "#f7d51d",
          yellow: "#ffe11f",
          green: "#17833b",
          greenDark: "#0d5f2a"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(36, 22, 10, 0.12)",
        glow: "0 18px 45px rgba(23, 131, 59, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
