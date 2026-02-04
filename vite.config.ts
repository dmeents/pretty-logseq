import { defineConfig } from 'vite';
import logseqPlugin from 'vite-plugin-logseq';

export default defineConfig({
  plugins: [logseqPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['@logseq/libs'],
    },
  },
});
