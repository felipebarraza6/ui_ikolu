import path from "node:path";
import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** CRA left JSX inside .js files. Convert them before the React plugin runs. */
function jsxInJs(): Plugin {
  return {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
      if (!/\/src\/.*\.js$/.test(id) || id.includes("node_modules")) return null;
      return transformWithEsbuild(code, id, {
        loader: "jsx",
        jsx: "automatic",
      });
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
