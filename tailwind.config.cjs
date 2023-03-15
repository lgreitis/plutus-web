/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss/defaultTheme')} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

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
      fontFamily: {
        sans: ["San Francisco", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/typography")],
};
