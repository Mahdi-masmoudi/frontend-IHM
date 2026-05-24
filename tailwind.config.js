/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  important: true,
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#2563eb',
          700: '#1d4ed8'
        }
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
};
