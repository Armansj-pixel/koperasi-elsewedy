import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // <-- Pastikan baris ini ada!
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Tambahkan ini jika kamu taruh komponen di lib
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
