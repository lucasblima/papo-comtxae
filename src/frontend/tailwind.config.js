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
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#4F46E5",
          secondary: "#0EA5E9",
          accent: "#EF4444",
          neutral: "#1F2937",
          "base-100": "#FFFFFF",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#6366F1",
          secondary: "#0EA5E9",
          accent: "#EF4444",
          neutral: "#1F2937",
          "base-100": "#0F172A",
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