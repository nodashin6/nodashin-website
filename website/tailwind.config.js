/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./docs/**/*.{js,jsx,ts,tsx}",
    "./blog/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {}
  },
  darkMode: ["class", '[data-theme="dark"]'], // Support Docusaurus dark mode
  plugins: [],
}