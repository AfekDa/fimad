import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ — `defineConfig` comes from vitest/config so the
// `test` block below is type-checked alongside the Vite options.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    // Bind IPv4 explicitly: the default `localhost` resolves to ::1 only on
    // Windows, which Playwright's 127.0.0.1 baseURL cannot reach.
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    // Missing local assets referenced through explicit imports must fail the build
    // rather than silently resolving at runtime (plan: "Interfaces and Failure Behavior").
    assetsInlineLimit: 0,
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/visual/**'],
  },
})
