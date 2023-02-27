/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#101214",
      },
      keyframes: {
        "loading-blink": {
          "0%, 100%": { opacity: "0.2" },
          "20%": { opacity: "1" },
        },
      },
      animation: {
        "loading-blink": `loading-blink 1.4s infinite both`,
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/typography")],
};
