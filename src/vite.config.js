import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // The root is where vite.config.js is, so 'src'
  // when running 'npm run build' from the 'src' directory.
  // If 'npm run build' is run from project root via 'cd src && npm run build',
  // __dirname will be /home/ubuntu/project/src
  plugins: [react()],
  build: {
    // Output directory: /home/ubuntu/project/public/assets/dist
    outDir: path.resolve(__dirname, '../public/assets/dist'), 
    emptyOutDir: true, // Clean the output directory before build
    sourcemap: false,
    manifest: false, // No manifest.json needed for this setup
    rollupOptions: {
      input: path.resolve(__dirname, 'main.jsx'), // Entry point for the React app
      output: {
        entryFileNames: 'main.js',       // Output JS file name
        chunkFileNames: 'chunk-[name].js', // Chunked JS files
        assetFileNames: 'style.css'      // Output CSS file name (for CSS imported in JS/JSX)
      }
    }
  },
  // Base public path for assets when served. 
  // e.g., if main.js loads an image, it will be /assets/dist/image.png
  base: '/assets/dist/' 
});

