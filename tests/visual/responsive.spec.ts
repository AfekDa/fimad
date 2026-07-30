import { expect, test } from '@playwright/test'
import { SCREENS } from '../../src/routes/screens'

/** Plan: "Test each route at 320, 375, 390, 430, and 480 px, plus the exact source width". */
const BREAKPOINTS = [320, 375, 390, 430, 480] as const

test.describe('responsive integrity', () => {
  for (const route of SCREENS) {
    const widths = [...new Set<number>([...BREAKPOINTS, route.width])].sort((a, b) => a - b)

    for (const width of widths) {
      test(`${route.frameName} has no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: route.height })
        await page.goto(route.path)
        await page.evaluate(() => document.fonts.ready)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            offenders: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
              .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
              .slice(0, 5)
              .map((el) => `${el.tagName.toLowerCase()}.${el.className || '(no class)'}`),
          }
        })

        expect(
          overflow.scrollWidth,
          `Horizontal overflow at ${width}px. Offenders: ${overflow.offenders.join(', ') || 'none identified'}`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1)
      })
    }

    test(`${route.frameName} centres within ${480}px above the max width`, async ({ page }) => {
      await page.setViewportSize({ width: 900, height: route.height })
      await page.goto(route.path)

      const shell = page.locator('.appShell')
      const box = await shell.boundingBox()
      expect(box, 'App shell was not rendered').not.toBeNull()
      expect(box?.width).toBeLessThanOrEqual(480)
      // Equal gutters either side.
      expect(Math.abs((box?.x ?? 0) - (900 - (box?.width ?? 0) - (box?.x ?? 0)))).toBeLessThanOrEqual(1)
    })
  }

  /*
   * Nav selection is a native radio group with no JavaScript behind it, so it
   * cannot be exercised in a unit test — the behaviour only exists in a
   * browser. These tests cover what the component test used to assert about
   * clicking and keyboard operation.
   */
  test('nav selection works with no JavaScript on the page', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#nav-tab-home')).toBeChecked()
    expect(await page.locator('script').count(), 'The page shipped a script').toBe(0)

    await page.getByText('All Bets').click()

    await expect(page.locator('#nav-tab-all-bets')).toBeChecked()
    await expect(page.locator('#nav-tab-home')).not.toBeChecked()
    await expect(page.locator('label[for="nav-tab-all-bets"]')).toHaveCSS(
      'border-bottom-color',
      'rgb(255, 255, 255)',
    )
  })

  test('nav is keyboard operable', async ({ page }) => {
    await page.goto('/')

    await page.locator('#nav-tab-home').focus()
    await expect(page.locator('#nav-tab-home')).toBeFocused()

    // Native radio-group behaviour: arrow keys move and select in one step.
    await page.keyboard.press('ArrowRight')

    await expect(page.locator('#nav-tab-teams')).toBeChecked()
    await expect(page.locator('#nav-tab-home')).not.toBeChecked()
  })

  test('responsive suite has screens to exercise', () => {
    expect(
      SCREENS.length,
      'No screens are implemented. Figma extraction has not run — see BLOCKERS.md.',
    ).toBeGreaterThan(0)
  })
})
