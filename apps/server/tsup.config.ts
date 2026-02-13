import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node20",
  // Bundle workspace deps; externalize runtime deps (better-auth, pg, etc.)
  noExternal: ["@workspace/db"],
});
