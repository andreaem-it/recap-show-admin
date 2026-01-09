/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#0a0a0a',
          surface: '#1a1a1a',
          surfaceSecondary: '#2a2a2a',
          text: '#ffffff',
          textSecondary: '#a0a0a0',
          border: '#333333',
          primary: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}

