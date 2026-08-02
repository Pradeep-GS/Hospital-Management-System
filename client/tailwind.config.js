/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        erp: {
          bg: '#F3F6FB',
          sidebar: '#F8FAFC',
          navbar: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        medical: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      boxShadow: {
        'erp': '0 4px 20px rgba(15, 23, 42, 0.06)',
        'erp-hover': '0 6px 24px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
