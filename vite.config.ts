
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  if (mode === "static") {
    
    // Default (demo app for GitHub Pages)
    return {
      plugins: [react()],
      base: "/graphite",
      build: {
        outDir: "gh-pages"
      }
    };
  }
return {
      plugins: [react(),
            dts({
              entryRoot: "src",
              outDir: "dist/types",
              insertTypesEntry: true, 
              include: ["src/**/*.ts", "src/**/*.tsx"],
            })
      ],
      build: {
        lib: {
          entry: "src/index.ts",
          name: "Graphite",
          fileName: (format) => `graphite.${format}.js`
        },
        rollupOptions: {
          external: ["react", "react-dom"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM"
            }
          }
        }
      }
    };
});
