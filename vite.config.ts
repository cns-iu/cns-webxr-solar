import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const gitHubPagesBase = repositoryName ? `/${repositoryName}/` : "/";
const base = process.env.VITE_BASE_PATH ?? (isGitHubActions ? gitHubPagesBase : "/");

export default defineConfig({
  base,
  plugins: [tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
  },
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
  build: {
    target: "esnext",
  },
});
