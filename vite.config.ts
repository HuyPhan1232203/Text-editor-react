import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),tsconfigPaths(),],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // The pagination extension lives in packages/ and is used from source (published separately to npm)
      { find: /^tiptap-a4-pagination$/, replacement: path.resolve(__dirname, './packages/tiptap-a4-pagination/src/index.ts') },
      { find: /^tiptap-a4-pagination\/styles\.css$/, replacement: path.resolve(__dirname, './packages/tiptap-a4-pagination/src/styles.css') },
      // Load KaTeX only when a document contains math (see src/lib/katex-lazy.ts)
      { find: /^katex$/, replacement: path.resolve(__dirname, './src/lib/katex-lazy.ts') },
    ],
  },
})