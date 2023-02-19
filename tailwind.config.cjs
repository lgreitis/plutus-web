/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#101214",
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/typography")],
};
