import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async ({mode}) => {
  const isProd = mode === 'production';

  return {
    build: {
			minify: isProd,
			sourcemap: !isProd,
			outDir: "build",
			emptyOutDir: true,
			rollupOptions: {
				output: {
					assetFileNames: (assetInfo) => {
						const ext = assetInfo.name?.split(".").pop();
						let prefix = "";
						if (ext?.match(/eot|ttf|otf|woff|woff2/)) {
							prefix = "fonts/";
						} else if (ext?.match(/jpg|jpeg|png|gif|svg|webp/)) {
							prefix = "images/";
						} else if (ext?.match(/css/)) {
							prefix = `${ext}/`;
						}
						return `assets/${prefix}[hash:16][extname]`;
					},
					chunkFileNames: isProd
						? "assets/js/[hash:16].js"
						: "assets/js/[name]-[hash:16].js",
					entryFileNames: isProd
						? "assets/js/[hash:16].js"
						: "assets/js/[name]-[hash:16].js",
				},
			},
		},
    plugins: [
			react(),
      tailwindcss(),
			ViteImageOptimizer({
				png: {
					quality: 100,
				},
				jpeg: {
					quality: 100,
				},
				jpg: {
					quality: 100,
				},
				svg: {
					multipass: true,
					plugins: [
						"preset-default",
						"prefixIds",
						{
							name: "removeViewBox",
						},
						{
							name: "removeEmptyAttrs",
						},
						{
							name: "sortAttrs",
							params: {
								xmlnsOrder: "alphabetical",
							},
						},
					],
				},
			}),
		],
    resolve: {
			alias: {
				"~": path.resolve(__dirname, "./src"),
				features: path.resolve(__dirname, "./src/features"),
				assets: path.resolve(__dirname, "./src/assets"),
				helpers: path.resolve(__dirname, "./src/helpers"),
				utils: path.resolve(__dirname, "./src/utils"),
				interfaces: path.resolve(__dirname, "./src/interfaces"),
			},
		},
		define: {
			APP_VERSION: JSON.stringify(process.env.npm_package_version),
			MODE: JSON.stringify(mode),
			BUILD_DATE: JSON.stringify(new Date().toLocaleString("ru-RU")),
		},
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
  }
});
