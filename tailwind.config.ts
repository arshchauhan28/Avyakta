import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/game/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        navbar: "var(--navbar)",
        surface: "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-hover": "var(--surface-hover)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          hover: "var(--accent-hover)",
          contrast: "var(--accent-contrast)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border-primary)",
        "border-strong": "var(--border-strong)",
        "shadow-color": "var(--shadow-color)",
      },
      boxShadow: {
        neo: "4px 4px 0 var(--shadow-color)",
        "neo-sm": "2px 2px 0 var(--shadow-color)",
        "neo-lg": "6px 6px 0 var(--shadow-color)",
        "neo-hover": "5px 5px 0 var(--shadow-color)",
      },
      fontFamily: {
        sanskrit: ["Noto Serif Devanagari", "serif"],
        serif: ["Cinzel", "Merriweather", "Georgia", "serif"],
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        neo: "6px",
        "neo-sm": "4px",
        "neo-lg": "8px",
      },
    },
  },
  plugins: [],
};

export default config;
