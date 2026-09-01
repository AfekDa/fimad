import { test, expect, type Page } from '@playwright/test'

/**
 * Regression guard for the 28 Aug iPhone report: page content ghosting through
 * Safari's floating address pill.
 *
 * iOS 26 Safari will not paint `position: fixed` or `position: sticky` content
 * in the strip its controls occupy. It fills that strip with a blurred sample of
 * the *scrolling layer* instead, which is why a sticky header hid the cards on
 * screen but not in the browser chrome, and why the earlier fixed navy shield
 * could not help either.
 *
 * This reproduces that sampling rule directly: hide everything fixed or sticky,
 * then read the strip. Whatever is left is what Safari has to draw with. The
 * screens must leave it solid navy at every scroll offset -- which they do by
 * never letting content into the strip in the first place (see app.css).
 */

/* Measured from the reported screenshot: iPhone 14, 390x844pt. The status bar
 * and the floating address pill together cover the top 86pt of the page. */
const CONTROL_STRIP = 86

/** Everything Safari can actually draw in its control strip. */
async function sampleControlStrip(page: Page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const position = getComputedStyle(el).position
      if (position === 'fixed' || position === 'sticky') {
        el.setAttribute('data-not-painted-under-controls', '')
      }
    }
    const style = document.createElement('style')
    style.id = 'control-strip-sampler'
    style.textContent = '[data-not-painted-under-controls] { visibility: hidden !important }'
    document.head.append(style)
  })

  const strip = await page.screenshot({
    clip: { x: 0, y: 0, width: page.viewportSize()!.width, height: CONTROL_STRIP },
  })

  await page.evaluate(() => {
    document.getElementById('control-strip-sampler')?.remove()
    for (const el of document.querySelectorAll('[data-not-painted-under-controls]')) {
      el.removeAttribute('data-not-painted-under-controls')
    }
  })

  return strip
}


const ROUTES = [
  { path: '/teams', name: 'All Teams' },
  { path: '/awards', name: 'Awards' },
  { path: '/all-bets', name: 'All Bets' },
  { path: '/awards/mvp', name: 'MVP picks' },
  { path: '/teams/buffalo-bills', name: 'Individual Team' },
]

for (const route of ROUTES) {
  test(`${route.name}: nothing bleeds into Safari's control strip`, async ({ page }) => {
    await page.goto(route.path)
    // Stand in for the inset Safari reports through env(safe-area-inset-top)
    // with viewport-fit=cover; headless browsers report none.
    await page.addStyleTag({
      content: `.appScrollHeader { padding-top: ${CONTROL_STRIP + 24}px !important }`,
    })
    await page.waitForTimeout(300)

    const scrollTo = async (offset: number) =>
      page.evaluate((y) => {
        window.scrollTo(0, y)
        const area = document.querySelector('.appScrollArea')
        if (area !== null) area.scrollTop = y
      }, offset)

    for (const offset of [0, 160, 420, 900, 4000]) {
      await scrollTo(offset)
      await page.waitForTimeout(200)
      const strip = await sampleControlStrip(page)

      // Decode by drawing the capture back into a canvas in the page.
      const bleed = await page.evaluate(async (bytes) => {
        const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' })
        const bitmap = await createImageBitmap(blob)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(bitmap, 0, 0)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let off = 0
        for (let i = 0; i < data.length; i += 4) {
          // Anything materially lighter than #011556 is bled page content.
          if (data[i]! > 60 || data[i + 1]! > 80 || data[i + 2]! > 170) off += 1
        }
        return off / (data.length / 4)
      }, [...strip])

      expect(
        bleed,
        `${route.name} at scroll ${offset}: ${(bleed * 100).toFixed(2)}% of Safari's control strip is page content, not navy`,
      ).toBe(0)
    }
  })
}
