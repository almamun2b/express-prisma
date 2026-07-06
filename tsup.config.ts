import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node23',
  bundle: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  minify: false,
  dts: false,
});
