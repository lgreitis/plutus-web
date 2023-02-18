/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#1c1b22",
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/typography")],
};
