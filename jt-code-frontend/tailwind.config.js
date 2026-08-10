/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050b14',
        foreground: '#edf5ff',
        card: '#0a1422',
        'card-foreground': '#edf5ff',
        primary: '#1687ff',
        'primary-foreground': '#03101f',
        secondary: '#0e1c2e',
        'secondary-foreground': '#edf5ff',
        muted: '#0a1422',
        'muted-foreground': '#9fb0c4',
        accent: '#0e1c2e',
        'accent-foreground': '#edf5ff',
        destructive: '#ff6b75',
        'destructive-foreground': '#03101f',
        border: '#1f344c',
        input: '#1f344c',
        ring: '#1687ff',
        popover: '#0a1422',
        'popover-foreground': '#edf5ff',
      },
    },
  },
  plugins: [],
};
