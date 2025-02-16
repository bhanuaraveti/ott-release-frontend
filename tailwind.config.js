export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        animation: {
          bounce: "bounce 2s infinite",
          spin: "spin 2s linear infinite",
          ping: "ping 2s linear infinite",
        },
      },
    },
    plugins: [],
  };