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

  /**
   * `tap` rather than `viewport`: the viewport strategy prefetches every link
   * that scrolls into view, and /teams/ carries 32 team anchors, so one visit to
   * a 63 KB page pulled 2.92 MB of HTML it mostly never used -- a 47x amplifier
   * against GitHub Pages' soft 100 GB/month bandwidth limit.
   *
   * `tap`, not `hover`: Astro's hover strategy binds only focusin and
   * mouseenter/mouseleave (initHoverStrategy in astro/dist/prefetch), so it is
   * inert on touch devices -- which is most of this site's traffic. `tap` binds
   * touchstart and mousedown, firing on phones and desktops alike one event
   * before the navigation commits, and it passes ignoreSlowConnection because a
   * tap is unambiguous intent.
   *
   * AppNav opts its five dock links back into `viewport` explicitly: a fixed,
   * small set present on every page, and warming them is what keeps tab
   * switching instant.
   */
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'tap',
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
