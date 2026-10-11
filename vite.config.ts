import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget =
    env.VITE_API_BASE_URL || "https://3.37.77.188.nip.io";

  return {
    plugins: [react(), tailwindcss(), svgr()],
    build: {
      rolldownOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          map: path.resolve(__dirname, "map.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // https 환경에서 공유하기 기능 확인 위함
    server: {
      allowedHosts: [".loca.lt", ".trycloudflare.com"],
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      allowedHosts: [".loca.lt", ".trycloudflare.com"],
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
