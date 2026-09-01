/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#7c3aed",
        "primary-hover": "#6d28d9",
        "primary-light": "#f5f3ff",
        "primary-border": "rgba(124, 58, 237, 0.18)",
        "accent": "#8b5cf6",
        "accent-indigo": "#6366f1",
        "background-light": "#faf8ff",
        "background-card": "#ffffff",
        "glass-white": "rgba(255, 255, 255, 0.85)",
        "glass-border": "rgba(124, 58, 237, 0.12)",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: { 
        "DEFAULT": "0.5rem", 
        "lg": "0.75rem", 
        "xl": "1rem", 
        "2xl": "1.5rem",
        "full": "9999px" 
      },
      boxShadow: {
        'violet-glow': '0 10px 30px -10px rgba(124, 58, 237, 0.3)',
        'violet-sm': '0 4px 20px -5px rgba(124, 58, 237, 0.15)',
        'card-soft': '0 10px 25px -5px rgba(124, 58, 237, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(124, 58, 237, 0.45)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
