/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jaha: {
          red: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
}
