/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontSize: {
          'emoji': '12rem', // This is approximately 192px
        }
      },
    },
    plugins: [],
  }