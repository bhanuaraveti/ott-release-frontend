export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable manual dark mode toggle
  theme: {
    extend: {
      animation: {
        bounce: "bounce 2s infinite",
        spin: "spin 2s linear infinite",
        ping: "ping 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        primary: {
          light: '#646cff',
          DEFAULT: '#535bf2',
          dark: '#4349d3',
          500: '#535bf2', // For focus states on search inputs
        },
        secondary: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        }
      },
      boxShadow: {
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: 'inherit',
            a: {
              color: 'var(--primary-color)',
              '&:hover': {
                color: 'var(--primary-hover)',
              },
            },
          },
        },
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};