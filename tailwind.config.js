/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        kaspa: "#00E8C8",
        kaspaMint: "#00FFA3",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.3" },
          "50%": { transform: "translateY(-60px)", opacity: "0.8" },
        },
      },
      animation: {
        float: "float 10s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
