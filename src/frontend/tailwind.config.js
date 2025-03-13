/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "lemonade", 
      "forest", 
      {
        light: {
          ...require("daisyui/src/theming/themes")["lemonade"],
          "base-100": "#FFFFFF",
          primary: "#65a30d", // Equivalente ao lime-600
          secondary: "#10b981", // Equivalente ao emerald-500
          accent: "#f97316", // Equivalente ao orange-500
          neutral: "#1F2937",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["forest"],
          primary: "#84cc16", // Equivalente ao lime-500
          secondary: "#10b981", // Equivalente ao emerald-500
          accent: "#f97316", // Equivalente ao orange-500
          neutral: "#1F2937",
          "base-100": "#1a2e05", // Cor base mais escura do tema forest
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
};