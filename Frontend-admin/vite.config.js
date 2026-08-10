import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: { port: 5174 },
  build: {
    rollupOptions: {
      // Vite only builds index.html by default. Since this is a multi-page
      // app (index.html redirects, login.html is the login form, dashboard.html
      // is the control panel), each HTML file must be explicitly listed here —
      // otherwise Vite silently leaves login.html and dashboard.html out of
      // the production build entirely, which is exactly why they 404 on Netlify
      // even though they work fine locally with `npm run dev`.
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
});