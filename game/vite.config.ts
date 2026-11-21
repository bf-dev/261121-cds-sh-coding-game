import { defineConfig, loadEnv } from "vite";

// The LLM settings come from .env (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL).
// In dev and preview the browser calls /llm/* and Vite forwards it to the
// gateway with the key added server-side, so the key never reaches the page.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "LLM_");
  const base = (env.LLM_BASE_URL || "").replace(/\/+$/, "");
  const proxy = base
    ? {
        "/llm": {
          target: base,
          changeOrigin: true,
          secure: false,
          rewrite: (p: string) => p.replace(/^\/llm/, ""),
          headers: env.LLM_API_KEY ? { Authorization: `Bearer ${env.LLM_API_KEY}` } : undefined,
        },
      }
    : undefined;
  return {
    base: "./",
    define: {
      __LLM_ENABLED__: JSON.stringify(Boolean(base)),
      __LLM_MODEL__: JSON.stringify(env.LLM_MODEL || ""),
    },
    server: { proxy },
    preview: { proxy },
    build: { target: "es2022", chunkSizeWarningLimit: 4000 },
  };
});
