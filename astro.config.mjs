// @ts-check
import { defineConfig } from 'astro/config'

/**
 * Static output: every page is rendered to HTML at build time and no client
 * runtime is shipped. Nothing in this project uses a `client:*` directive, so
 * `dist/` contains HTML, CSS and assets only.
 *
 * https://astro.build/config
 */
export default defineConfig({
  output: 'static',

  server: {
    host: '127.0.0.1',
    port: 5173,
  },

  vite: {
    build: {
      // Missing local assets referenced through explicit imports must fail the
      // build rather than silently resolving at runtime (plan: "Interfaces and
      // Failure Behavior").
      assetsInlineLimit: 0,
      sourcemap: true,
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: '[name]__[local]__[hash:base64:5]',
      },
    },
  },
})
