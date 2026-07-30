import { defineConfig, devices } from '@playwright/test'

/**
 * Two kinds of run:
 *
 *  - `figma-fidelity` renders each route at its native Figma frame size with
 *    deviceScaleFactor 2 and compares against the MCP-exported reference PNG,
 *    which Figma emits at 2x. Matching the scale means neither side is
 *    resampled before comparison.
 *  - `mobile-chrome` / `mobile-safari` run the responsive suite across the
 *    320-480px range on the actual browser targets.
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  // Spread rather than `: undefined` — `exactOptionalPropertyTypes` treats an
  // explicit undefined as a different type from an absent property.
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: [['html', { open: 'never' }], ['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',

  expect: {
    toHaveScreenshot: {
      /*
       * Measured floor against the Figma export is 0.025 (73,389 of 2,918,840
       * pixels) with the layout landing on Figma's geometry exactly. That
       * residue is entirely edge anti-aliasing: Figma and Chromium rasterise
       * glyphs differently and resample the hero bitmap with different filters,
       * neither of which CSS can control. Toggling font-smoothing changes it by
       * zero pixels. 0.035 leaves headroom above that floor while still failing
       * on any real layout, colour, or asset regression.
       */
      maxDiffPixelRatio: 0.035,
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    },
  },

  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'figma-fidelity',
      testMatch: /frames\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
        isMobile: false,
      },
    },
    {
      name: 'mobile-chrome',
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:4173',
    // Never reuse: this suite compares pixels, and a preview server left over
    // from an earlier run would silently serve a stale build.
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
