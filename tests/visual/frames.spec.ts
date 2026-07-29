/**
 * Pixel comparison against Figma.
 *
 * Baselines in `tests/visual/__screenshots__/figma-fidelity/` are crops of the
 * MCP-exported PNGs of the corresponding Figma frames (Figma exports at 2x,
 * which is why this project runs at deviceScaleFactor 2). They are NOT
 * self-generated screenshots — regenerating them from the app would compare the
 * app to itself and make this test meaningless. The uncropped exports live in
 * `tests/visual/refs/`; `refs/crop-baselines.ps1` regenerates the crops.
 *
 * The frame is compared in two bands because it is taller than the viewport it
 * is drawn for:
 *
 *   0 .. viewportHeight    the first viewport, including the docked nav, which
 *                          the frame draws at its scroll-offset-0 position
 *   viewportHeight .. end  the document that scrolls underneath that chrome
 *
 * Tolerance is configured in playwright.config.ts and covers anti-aliasing only.
 */
import { expect, test, type Page } from '@playwright/test'
import { SCREENS } from '../../src/routes/screens'

/** Nav 1:127: height 81, bottom edge 811 + 81 = 892 in a 932 viewport. */
const NAV_HEIGHT = 81
const NAV_BOTTOM_OFFSET = 40

/**
 * Fonts and every raster asset must be decoded before the first capture, or the
 * comparison races the 1.4MB hero poster.
 */
async function waitForPaintableAssets(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
    )
  })
}

test.describe('frame fidelity', () => {
  test('the screen manifest is populated', () => {
    expect(
      SCREENS.length,
      'No screens are implemented. Figma extraction has not run — see BLOCKERS.md.',
    ).toBeGreaterThan(0)
  })

  for (const route of SCREENS) {
    const id = route.nodeId.replace(':', '-')

    test(`${route.frameName} (${route.nodeId}) matches its Figma export in the first viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: route.width, height: route.viewportHeight })
      await page.goto(route.path)
      await waitForPaintableAssets(page)

      // Viewport screenshot, not fullPage: this is the band where the fixed nav
      // and its scrim sit exactly where the frame draws them (747 and 811).
      await expect(page).toHaveScreenshot(`${id}-viewport.png`)
    })

    test(`${route.frameName} (${route.nodeId}) matches its Figma export below the fold`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: route.width, height: route.viewportHeight })
      await page.goto(route.path)
      await waitForPaintableAssets(page)

      // The docked chrome is viewport-anchored, so in a full-page capture it
      // renders at the bottom of the document instead of at 747/811. Its
      // fidelity is asserted by the test above; here it is taken out of the way
      // so the document band underneath can be compared.
      await page.addStyleTag({
        content: '[data-node-id="1:126"] { display: none !important; }',
      })

      // Clipped to the frame rather than the document: the document runs ~2px
      // taller because the browser's text-box trimming rounds each text block a
      // fraction of a pixel differently from Figma, and the app is deliberately
      // auto-height so it stays fluid from 320-480px.
      await expect(page).toHaveScreenshot(`${id}-below-fold.png`, {
        fullPage: true,
        clip: {
          x: 0,
          y: route.viewportHeight,
          width: route.width,
          height: route.height - route.viewportHeight,
        },
      })
    })

    test(`${route.frameName} (${route.nodeId}) keeps the nav docked while scrolling`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: route.width, height: route.viewportHeight })
      await page.goto(route.path)
      await waitForPaintableAssets(page)

      const nav = page.getByRole('navigation', { name: 'Primary' })
      const atTop = await nav.boundingBox()
      expect(atTop, 'Nav was not rendered').not.toBeNull()

      // Figma: nav top 811 in a 932 viewport.
      expect(atTop?.y).toBeCloseTo(route.viewportHeight - NAV_BOTTOM_OFFSET - NAV_HEIGHT, 0)

      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight)
      })
      const atBottom = await nav.boundingBox()

      expect(atBottom?.y).toBeCloseTo(atTop?.y ?? 0, 0)
    })
  }
})
