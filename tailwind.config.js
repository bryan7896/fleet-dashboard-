export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dark: {
          100: '#1e1e2f',
          200: '#2d2d3f',
          300: '#3d3d4f',
        }
      }
    },
  },
  plugins: [],
}