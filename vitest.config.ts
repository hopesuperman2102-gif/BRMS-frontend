import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    css: true,
    include: ['**/*.spec.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/src/core/components/**/*.{ts,tsx}',
        'app/src/modules/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/routes/**',
        '**/types/**',
        '**/theme/**',
        '**/constants/**',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
      },
    },
  },
});
