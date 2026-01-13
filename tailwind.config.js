/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2ECC71",
        secondary: "#3498DB",
        accent: "#F1C40F",
        background: "#F8F9FA",
        text: "#2C3E50",
      },
    },
  },
  plugins: [],
}
