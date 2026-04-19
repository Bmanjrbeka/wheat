import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wheat-Guard color scheme
        primary: {
          50: "#e8f5e8",
          100: "#c3e6c3",
          200: "#9dd69d",
          300: "#76c576",
          400: "#4CAF50", // Emerald Green - main action color
          500: "#45a049",
          600: "#3d8b40",
          700: "#357637",
          800: "#2d612e",
          900: "#254c25",
        },
        background: {
          50: "#fefefe",
          100: "#fbfbfb",
          200: "#f8f8f8",
          300: "#f5f5f5",
          400: "#F5F5DC", // Soft Beige - main background
          500: "#e8e8d8",
          600: "#dcdccc",
          700: "#d0c2b0",
          800: "#c4b894",
          900: "#b8ae78",
        },
        alert: {
          50: "#fff8e1",
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#FFBF00", // Amber - alerts and warnings
          500: "#ffb300",
          600: "#ffa000",
          700: "#ff8f00",
          800: "#ff6f00",
          900: "#ff6f00",
        },
        text: {
          50: "#f8f8f8",
          100: "#e8e8e8",
          200: "#d8d8d8",
          300: "#c8c8c8",
          400: "#b8b8b8",
          500: "#a8a8a8",
          600: "#989898",
          700: "#888888",
          800: "#787878",
          900: "#4D4D4D", // Charcoal - main text
        },
        // Keep brand for backward compatibility
        brand: {
          50:  "#e8f5e8",
          100: "#c3e6c3",
          200: "#9dd69d",
          400: "#4CAF50",
          500: "#4CAF50",
          600: "#3d8b40",
          700: "#357637",
          800: "#2d612e",
          900: "#254c25",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
