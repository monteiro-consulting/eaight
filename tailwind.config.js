/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // eaight brand colors
        primary: '#25ced1',
        secondary: '#ea526f',
        accent: '#ff8a5b',
        // Dark theme
        dark: {
          bg: {
            primary: '#1a1a2e',
            secondary: '#2a2a4a',
            tertiary: '#3a3a5c',
          },
          fg: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
            muted: '#6b7280',
          },
        },
        // Light theme
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#fceade',
            tertiary: '#f5f5f5',
          },
          fg: {
            primary: '#1a1a2e',
            secondary: '#6b7280',
            muted: '#9ca3af',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
