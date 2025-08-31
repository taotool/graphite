import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/graphite/", // 👈 By default, Vite assumes your app is served at /. On GitHub Pages, your app will live at https://<username>.github.io/<repo-name>/.

  build: {
    // lib: {
    //   entry: "src/index.js", // your library entry file
    //   name: "Graphite",      // global variable name for UMD builds
    //   fileName: (format) => `graphite.${format}.js`
    // },
    rollupOptions: {
      // Don't bundle React or ReactDOM into your library
      // external: ["react", "react-dom"],
      // output: {
      //   globals: {
      //     react: "React",       // tells Rollup: window.React
      //     "react-dom": "ReactDOM" // tells Rollup: window.ReactDOM
      //   }
      // }
    }
  }
})
