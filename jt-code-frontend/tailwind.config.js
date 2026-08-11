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
        background: '#f8fafc',
        foreground: '#111827',
        card: '#ffffff',
        'card-foreground': '#111827',
        primary: '#1687ff',
        'primary-foreground': '#ffffff',
        secondary: '#f8fafc',
        'secondary-foreground': '#111827',
        muted: '#f3f4f6',
        'muted-foreground': '#6b7280',
        accent: '#f0f7ff',
        'accent-foreground': '#111827',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#1687ff',
        popover: '#ffffff',
        'popover-foreground': '#111827',
      },
    },
  },
  plugins: [],
};
