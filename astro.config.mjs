// @ts-check
import { defineConfig } from 'astro/config'

/**
 * Static output: every page is rendered to HTML at build time. Astro's small
 * prefetch runtime warms visible navigation destinations without changing the
 * rendered UI or turning the site into a client-side application.
 *
 * https://astro.build/config
 */
export default defineConfig({
  output: 'static',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

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
