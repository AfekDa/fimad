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
   * The nav marks the current route from the URL and navigates with plain
   * links, so the behaviour only exists in a browser — a unit test can assert
   * the markup but not that following a tab actually lands somewhere.
   */
  test('nav marks the current route and prefetches destinations without changing navigation', async ({ page }) => {
    await page.goto('/')

    const home = page.locator('[data-nav-id="home"]')
    await expect(home).toHaveAttribute('aria-current', 'page')
    await expect(home).toHaveCSS('border-bottom-color', 'rgb(255, 255, 255)')
    await expect(page.locator('[aria-current="page"]')).toHaveCount(1)
    await expect(page.locator('[data-nav-id="teams"]')).toHaveAttribute('data-astro-prefetch', 'viewport')
  })

  test('nav is keyboard operable and its links navigate', async ({ page }) => {
    await page.goto('/')

    const home = page.locator('[data-nav-id="home"]')
    await home.focus()
    await expect(home).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('[data-nav-id="home"]')).toHaveAttribute('aria-current', 'page')
  })

  test('Teams tab navigates to the All Teams screen and becomes current', async ({ page }) => {
    await page.goto('/')

    const teams = page.locator('[data-nav-id="teams"]')
    await teams.focus()
    await expect(teams).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/teams\/?$/)
    await expect(page.locator('[data-nav-id="teams"]')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('ALL 32 TEAMS')
  })

  test('application navigation has the same visual contract on every route', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })

    async function readAppNavContract(path: string) {
      await page.goto(path)

      return await page.locator('[data-app-nav-dock]').evaluate((dock) => {
        const nav = dock.querySelector<HTMLElement>('[data-app-nav]')
        if (nav === null) throw new Error('AppNav rendered without its navigation bar')

        const dockBox = dock.getBoundingClientRect()
        const navBox = nav.getBoundingClientRect()
        const dockStyle = getComputedStyle(dock)
        const navStyle = getComputedStyle(nav)

        return {
          dock: {
            x: dockBox.x,
            y: dockBox.y,
            width: dockBox.width,
            height: dockBox.height,
            backgroundImage: dockStyle.backgroundImage,
          },
          nav: {
            x: navBox.x,
            y: navBox.y,
            width: navBox.width,
            height: navBox.height,
            backgroundColor: navStyle.backgroundColor,
            borderRadius: navStyle.borderRadius,
            paddingInline: navStyle.paddingInline,
            backdropFilter: navStyle.backdropFilter,
            boxShadow: navStyle.boxShadow,
          },
          icons: Array.from(nav.querySelectorAll('img')).map((image) => ({
            src: image.currentSrc,
            box: {
              x: image.getBoundingClientRect().x - navBox.x,
              y: image.getBoundingClientRect().y - navBox.y,
              width: image.getBoundingClientRect().width,
              height: image.getBoundingClientRect().height,
            },
          })),
        }
      })
    }

    const homepage = await readAppNavContract('/')
    const allTeams = await readAppNavContract('/teams')

    expect(allTeams).toEqual(homepage)
  })

  test('All Teams preserves the source frame and asset boxes at 430px', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/teams')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })

    await expect(page.locator('[data-node-id="162:1760"]')).toHaveCSS('min-height', '2877px')
    expect(await page.locator('[data-node-id="162:1773"]').boundingBox()).toMatchObject({ y: 24 })

    const cards = page.locator('[data-node-id="181:325"] article')
    await expect(cards).toHaveCount(8)

    const firstCard = cards.first()
    expect(await firstCard.boundingBox()).toMatchObject({ width: 382, height: 295 })

    const firstImage = page.locator('[data-node-id="I181:1360;162:2225"] img')
    expect(await firstImage.boundingBox()).toMatchObject({ width: 382, height: 295 })

    const cincinnatiImage = page.locator('[data-node-id="474:1383"] img')
    expect(await cincinnatiImage.boundingBox()).toMatchObject({ width: 938, height: 625 })

    const logoBox = firstCard.locator('[data-node-id="181:1340"]')
    expect(await logoBox.boundingBox()).toMatchObject({ width: 60, height: 40 })

    const teamsIcon = page.locator('[data-nav-id="teams"] > span[style]')
    const teamsIconBox = await teamsIcon.boundingBox()
    expect(teamsIconBox).toMatchObject({ width: 40, height: 32 })
  })

  test('Homepage starts with the centered Cody Brown brand header', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/')

    const brand = page.locator('[data-homepage-brand]')
    await expect(brand).toContainText('Cody Brown’s')
    await expect(brand).toContainText('NFL BETTING GUIDE')
    await expect(brand).toHaveCSS('align-items', 'center')
    expect(await brand.boundingBox()).toMatchObject({ x: 0, y: 0, width: 430, height: 63 })
  })

  test('All Teams filters cards by conference and team name', async ({ page }) => {
    await page.goto('/teams')

    const visibleCards = page.locator('[data-team-card]:not([hidden])')
    const afc = page.getByRole('button', { name: 'AFC' })
    const nfc = page.getByRole('button', { name: 'NFC' })
    const search = page.getByRole('searchbox', { name: 'Search teams' })

    await expect(visibleCards).toHaveCount(8)
    await nfc.click()
    await expect(nfc).toHaveAttribute('aria-pressed', 'true')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(0)
    await expect(page.getByText('No teams match your filters.')).toBeVisible()

    await afc.click()
    await search.fill('miami')
    await expect(visibleCards).toHaveCount(1)
    await expect(visibleCards.first()).toHaveAttribute('data-team', 'Miami Dolphins')

    // Enter must not submit the search form and reload away the active filters.
    await search.press('Enter')
    await expect(search).toHaveValue('miami')
    await expect(afc).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleCards).toHaveCount(1)

    await page.getByRole('button', { name: 'Clear All' }).click()
    await expect(search).toHaveValue('')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(8)

    await page.getByRole('button', { name: 'Filter teams by name' }).click()
    await expect(search).toBeFocused()
  })

  /*
   * Three tabs have no screen yet. They must be visible, because the design
   * draws all five, but must not behave like destinations — no href, and not
   * in the tab order.
   */
  test('nav tabs without a page are inert', async ({ page }) => {
    await page.goto('/')

    for (const id of ['awards', 'all-bets', 'fanduel']) {
      const tab = page.locator(`[data-nav-id="${id}"]`)
      await expect(tab).toBeVisible()
      await expect(tab).toHaveAttribute('aria-disabled', 'true')
      expect(await tab.evaluate((el) => el.tagName)).toBe('SPAN')
    }

    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(2)
  })

  test('responsive suite has screens to exercise', () => {
    expect(
      SCREENS.length,
      'No screens are implemented, so nothing below this ran. src/routes/screens.ts is empty.',
    ).toBeGreaterThan(0)
  })
})
