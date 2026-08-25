import { expect, test } from '@playwright/test'
import { SCREENS } from '../../src/routes/screens'

/** Plan: "Test each route at 320, 375, 390, 430, and 480 px, plus the exact source width". */
const BREAKPOINTS = [320, 375, 390, 430, 480] as const

/** The production build minifies CSS times, so `320ms` reaches the browser as `.32s`. */
function toMilliseconds(cssTime: string): number {
  const value = Number.parseFloat(cssTime)

  return cssTime.trim().endsWith('ms') ? value : value * 1000
}

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

    const routeMaxWidth = ['/', '/teams', '/teams/buffalo-bills'].includes(route.path) ? 1400 : 480

    test(`${route.frameName} centres within ${routeMaxWidth}px above the max width`, async ({ page }) => {
      await page.setViewportSize({ width: 1400, height: route.height })
      await page.goto(route.path)

      const shell = page.locator('.appShell')
      const box = await shell.boundingBox()
      expect(box, 'App shell was not rendered').not.toBeNull()
      expect(box?.width).toBeLessThanOrEqual(routeMaxWidth)
      // Equal gutters either side.
      expect(Math.abs((box?.x ?? 0) - (1400 - (box?.width ?? 0) - (box?.x ?? 0)))).toBeLessThanOrEqual(1)
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

  test('nav tabs cross-fade between sections instead of cutting', async ({ page }) => {
    await page.goto('/')

    const supportsViewTransitions = await page.evaluate(
      () => typeof document.startViewTransition === 'function',
    )
    // Without the API the router falls back to a plain swap, which has nothing to sample.
    test.skip(!supportsViewTransitions, 'Browser does not implement the View Transition API')

    const durationToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--motion-duration-page').trim(),
    )

    // Sampled from inside the page: the animations only exist mid-swap.
    const animations = await page.evaluate(async () => {
      type SwapEvent = Event & { viewTransition: { ready: Promise<void> } }

      const sampled = new Promise<{ pseudo: string; durationMs: number }[]>((resolve, reject) => {
        document.addEventListener(
          'astro:before-swap',
          (event) => {
            const { viewTransition } = event as SwapEvent
            // before-swap runs inside the update callback, before snapshots exist.
            // ready fires once the ::view-transition tree is up and animations can start.
            void viewTransition.ready.then(() => {
              resolve(
                document.getAnimations().flatMap((animation) => {
                  const effect = animation.effect
                  if (!(effect instanceof KeyframeEffect)) return []

                  const pseudo = effect.pseudoElement
                  if (pseudo === null || !pseudo.includes('view-transition')) return []

                  // Computed timing is milliseconds for a CSS animation.
                  const { duration } = effect.getComputedTiming()

                  return [
                    { pseudo, durationMs: typeof duration === 'number' ? duration : Number.NaN },
                  ]
                }),
              )
            }, reject)
          },
          { once: true },
        )
      })

      document.querySelector<HTMLAnchorElement>('[data-nav-id="teams"]')?.click()

      return await sampled
    })

    await expect(page).toHaveURL(/\/teams\/?$/)

    /*
     * The incoming screen must animate for exactly the shared duration: a custom
     * property that fails to resolve inside the view-transition pseudo tree
     * silently collapses the animation to 0s, which is the hard cut this replaces.
     */
    const durationMs = toMilliseconds(durationToken)
    expect(durationMs).toBeGreaterThan(100)
    expect(
      animations.find((animation) => animation.pseudo === '::view-transition-new(root)')?.durationMs,
    ).toBe(durationMs)
    expect(
      animations.find((animation) => animation.pseudo === '::view-transition-old(root)')?.durationMs,
    ).toBe(durationMs)
  })

  test('All Teams filters stay live after arriving through a nav tab', async ({ page }) => {
    await page.goto('/')

    const teamsTab = page.locator('[data-nav-id="teams"]')
    const status = page.locator('[data-results-status]')
    const visibleCards = page.locator('[data-team-card]:not([hidden])')

    await teamsTab.click()
    await expect(page).toHaveURL(/\/teams\/?$/)
    await expect(status).toHaveText('8 teams shown')

    /*
     * Leaving and returning is the case that breaks: the screen's script is
     * bundled, so it runs once per document and has to re-arm on every swap
     * rather than holding references into a screen the router has discarded.
     */
    await page.locator('[data-nav-id="home"]').click()
    await expect(page).toHaveURL(/\/$/)
    await teamsTab.click()
    await expect(status).toHaveText('8 teams shown')

    await page.getByRole('searchbox', { name: 'Search teams' }).fill('miami')
    await expect(visibleCards).toHaveCount(1)
    await expect(visibleCards.first()).toHaveAttribute('data-team', 'Miami Dolphins')
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
    const allBets = await readAppNavContract('/all-bets')

    expect(allTeams).toEqual(homepage)
    expect(allBets).toEqual(homepage)
  })

  test('mobile navigation uses the Figma glass stroke and tighter icon scale', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/')

    const appearance = await page.locator('[data-app-nav]').evaluate((nav) => {
      const icons = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-id] > span:first-child'))
      const boxes = icons.map((icon) => icon.getBoundingClientRect())

      if (boxes.length !== 5) {
        throw new Error(`Expected five navigation icons, received ${String(boxes.length)}`)
      }

      const home = boxes[0]
      const teams = boxes[1]
      if (home === undefined || teams === undefined) {
        throw new Error('Home and Teams icon geometry is unavailable')
      }

      const strokeStyle = getComputedStyle(nav, '::before')

      return {
        stroke: strokeStyle.backgroundImage,
        strokeWidth: strokeStyle.borderTopWidth,
        strokeWidthToken: getComputedStyle(nav).getPropertyValue('--nav-stroke-width').trim(),
        home: { width: home.width, height: home.height },
        teams: { width: teams.width, height: teams.height },
        homeToTeamsGap: teams.left - home.right,
      }
    })

    expect(appearance.stroke).toContain('conic-gradient')
    /*
     * The export's stroke never leaves the top or bottom run unlit — dropping
     * those plateaus is what made the pill lose its shape — and it dies out
     * completely in the two troughs past the right and left tips.
     */
    expect(appearance.stroke).toContain('rgba(255, 255, 255, 0.52) 74deg')
    expect(appearance.stroke).toContain('rgba(255, 255, 255, 0.37) 249deg')
    expect(appearance.stroke).toContain('rgba(255, 255, 255, 0.8) 80deg')
    expect(appearance.stroke).toContain('rgba(255, 255, 255, 0) 96deg')
    expect(appearance.stroke).toContain('rgba(255, 255, 255, 0) 277deg')
    expect(Number.parseFloat(appearance.strokeWidthToken)).toBe(1)
    expect(Number.parseFloat(appearance.strokeWidth)).toBe(1)
    expect(appearance.home).toEqual({ width: 28, height: 28 })
    expect(appearance.teams).toEqual({ width: 35, height: 28 })
    expect(appearance.homeToTeamsGap).toBeCloseTo(36, 0)
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

    expect(await page.locator('[data-node-id="162:1771"]').boundingBox()).toMatchObject({
      width: 382,
      height: 1,
    })

    const firstImage = page.locator('[data-node-id="I181:1360;162:2225"] img')
    expect(await firstImage.boundingBox()).toMatchObject({ width: 382, height: 295 })

    const cincinnatiImage = page.locator('[data-node-id="474:1383"] img')
    expect(await cincinnatiImage.boundingBox()).toMatchObject({ width: 938, height: 625 })

    const logoBox = firstCard.locator('[data-node-id="181:1340"]')
    const logoBoxGeometry = await logoBox.boundingBox()
    expect(logoBoxGeometry?.width).toBeCloseTo(60, 1)
    expect(logoBoxGeometry?.height).toBeCloseTo(40, 1)

    const teamsIcon = page.locator('[data-nav-id="teams"] > span[style]')
    const teamsIconBox = await teamsIcon.boundingBox()
    expect(teamsIconBox).toMatchObject({ width: 35, height: 28 })
  })

  test('Homepage positions the Cody Brown brand at the status-bar-adjusted Figma coordinates', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/')

    const brand = page.locator('[data-homepage-brand]')
    await expect(brand).toContainText('Cody Brown’s')
    await expect(brand).toContainText('NFL BETTING GUIDE')
    await expect(brand).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect(await brand.boundingBox()).toMatchObject({ x: 0, y: 0, width: 430, height: 83 })

    const byline = brand.locator('[data-node-id="162:1730"]')
    const bylineBox = await byline.boundingBox()
    expect(bylineBox).not.toBeNull()
    expect(bylineBox?.x).toBeCloseTo(165, 0)
    expect(bylineBox?.y).toBeCloseTo(32, 0)
    expect(bylineBox?.width).toBeCloseTo(100, 0)
    expect(bylineBox?.height).toBeCloseTo(11, 0)

    const title = brand.locator('[data-node-id="162:1731"]')
    const titleBox = await title.boundingBox()
    expect(titleBox).not.toBeNull()
    expect(titleBox?.x).toBeCloseTo(71, 0)
    expect(titleBox?.y).toBeCloseTo(51, 0)
    expect(titleBox?.width).toBeCloseTo(289, 0)
    expect(titleBox?.height).toBeCloseTo(32, 0)

    const hero = page.locator('[data-node-id="1:91"]')
    expect(await hero.boundingBox()).toMatchObject({ x: 0, y: 0, width: 430, height: 648 })
  })

  test('Homepage reveals the introduction above the navigation on shorter mobile viewports', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 430, height: 667 })
    await page.goto('/')

    const heroBox = await page.locator('[data-node-id="1:91"]').boundingBox()
    const contentBox = await page.locator('[data-node-id="1:96"]').boundingBox()
    const headingBox = await page.getByRole('heading', { level: 1 }).boundingBox()
    const navBox = await page.getByRole('navigation', { name: 'Primary' }).boundingBox()

    expect(heroBox).not.toBeNull()
    expect(contentBox).not.toBeNull()
    expect(headingBox).not.toBeNull()
    expect(navBox).not.toBeNull()
    expect(heroBox?.height).toBeCloseTo((667 * 648) / 932, 0)
    expect(contentBox?.y).toBeCloseTo((heroBox?.y ?? 0) + (heroBox?.height ?? 0), 0)
    expect(headingBox?.y).toBeLessThan(navBox?.y ?? 0)
  })

  test('Homepage matches the browser-chrome-adjusted desktop Figma geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })

    const root = page.locator('[data-desktop-node-id="311:4398"]')
    expect(await root.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1280 })

    expect(await page.locator('[data-node-id="162:1730"]').boundingBox()).toMatchObject({
      x: 565,
      y: 40,
      width: 150,
    })
    expect(await page.locator('[data-node-id="162:1731"]').boundingBox()).toMatchObject({
      x: 469,
      y: 70,
      width: 342,
    })
    expect(await page.locator('[data-node-id="1:91"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 752,
    })
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })
    expect(await page.getByRole('heading', { level: 1 }).boundingBox()).toMatchObject({
      x: 80,
      y: 808,
      width: 405,
    })
    const introBox = await page.locator('[data-desktop-node-id="366:236"]').boundingBox()
    expect(introBox).not.toBeNull()
    expect(introBox?.x).toBeCloseTo(461, 0)
    expect(introBox?.y).toBeCloseTo(808, 0)
    expect(introBox?.width).toBeCloseTo(739, 0)

    const featuresBox = await page.locator('[data-desktop-node-id="377:170"]').boundingBox()
    expect(featuresBox).not.toBeNull()
    expect(featuresBox?.x).toBeCloseTo(461, 0)
    expect(featuresBox?.y).toBeCloseTo(1010, 0)
    expect(featuresBox?.width).toBeCloseTo(739, 0)
    expect(featuresBox?.height).toBeCloseTo(440, 0)

    const footerBox = await page.locator('[data-node-id="1:114"]').boundingBox()
    expect(footerBox).not.toBeNull()
    expect(footerBox?.x).toBeCloseTo(80, 0)
    expect(footerBox?.y).toBeCloseTo(1628, 0)
    expect(footerBox?.width).toBeCloseTo(1120, 0)
    expect(footerBox?.height).toBeCloseTo(52, 0)

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBe(1280)
  })

  test('Homepage background and hero cover viewports wider than the Figma frame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    expect(await page.locator('[data-desktop-node-id="311:4398"]').boundingBox()).toMatchObject({
      x: 0,
      width: 1440,
    })
    expect(await page.locator('[data-node-id="1:91"]').boundingBox()).toMatchObject({
      x: 0,
      width: 1440,
    })
    const dividerBox = await page.locator('[data-node-id="1:113"]').boundingBox()
    expect(dividerBox).not.toBeNull()
    expect(dividerBox?.x).toBeCloseTo(90, 0)
    expect(dividerBox?.width).toBeCloseTo(1260, 0)
    const wideNav = await page.locator('[data-app-nav]').boundingBox()
    expect(wideNav).not.toBeNull()
    expect(wideNav?.x).toBeCloseTo(326.25, 0)
    expect(wideNav?.width).toBeCloseTo(787.5, 0)

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBe(1440)
  })

  test('All Teams filters cards by conference and team name', async ({ page }) => {
    await page.goto('/teams')

    const visibleCards = page.locator('[data-team-card]:not([hidden])')
    const afc = page.getByRole('button', { name: 'AFC' })
    const nfc = page.getByRole('button', { name: 'NFC' })
    const search = page.getByRole('searchbox', { name: 'Search teams' })

    await expect(visibleCards).toHaveCount(8)
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveCount(0)

    await nfc.click()
    await expect(nfc).toHaveAttribute('aria-pressed', 'true')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(0)
    await expect(page.getByText('No teams match your filters.')).toBeVisible()

    await nfc.click()
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(8)

    await search.fill('miami')
    await expect(visibleCards).toHaveCount(1)
    await expect(visibleCards.first()).toHaveAttribute('data-team', 'Miami Dolphins')

    // Enter must not submit the search form and reload away the active filters.
    await search.press('Enter')
    await expect(search).toHaveValue('miami')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(1)

    await page.getByRole('button', { name: 'Clear All' }).click()
    await expect(search).toHaveValue('')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(8)

    await page.getByRole('button', { name: 'Filter teams by name' }).click()
    await expect(search).toBeFocused()
  })

  test('All Teams keeps mobile cards proportional and reveals the second card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/teams')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })

    const cards = page.locator('[data-team-card]')
    const firstCardBox = await cards.first().boundingBox()
    const secondCardBox = await cards.nth(1).boundingBox()
    const navBox = await page.getByRole('navigation', { name: 'Primary' }).boundingBox()

    expect(firstCardBox).not.toBeNull()
    expect(firstCardBox?.width).toBeCloseTo(342, 0)
    expect(firstCardBox?.height).toBeCloseTo((342 * 295) / 382, 0)
    expect(secondCardBox).not.toBeNull()
    expect(navBox).not.toBeNull()
    expect((navBox?.y ?? 0) - (secondCardBox?.y ?? 0)).toBeGreaterThan(140)
  })

  /*
   * Two tabs have no screen yet. They must be visible, because the design
   * draws all five, but must not behave like destinations — no href, and not
   * in the tab order.
   */
  test('nav tabs without a page are inert', async ({ page }) => {
    await page.goto('/')

    for (const id of ['fanduel']) {
      const tab = page.locator(`[data-nav-id="${id}"]`)
      await expect(tab).toBeVisible()
      await expect(tab).toHaveAttribute('aria-disabled', 'true')
      expect(await tab.evaluate((el) => el.tagName)).toBe('SPAN')
    }

    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(4)
  })

  test('Individual Team preserves its status-bar-adjusted Figma geometry and assets', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/teams/buffalo-bills')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    await expect(page.locator('[data-node-id="162:1586"]')).toHaveCSS('min-height', '5469px')
    expect(await page.locator('[data-node-id="181:1321"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 430,
      height: 175,
    })
    expect(await page.locator('[data-node-id="162:2215"]').boundingBox()).toMatchObject({
      x: 0,
      y: 175,
      width: 430,
      height: 319,
    })
    expect(await page.locator('[data-node-id="162:2236"]').boundingBox()).toMatchObject({
      y: 494,
      height: 825,
    })
    expect(await page.locator('[data-node-id="162:1668"]').boundingBox()).toMatchObject({
      y: 1319,
      height: 932,
    })
    expect(await page.locator('[data-node-id="162:1674"]').boundingBox()).toMatchObject({
      y: 2251,
      height: 638,
    })
    expect(await page.locator('[data-node-id="188:2513"]').boundingBox()).toMatchObject({
      y: 2889,
      height: 541,
    })
    const oddsBox = await page.locator('[data-node-id="162:2237"]').boundingBox()
    expect(oddsBox?.y).toBeCloseTo(3430, 0)
    expect(oddsBox?.height).toBeCloseTo(712.546, 1)
    const scheduleBox = await page.locator('[data-node-id="738:4484"]').boundingBox()
    expect(scheduleBox).toMatchObject({ x: 0, width: 430, height: 717 })
    expect(scheduleBox?.y).toBeCloseTo(4142.546, 1)
    const scheduleGridBox = await page.locator('[data-node-id="730:3141"]').boundingBox()
    expect(scheduleGridBox).toMatchObject({ x: 24, width: 382, height: 605 })
    expect(scheduleGridBox?.y).toBeCloseTo(4254.546, 1)
    const exploreBox = await page.locator('[data-node-id="181:1446"]').boundingBox()
    expect(exploreBox?.y).toBeCloseTo(4859.546, 1)
    expect(exploreBox?.height).toBeCloseTo(474, 0)

    const heroImage = page.locator('[data-node-id="162:2215"] picture img')
    expect(await heroImage.boundingBox()).toMatchObject({
      width: 430,
      height: 319,
    })
    await expect(heroImage).toHaveCSS('object-fit', 'cover')
    await expect(heroImage).toHaveCSS('object-position', '50% 100%')
    const predictionImage = await page.locator('[data-node-id="162:1674"] img').boundingBox()
    expect(predictionImage?.width).toBeCloseTo(430, 0)
    expect(predictionImage?.height).toBeCloseTo(282.72, 1)
    expect(await page.locator('[data-node-id="188:2513"] picture img').boundingBox()).toMatchObject({
      width: 430,
      height: 541,
    })

    expect(await page.locator('[data-node-id="162:1676"]').boundingBox()).toMatchObject({
      x: 131,
      y: 2307,
      width: 168,
      height: 43,
    })
    expect(await page.locator('[data-node-id="162:1678"]').boundingBox()).toMatchObject({
      x: 16,
      y: 2374,
      width: 398,
      height: 115,
    })
    const predictionScoreLine = page.locator('[data-node-id="162:1678"] > p')
    await expect(predictionScoreLine).toHaveCSS('line-height', '44px')
    await expect(predictionScoreLine).toHaveCSS('text-box-trim', 'trim-both')
    await expect(predictionScoreLine).toHaveCSS('white-space', 'nowrap')
    expect(await page.locator('[data-node-id="162:2212"]').boundingBox()).toMatchObject({
      x: 16,
      y: 2513,
      width: 398,
      height: 126,
    })

    const expandedAccordionCopy = page.locator('[data-node-id="162:1669"] > p')
    const accordionCopyBox = await expandedAccordionCopy.boundingBox()
    expect(accordionCopyBox?.height).toBeCloseTo(310, 0)
    await expect(expandedAccordionCopy).toHaveCSS('text-box-trim', 'trim-both')
    await expect(expandedAccordionCopy).toHaveCSS('text-box-edge', 'cap alphabetic')
    await expect(expandedAccordionCopy).toHaveCSS('white-space', 'pre-wrap')
    await expect(expandedAccordionCopy).toHaveCSS('overflow', 'visible')
    await expect(expandedAccordionCopy).toContainText("they’ve kept their core.")
    const expandedAccordionBox = await page.locator('[data-node-id="162:1669"]').boundingBox()
    const accordionBottomGap =
      (expandedAccordionBox?.y ?? 0) +
      (expandedAccordionBox?.height ?? 0) -
      ((accordionCopyBox?.y ?? 0) + (accordionCopyBox?.height ?? 0))
    expect(accordionBottomGap).toBeCloseTo(36, 0)

    await expect(page.locator('[data-node-id="162:1605"] article')).toHaveCount(6)
    await expect(page.locator('[data-nav-id="teams"]')).toHaveAttribute('aria-current', 'page')

    const quarterbacks = page.getByText('QUATERBACKS', { exact: true })
    await quarterbacks.click()
    await expect(page.locator('[data-node-id="162:1670"]')).toHaveAttribute('open', '')
  })

  test('Individual Team keeps the prediction score on one line above its copy at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 932 })
    await page.goto('/teams/buffalo-bills')
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    const score = page.locator('[data-node-id="162:1678"]')
    const scoreLine = score.locator('> p')
    const copy = page.locator('[data-node-id="162:2212"]')
    const [scoreBox, copyBox, scoreLineCount] = await Promise.all([
      score.boundingBox(),
      copy.boundingBox(),
      scoreLine.evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return range.getClientRects().length
      }),
    ])

    expect(scoreLineCount).toBe(1)
    expect((scoreBox?.y ?? 0) + (scoreBox?.height ?? 0)).toBeLessThanOrEqual((copyBox?.y ?? 0) - 24)
  })

  test('Individual Team keeps Schedule metadata clear of its tags on narrow phones', async ({ page }) => {
    for (const { width, gridWidth } of [
      { width: 320, gridWidth: 272 },
      { width: 360, gridWidth: 312 },
      { width: 403, gridWidth: 355 },
    ]) {
      await page.setViewportSize({ width, height: 932 })
      await page.goto('/teams/buffalo-bills')
      await page.evaluate(async () => {
        await document.fonts.ready
      })

      const schedule = page.locator('[data-node-id="738:4484"]')
      const grid = page.locator('[data-node-id="730:3141"]')
      const cards = grid.locator('article')

      expect(await schedule.boundingBox()).toMatchObject({ width, height: 888 })
      expect(await grid.boundingBox()).toMatchObject({ x: 24, width: gridWidth, height: 776 })
      await expect(cards).toHaveCount(18)

      const tagClearances = await cards.evaluateAll((scheduleCards) =>
        scheduleCards.flatMap((card) => {
          const metadata = card.querySelector<HTMLElement>('[data-schedule-meta]')
          const tag = card.querySelector<HTMLElement>('[data-schedule-tag]')

          if (tag === null) {
            return []
          }

          if (metadata === null) {
            throw new Error('Expected a tagged Schedule card to contain metadata.')
          }

          return [tag.getBoundingClientRect().top - metadata.getBoundingClientRect().bottom]
        }),
      )

      expect(tagClearances).toHaveLength(17)
      expect(tagClearances.every((clearance) => clearance >= 3)).toBe(true)
    }
  })

  test('Individual Team matches the browser-chrome-adjusted desktop Figma geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/teams/buffalo-bills')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })

    expect(await page.locator('[data-desktop-node-id="390:1337"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 4761,
    })

    for (const section of [
      { id: '390:1741', y: 0, height: 147 },
      { id: '390:1744', y: 147, height: 487 },
      { id: '397:1940', y: 634, height: 622 },
      { id: '397:2129', y: 1256, height: 844 },
      { id: '397:2201', y: 2100, height: 531 },
      { id: '397:2207', y: 2615, height: 637 },
      { id: '397:2265', y: 3252, height: 358 },
      { id: '791:2688', y: 3610, height: 677 },
      { id: '397:2318', y: 4287, height: 474 },
    ]) {
      expect(
        await page.locator(`[data-desktop-node-id="${section.id}"]`).boundingBox(),
      ).toMatchObject({ x: 0, y: section.y, width: 1280, height: section.height })
    }

    expect(await page.locator('[data-node-id="181:1323"]').boundingBox()).toMatchObject({
      x: 565,
      y: 40,
      width: 150,
    })
    const desktopBrandTitle = await page.locator('[data-node-id="181:1324"]').boundingBox()
    expect(desktopBrandTitle).not.toBeNull()
    expect(desktopBrandTitle?.x).toBeCloseTo(469, 0)
    expect(desktopBrandTitle?.y).toBeCloseTo(69, 0)
    expect(desktopBrandTitle?.width).toBeCloseTo(342, 0)
    expect(await page.locator('[data-node-id="162:1594"]').boundingBox()).toMatchObject({
      x: 461,
      y: 690,
      width: 739,
      height: 326,
    })
    expect(await page.locator('[data-node-id="162:1605"]').boundingBox()).toMatchObject({
      x: 80,
      y: 3386,
      width: 1120,
      height: 168,
    })
    await expect(page.locator('[data-node-id="181:1431"] article')).toHaveCount(5)

    const heroImage = page.locator('[data-desktop-node-id="390:1744"] picture img')
    const futureImage = page.locator('[data-desktop-node-id="397:2207"] picture img')
    expect(await heroImage.getAttribute('src')).toContain('team-buffalo-hero')
    expect(await heroImage.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(
      'team-buffalo-hero-desktop',
    )
    expect(await futureImage.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(
      'team-buffalo-future-desktop',
    )
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })
  })

  test('Awards preserves the mobile Figma geometry and filters cards', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/awards')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    await expect(page.locator('[data-node-id="188:2037"]')).toHaveCSS('min-height', '1453px')
    expect(await page.locator('[data-node-id="188:2038"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 430,
      height: 139,
    })

    const cards = page.locator('[data-award-card]')
    await expect(cards).toHaveCount(4)
    expect(await cards.first().boundingBox()).toMatchObject({ x: 24, y: 139, width: 382, height: 300 })
    expect(await cards.nth(1).boundingBox()).toMatchObject({ x: 24, y: 461, width: 382, height: 300 })
    const firstCardImage = cards.first().locator(':scope > img')
    expect(await firstCardImage.boundingBox()).toMatchObject({
      width: 382,
      height: 300,
    })
    await expect(firstCardImage).toHaveCSS('object-fit', 'cover')
    await expect(firstCardImage).toHaveCSS('object-position', '50% 100%')

    await expect(page.locator('[data-nav-id="awards"]')).toHaveAttribute('aria-current', 'page')
    await page.getByRole('searchbox', { name: 'Search awards' }).fill('not an award')
    await expect(page.locator('[data-award-card]:not([hidden])')).toHaveCount(0)
    await expect(page.getByText('No awards match your search.')).toBeVisible()
  })

  test('Most Valuable Player Picks preserves its mobile carousel geometry', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/awards/mvp')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    expect(await page.locator('[data-node-id="188:2187"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 430,
      height: 139,
    })
    expect(await page.getByRole('heading', { level: 1 }).boundingBox()).toMatchObject({
      x: 24,
      y: 139,
      width: 315,
    })
    const cards = page.locator('[data-mvp-card]')
    await expect(cards).toHaveCount(3)
    const firstMvpCard = await cards.first().boundingBox()
    expect(firstMvpCard).not.toBeNull()
    expect(firstMvpCard?.x).toBeCloseTo(24, 0)
    expect(firstMvpCard?.y).toBeCloseTo(220, 0)
    expect(firstMvpCard?.width).toBeCloseTo(316, 0)
    expect(firstMvpCard?.height).toBeCloseTo(505, 0)
    const secondMvpCard = await cards.nth(1).boundingBox()
    expect(secondMvpCard).not.toBeNull()
    expect(secondMvpCard?.x).toBeCloseTo(356, 0)
    expect(secondMvpCard?.y).toBeCloseTo(220, 0)
    expect(secondMvpCard?.width).toBeCloseTo(316, 0)
    await expect(page.locator('[data-nav-id="awards"]')).toHaveAttribute('aria-current', 'page')
  })

  test('All Teams matches the browser-chrome-adjusted desktop Figma geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/teams')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })

    expect(await page.locator('[data-desktop-node-id="377:185"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
    })
    expect(await page.locator('[data-node-id="162:1773"]').boundingBox()).toMatchObject({
      x: 469,
      y: 40,
      width: 342,
    })
    expect(await page.locator('[data-node-id="162:1774"]').boundingBox()).toMatchObject({
      x: 565,
      y: 40,
      width: 150,
    })
    const brandTitleBox = await page.locator('[data-node-id="162:1775"]').boundingBox()
    expect(brandTitleBox).not.toBeNull()
    expect(brandTitleBox?.x).toBeCloseTo(469, 0)
    expect(brandTitleBox?.y).toBeCloseTo(69, 0)
    expect(brandTitleBox?.width).toBeCloseTo(342, 0)
    const headingBox = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(headingBox?.x).toBeCloseTo(80, 0)
    expect(headingBox?.y).toBeCloseTo(171, 0)
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })

    const cards = page.locator('[data-team-card]')
    await expect(cards).toHaveCount(8)
    const firstCardBox = await cards.first().boundingBox()
    expect(firstCardBox?.x).toBeCloseTo(80, 0)
    expect(firstCardBox?.y).toBeCloseTo(273, 0)
    expect(firstCardBox?.width).toBeCloseTo(357.33, 0)
    expect(firstCardBox?.height).toBeCloseTo(295, 0)

    const secondCardBox = await cards.nth(1).boundingBox()
    expect(secondCardBox?.x).toBeCloseTo(461.33, 0)
    expect(secondCardBox?.y).toBeCloseTo(273, 0)
    expect(secondCardBox?.width).toBeCloseTo(357.33, 0)

    const thirdCardBox = await cards.nth(2).boundingBox()
    expect(thirdCardBox?.x).toBeCloseTo(842.67, 0)
    expect(thirdCardBox?.y).toBeCloseTo(273, 0)
    expect(thirdCardBox?.width).toBeCloseTo(357.33, 0)
  })

  test('desktop navigation tracks the viewport and current page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })

    for (const route of [
      { path: '/', current: 'home' },
      { path: '/teams', current: 'teams' },
    ]) {
      await page.goto(route.path)

      const nav = page.locator('[data-app-nav]')
      const atTop = await nav.boundingBox()
      expect(atTop).toMatchObject({ x: 290, y: 612, width: 700, height: 64 })
      await expect(page.locator(`[data-nav-id="${route.current}"]`)).toHaveAttribute(
        'aria-current',
        'page',
      )
      await expect(page.locator('[aria-current="page"]')).toHaveCount(1)

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      expect(await nav.boundingBox()).toEqual(atTop)
    }
  })

  test('desktop screens scale the 1280px Figma composition uniformly on wide viewports', async ({
    page,
  }) => {
    const viewport = { width: 1906, height: 912 }
    const scale = viewport.width / 1280
    await page.setViewportSize(viewport)

    for (const path of ['/', '/teams', '/teams/buffalo-bills', '/awards', '/awards/mvp', '/all-bets', '/fanduel']) {
      await page.goto(path)

      const shell = await page.locator('.appShell').boundingBox()
      expect(shell).not.toBeNull()
      expect(shell?.x).toBeCloseTo(0, 0)
      expect(shell?.width).toBeCloseTo(viewport.width, 0)

      const nav = await page.locator('[data-app-nav]').boundingBox()
      expect(nav).not.toBeNull()
      expect(nav?.x).toBeCloseTo(290 * scale, 0)
      expect(nav?.y).toBeCloseTo(viewport.height - (106 + 64) * scale, 0)
      expect(nav?.width).toBeCloseTo(700 * scale, 0)
      expect(nav?.height).toBeCloseTo(64 * scale, 0)
    }
  })

  test('All Bets preserves its source geometry and filters categories', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/all-bets')
    await page.evaluate(() => document.fonts.ready)

    await expect(page.locator('[data-node-id="251:2889"]')).toHaveCSS('min-height', '4861px')
    expect(await page.locator('[data-node-id="251:2892"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 430,
      height: 139,
    })
    expect(await page.locator('[data-node-id="251:3065"]').boundingBox()).toMatchObject({
      x: 24,
      y: 139,
      width: 382,
      height: 156,
    })
    expect(await page.locator('[data-node-id="251:3311"]').boundingBox()).toMatchObject({
      x: 24,
      y: 319,
      width: 382,
    })

    const cards = page.locator('[data-bet-card]')
    await expect(cards).toHaveCount(37)
    expect(await cards.first().boundingBox()).toMatchObject({ width: 382, height: 70 })

    await page.getByRole('button', { name: 'Exclusive' }).click()
    await expect(page.locator('[data-bet-section]:not([hidden])')).toHaveCount(1)
    await expect(page.locator('[data-bet-card]:not([hidden])')).toHaveCount(2)

    await page.getByRole('searchbox', { name: 'Search bets' }).fill('not a player')
    await expect(page.getByText('No bets match your filters.')).toBeVisible()
  })

  test('desktop Awards matches the current 1280px Figma composition', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/awards')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    expect(await page.locator('[data-awards-page]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 971,
    })
    expect(await page.locator('[data-node-id="188:2038"]').boundingBox()).toMatchObject({
      width: 1280,
      height: 147,
    })
    const awardCards = page.locator('[data-award-card]')
    await expect(awardCards).toHaveCount(4)
    expect(await awardCards.nth(0).boundingBox()).toMatchObject({ x: 79, y: 187, width: 358, height: 300 })
    expect(await awardCards.nth(1).boundingBox()).toMatchObject({ x: 461, y: 187, width: 358, height: 300 })
    expect(await awardCards.nth(3).boundingBox()).toMatchObject({ x: 79, y: 511, width: 358, height: 300 })
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })
  })

  test('desktop Most Valuable Player Picks matches the current 1280px Figma composition', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/awards/mvp')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    expect(await page.locator('[data-mvp-picks-page]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 971,
    })
    expect(await page.locator('[data-node-id="188:2187"]').boundingBox()).toMatchObject({
      width: 1280,
      height: 147,
    })
    const mvpHeadingBox = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(mvpHeadingBox).toMatchObject({
      x: 80,
      y: 171,
      width: 438,
    })
    expect(mvpHeadingBox?.height).toBeCloseTo(38, 0)
    const mvpCards = page.locator('[data-mvp-card]')
    await expect(mvpCards).toHaveCount(3)
    expect(await mvpCards.nth(0).boundingBox()).toMatchObject({ x: 80, y: 249, width: 357, height: 576 })
    expect(await mvpCards.nth(1).boundingBox()).toMatchObject({ x: 461, y: 249, width: 358, height: 576 })
    expect(await mvpCards.nth(2).boundingBox()).toMatchObject({ x: 843, y: 249, width: 357, height: 576 })
  })

  test('desktop All Bets matches the current 1280px Figma composition', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/all-bets')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    expect(await page.locator('[data-all-bets-page]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 2094,
    })
    expect(await page.locator('[data-node-id="251:2892"]').boundingBox()).toMatchObject({
      width: 1280,
      height: 147,
    })
    expect(await page.locator('[data-filter-value="all"]').boundingBox()).toMatchObject({
      x: 80,
      y: 171,
      width: 78,
      height: 33,
    })
    const firstBet = page.locator('[data-bet-section="mvp"] [data-bet-card]').first()
    expect(await firstBet.boundingBox()).toMatchObject({
      x: 80,
      y: 358,
      width: 357,
      height: 75,
    })
    const firstBetButton = firstBet.getByRole('button', {
      name: 'Place bet on Lamar Jackson at +430',
      exact: true,
    })
    await expect(firstBetButton).toBeVisible()
    expect(await firstBetButton.boundingBox()).toMatchObject({
      x: 280,
      y: 377.5,
      width: 141,
      height: 36,
    })
    const desktopFutureCards = page.locator('[data-desktop-bet-card]')
    await expect(desktopFutureCards).toHaveCount(21)
    expect(await desktopFutureCards.first().boundingBox()).toMatchObject({
      x: 80,
      y: 1338,
      width: 357,
      height: 75,
    })
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })
  })

  test('desktop FanDuel renders both MCP-designed offer controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/fanduel')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    expect(await page.locator('[data-fanduel-page]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 1097,
    })
    expect(await page.locator('[data-node-id="803:5181"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 147,
    })

    const offers = page.locator('[data-fanduel-offer]')
    await expect(offers).toHaveCount(2)
    expect(await offers.nth(0).boundingBox()).toMatchObject({ x: 80, y: 187, width: 1120, height: 380 })
    expect(await offers.nth(1).boundingBox()).toMatchObject({ x: 80, y: 591, width: 1120, height: 322 })

    const rewardsCta = page.getByRole('button', { name: 'Redeem Rewards Club offer', exact: true })
    const offerCta = page.getByRole('button', { name: 'Redeem offer', exact: true })
    await expect(rewardsCta).toBeVisible()
    await expect(offerCta).toBeVisible()
    expect(await rewardsCta.boundingBox()).toMatchObject({ x: 588, y: 499, width: 175, height: 36 })
    expect(await offerCta.boundingBox()).toMatchObject({ x: 588, y: 832, width: 175, height: 36 })
    expect(await page.locator('[data-node-id="803:5562"]').boundingBox()).toMatchObject({
      x: 1132,
      y: 327,
      width: 19,
      height: 32,
    })
    expect(await page.locator('[data-node-id="788:2251"]').boundingBox()).toMatchObject({
      x: 1125,
      y: 415,
      width: 26,
      height: 32,
    })
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 612,
      width: 700,
      height: 64,
    })
    await expect(page.locator('[data-nav-id="fanduel"]')).toHaveAttribute('aria-current', 'page')
  })

  test('responsive suite has screens to exercise', () => {
    expect(
      SCREENS.length,
      'No screens are implemented, so nothing below this ran. src/routes/screens.ts is empty.',
    ).toBeGreaterThan(0)
  })
})
