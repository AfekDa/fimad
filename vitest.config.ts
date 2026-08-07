import { getViteConfig } from 'astro/config'

/**
 * `getViteConfig` reuses the project's Astro/Vite pipeline, so tests resolve
 * `.astro` components, CSS modules and `?url` asset imports exactly the way the
 * build does. Components are rendered through Astro's container API and the
 * resulting HTML is asserted against — see src/test/render.ts.
 */
export default getViteConfig({
  test: {
    globals: true,
    // `node`, not `jsdom`: each render builds its own DOM instead. See the
    // note in src/test/render.ts.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/visual/**', 'node_modules/**', 'dist/**'],
  },
})
