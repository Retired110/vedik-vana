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
        brand: {
          forest: {
            DEFAULT: "#1B382B",
            50: "#F2F7F4",
            100: "#E3ECE6",
            200: "#C4D8CB",
            300: "#9EBEAA",
            400: "#6D9C80",
            500: "#447858",
            600: "#2F5D43",
            700: "#224733",
            800: "#1B382B",
            900: "#13281E",
            950: "#09140E",
          },
          gold: {
            DEFAULT: "#C99A52",
            light: "#DFB15B",
            dark: "#A37A37",
            pale: "#FAF4EB",
            50: "#FDFBF7",
            100: "#FAF4EB",
            200: "#F3E6D0",
            300: "#E9D2AC",
            400: "#DCBC82",
            500: "#C99A52",
            600: "#B07F3C",
          },
          sage: {
            DEFAULT: "#577A67",
            50: "#F5F8F6",
            100: "#E6ECE8",
            200: "#CBD8CF",
            300: "#A8BEB0",
            400: "#7F9E8B",
            500: "#577A67",
            600: "#436151",
            700: "#344B3F",
          },
          ivory: {
            DEFAULT: "#FBF8F3",
            warm: "#F5EFE6",
            card: "#FFFFFF",
            border: "#EBE3D5",
            muted: "#F0E9DC",
          },
          charcoal: {
            DEFAULT: "#1D231F",
            muted: "#556059",
            light: "#7F8E86",
          },
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        'botanic': '0 4px 20px -2px rgba(27, 56, 43, 0.08), 0 2px 6px -1px rgba(27, 56, 43, 0.04)',
        'botanic-lg': '0 12px 32px -4px rgba(27, 56, 43, 0.12), 0 4px 12px -2px rgba(27, 56, 43, 0.06)',
        'botanic-card': '0 1px 3px rgba(27, 56, 43, 0.04), 0 4px 14px rgba(27, 56, 43, 0.06)',
      },
      borderRadius: {
        'luxury': '0.875rem',
      },
    },
  },
  plugins: [],
};
export default config;
