// Tailwind CSS v4 is wired up through PostCSS. Without this file Next.js
// never runs the Tailwind plugin, so `@import "tailwindcss"` in globals.css
// is not compiled and every utility class (flex, bg-white, p-6, …) is missing.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
