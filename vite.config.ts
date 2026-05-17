import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: ".",
      router: {
        entry: "router",
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
      server: { entry: "server" },
    }),
    nitro(),
    tailwindcss(),
    viteReact(),
    tsConfigPaths(),
  ],
});
