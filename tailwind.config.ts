import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "rgb(var(--brand-rgb))",
        inky: "var(--inky)",
        midnight: "var(--midnight)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        button:
          "inset 0 1px rgba(240, 240, 240, 0.2), inset 0 -1px rgba(0, 0, 0, 0.4), inset -1px 0px rgba(0, 0, 0, 0.4), inset 1px 0px rgba(240, 240, 240, 0.2)",
      },
      scale: {
        "200": "2",
        "300": "3",
      },
    },
  },
  plugins: [],
};
export default config;
