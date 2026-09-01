import { expect, test, type Page } from '@playwright/test'
import { SCREENS } from '../../src/routes/screens'
import { APP_NAV_ITEMS } from '../../src/components/AppNav/navItems'
import { BET_SECTIONS } from '../../src/screens/AllBets/content'

/*
 * All Bets renders one card per published CMS bet, so the counts drift with
 * every CMS publish. Deriving them from the content module keeps these specs
 * asserting the render, not last month's payload.
 */
const BET_CARD_COUNT = BET_SECTIONS.reduce((count, section) => count + section.bets.length, 0)
const betCardCount = (id: string): number =>
  BET_SECTIONS.find((section) => section.id === id)?.bets.length ?? 0

/*
 * Scrolls a screen to its end and reports how far it moved.
 *
 * On touch pointers the screens no longer scroll the document: they fill the
 * viewport and scroll inside a box that starts below the header, so that no
 * content can enter the strip iOS 26 Safari fills with a blurred sample of the
 * scrolling layer (see app.css and ios-chrome-strip.spec.ts). Everything these
 * tests assert about scrolling is unchanged -- only which box moves is.
 */
async function scrollScreenToEnd(page: Page): Promise<number> {
  return page.evaluate(() => {
    const area = document.querySelector('.appScrollArea')
    if (area !== null) {
      area.scrollTop = area.scrollHeight
      return area.scrollTop
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
    return window.scrollY
  })
}



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

    /*
     * Every route in the manifest now has a dedicated 1280px desktop frame, so
     * above the 768px breakpoint app.css drops the centred mobile shell and
     * scales the 1280 canvas to the viewport (`zoom: 100vw / 1280`). The shell
     * is therefore expected to span the full width with no gutters — the older
     * "centres within 480px" contract described routes that no longer exist.
     */
    test(`${route.frameName} scales its desktop frame to fill 1400px`, async ({ page }) => {
      await page.setViewportSize({ width: 1400, height: route.height })
      await page.goto(route.path)

      const shell = page.locator('.appShell')
      const box = await shell.boundingBox()
      expect(box, 'App shell was not rendered').not.toBeNull()
      expect(box?.x).toBeCloseTo(0, 0)
      expect(box?.width).toBeCloseTo(1400, 0)

      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(documentWidth, 'Desktop shell overflows the viewport').toBeLessThanOrEqual(1401)
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
    await expect(status).toHaveText('32 teams shown')

    /*
     * Leaving and returning is the case that breaks: the screen's script is
     * bundled, so it runs once per document and has to re-arm on every swap
     * rather than holding references into a screen the router has discarded.
     */
    await page.locator('[data-nav-id="home"]').click()
    await expect(page).toHaveURL(/\/$/)
    await teamsTab.click()
    await expect(status).toHaveText('32 teams shown')

    // "team 5" is not a substring of any other team's name, so it isolates one card.
    await page.getByRole('searchbox', { name: 'Search teams' }).fill('team 5')
    await expect(visibleCards).toHaveCount(1)
    await expect(visibleCards.first()).toHaveAttribute('data-team', 'TEAM 5')
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

    /*
     * The page is not padded out to any frame height, so this is what the grid
     * actually measures with the full 32-team roster. The Figma frame stops at
     * 2878 because the design only draws the first eight cards; each of the 24
     * after them adds the same card box and gap.
     */
    const teamsPage = await page.locator('[data-node-id="162:1760"]').boundingBox()
    expect(teamsPage?.height).toBeCloseTo(10366, 0)
    expect(await page.locator('[data-node-id="162:1773"]').boundingBox()).toMatchObject({ y: 24 })

    const cards = page.locator('[data-node-id="181:325"] article')
    await expect(cards).toHaveCount(32)

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

  test('Homepage draws the Cody Brown lockup over the hero on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 878 })
    await page.goto('/')

    // 162:1730 / 162:1731 sit at y 86 and 105 in frame 162:1721, which is 32
    // and 51 once the 54px status bar the app does not draw is taken off.
    await expect(page.locator('[data-homepage-brand]')).toBeVisible()
    const byline = await page.locator('[data-node-id="162:1730"]').boundingBox()
    expect(byline?.y).toBeCloseTo(32, 0)
    expect(byline?.width).toBeCloseTo(100, 0)
    expect(byline?.x).toBeCloseTo(165, 0)
    const title = await page.locator('[data-node-id="162:1731"]').boundingBox()
    expect(title?.y).toBeCloseTo(51, 0)
    expect(title?.width).toBeCloseTo(289, 0)
    expect(title?.x).toBeCloseTo(71, 0)

    const hero = page.locator('[data-node-id="1:91"]')
    expect(await hero.boundingBox()).toMatchObject({ x: 0, y: 0, width: 430, height: 594 })
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
    // Frame 162:1721: a 594px hero in the 878px the app renders of its viewport.
    expect(heroBox?.height).toBeCloseTo((667 * 594) / 878, 0)
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
    /*
     * Rectangle 430 (366:238) used to fade the hero into the navy content. The
     * 27 Aug review moved that gradient behind the nav, so the hero now ends on
     * the flat #0078FF its own overlay reaches and nothing is drawn over it.
     */
    await expect(page.locator('[data-node-id="366:238"]')).toHaveCount(0)

    const heroImage = page.locator('[data-node-id="1:91"] picture img')
    expect(await heroImage.getAttribute('src')).toContain('hero-poster')
    expect(await heroImage.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(
      'hero-poster-desktop',
    )
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 678,
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

  /*
   * 27 Aug feedback, desktop: "'Clear all' button will appear only when a
   * filter is selected". The gating lives in the shared All Teams controller,
   * so the mobile fix carried here, but nothing pinned it at desktop width --
   * and the desktop chip row is the one the review actually captured. The page
   * search field is laid out but zero-width up here (the review's own closing
   * note is that desktop search does not work yet), so the conference chips are
   * the only thing that can raise the control.
   */
  test('All Teams gates Clear All behind a selected conference on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/teams')
    await page.evaluate(() => document.fonts.ready)

    const clearAll = page.getByRole('button', { name: 'Clear All' })
    const afc = page.getByRole('button', { name: 'AFC', exact: true })

    await expect(clearAll).toBeHidden()

    await afc.click()
    await expect(afc).toHaveAttribute('aria-pressed', 'true')
    await expect(clearAll).toBeVisible()
    // The frame ends it on the 1120 content grid, with the chips.
    const clearAllBox = await clearAll.boundingBox()
    expect((clearAllBox?.x ?? 0) + (clearAllBox?.width ?? 0)).toBeCloseTo(1200, 0)

    await clearAll.click()
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(clearAll).toBeHidden()
    await expect(page.locator('[data-team-card]:not([hidden])')).toHaveCount(32)
  })

  /*
   * 27 Aug feedback, desktop: "make the links section end before the nav,
   * avoid the overlap". The frame's own 91px tail is shorter than the nav's
   * clearance, so at the end of the scroll the pill landed inside the footer
   * row, between the signature and the social links.
   */
  test('Homepage ends its footer clear of the docked nav on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        Array.from(document.images).map((image) => image.decode().catch(() => undefined)),
      )
    })
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })

    const tail = await page.evaluate(() => {
      const footer = document.querySelector('[data-node-id="1:114"]')
      const nav = document.querySelector('[data-app-nav]')
      if (footer === null || nav === null) throw new Error('Homepage is missing its footer or nav')

      const footerBox = footer.getBoundingClientRect()

      return {
        gapToNav: nav.getBoundingClientRect().top - footerBox.bottom,
        fromPageEnd: window.innerHeight - footerBox.bottom,
      }
    })

    // --desktop-nav-clearance (104) plus the --space-32 the reference shows.
    expect(tail.fromPageEnd).toBeCloseTo(136, 0)
    expect(tail.gapToNav).toBeGreaterThan(24)
  })

  /*
   * 27 Aug feedback, desktop: "remove the dark blue gradient from the Hero image
   * and place it behind the nav similar to the mobile version", and put the nav
   * "closer to the bottom end ... same as mobile". Desktop used to shrink the
   * dock down to the nav pill and drop the scrim, leaving the pill floating over
   * fully lit copy two thirds of a nav height off the floor.
   */
  test('desktop navigation docks against the viewport floor behind the mobile scrim', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 782 })

    for (const path of ['/', '/teams', '/all-bets']) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)

      const chrome = await page.locator('[data-app-nav-dock]').evaluate((dock) => {
        const nav = dock.querySelector<HTMLElement>('[data-app-nav]')
        if (nav === null) throw new Error('AppNav rendered without its navigation bar')

        const dockBox = dock.getBoundingClientRect()
        const navBox = nav.getBoundingClientRect()

        return {
          dock: { x: dockBox.x, width: dockBox.width, bottom: dockBox.bottom, height: dockBox.height },
          navBottomOffset: window.innerHeight - navBox.bottom,
          navX: navBox.x,
          navWidth: navBox.width,
          scrim: getComputedStyle(dock).backgroundImage,
        }
      })

      // The scrim spans the viewport and ends on its floor, as it does on mobile.
      expect(chrome.dock).toMatchObject({ x: 0, width: 1280, bottom: 782, height: 160 })
      expect(chrome.scrim).toContain('linear-gradient')
      expect(chrome.scrim).toContain('rgba(1, 21, 86, 0)')
      // The mobile --nav-bottom-offset, which is what the review asked for.
      expect(chrome.navBottomOffset).toBeCloseTo(40, 0)
      expect(chrome.navX).toBeCloseTo(290, 0)
      expect(chrome.navWidth).toBeCloseTo(700, 0)
    }
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
    const all = page.getByRole('button', { name: 'All', exact: true })
    const search = page.getByRole('searchbox', { name: 'Search teams' })
    const clearAll = page.getByRole('button', { name: 'Clear All' })

    await expect(visibleCards).toHaveCount(32)
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    // "All" is the default state, so it is pressed on arrival (28 Aug feedback).
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    // Nothing is filtered, so the control that clears filters has nothing to do.
    await expect(clearAll).toHaveCount(0)

    await nfc.click()
    await expect(nfc).toHaveAttribute('aria-pressed', 'true')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(all).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(16)
    // Content-agnostic: card names come from the CMS, so assert the conference
    // attribute rather than a specific roster name.
    await expect(visibleCards.first()).toHaveAttribute('data-conference', 'NFC')
    await expect(clearAll).toBeVisible()

    // 28 Aug feedback: conferences combine. Adding AFC keeps NFC pressed and
    // unions the two rosters instead of replacing the selection.
    await afc.click()
    await expect(afc).toHaveAttribute('aria-pressed', 'true')
    await expect(nfc).toHaveAttribute('aria-pressed', 'true')
    await expect(all).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(32)
    await expect(clearAll).toBeVisible()

    await afc.click()
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleCards).toHaveCount(16)

    await nfc.click()
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleCards).toHaveCount(32)
    await expect(clearAll).toHaveCount(0)

    // "All" is the one filter that does not combine: it clears the conferences.
    await afc.click()
    await expect(visibleCards).toHaveCount(16)
    await all.click()
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleCards).toHaveCount(32)

    // Pick a real card's name so the query survives CMS roster changes; the
    // full name is unique, so it isolates that one card.
    const targetTeam = await visibleCards.first().getAttribute('data-team')
    const targetConference = await visibleCards.first().getAttribute('data-conference')
    expect(targetTeam).toBeTruthy()
    await search.fill(targetTeam ?? '')
    await expect(visibleCards).toHaveCount(1)
    await expect(visibleCards.first()).toHaveAttribute('data-team', targetTeam ?? '')
    // A query is a filter too -- Clear All resets it, so it has to be reachable.
    await expect(clearAll).toBeVisible()

    // A conference the matching team is not in leaves the grid empty.
    const otherConference = targetConference === 'AFC' ? nfc : afc
    await otherConference.click()
    await expect(visibleCards).toHaveCount(0)
    await expect(page.getByText('No teams match your filters.')).toBeVisible()
    await otherConference.click()

    // Enter must not submit the search form and reload away the active filters.
    await search.press('Enter')
    await expect(search).toHaveValue(targetTeam ?? '')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleCards).toHaveCount(1)

    await clearAll.click()
    await expect(search).toHaveValue('')
    await expect(afc).toHaveAttribute('aria-pressed', 'false')
    await expect(nfc).toHaveAttribute('aria-pressed', 'false')
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleCards).toHaveCount(32)
    await expect(clearAll).toHaveCount(0)
  })

  /*
   * Every screen that offers a search field freezes it (27 Aug feedback), so
   * this is asserted per route rather than on All Teams alone. The band is the
   * sticky header the field rides in; it has to reach the viewport edge, or
   * content would scroll into the gap above the field instead of behind it.
   */
  const FROZEN_SEARCH = [
    { path: '/teams', band: '181:1243', field: '162:1776' },
    { path: '/all-bets', band: '251:2892', field: '251:2896' },
    { path: '/awards', band: '188:2038', field: '188:2042' },
    { path: '/teams/buffalo-bills', band: '181:1321', field: '181:1325' },
  ] as const

  for (const route of FROZEN_SEARCH) {
    test(`${route.path} keeps the search field frozen while the page scrolls`, async ({ page }) => {
      await page.setViewportSize({ width: 430, height: 932 })
      await page.goto(route.path)

      const searchField = page.locator(`[data-node-id="${route.field}"]`)
      const band = page.locator(`[data-node-id="${route.band}"]`)
      const atTop = await searchField.boundingBox()
      expect(atTop, 'Search field was not rendered').not.toBeNull()

      const scrolled = await scrollScreenToEnd(page)
      // A page that cannot scroll would pass the assertions below for free.
      expect(scrolled, 'Route is not scrollable, so freezing proves nothing').toBeGreaterThan(0)

      // Same viewport position as at rest: the field does not travel with the page.
      const afterScroll = await searchField.boundingBox()
      expect(afterScroll?.y).toBeCloseTo(atTop?.y ?? 0, 0)
      expect(afterScroll?.height).toBeCloseTo(atTop?.height ?? 0, 0)

      const bandBox = await band.boundingBox()
      expect(bandBox?.y).toBeCloseTo(0, 0)
    })
  }

  /*
   * The frames are drawn with the design's own short placeholders ("TEAM 1"),
   * but the roster the CMS publishes is real club names, and every card clips
   * its own overflow -- so a name that does not fit is invisible rather than
   * loud. These walk the published data and fail on either way a lockup can
   * leave its card: glyphs wider than the text box, or a box outside the card.
   */
  const CARD_LOCKUPS = [
    { path: '/teams', card: '[data-team-card]' },
    { path: '/teams/team-21', card: '[class*="exploreCard"]' },
    { path: '/awards/mvp', card: '[class*="MvpPickCard-module__card"]' },
  ] as const

  for (const [label, width] of [
    ['mobile', 430],
    ['desktop', 1280],
  ] as const) {
    for (const route of CARD_LOCKUPS) {
      test(`${label} ${route.path} keeps every card lockup inside its card`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(route.path)
        // Fonts only: what a lockup measures is glyph advance, and decoding the
        // card art as well would make this fail on an image asset it never reads.
        await page.evaluate(() => document.fonts.ready)

        const cards = page.locator(route.card)
        expect(await cards.count(), 'No cards matched, so nothing was checked').toBeGreaterThan(0)

        const escapes = await cards.evaluateAll((elements) =>
          elements.flatMap((card) => {
            const box = card.getBoundingClientRect()

            return [...card.querySelectorAll<HTMLElement>('h2, h3, a, button')].flatMap((part) => {
              const partBox = part.getBoundingClientRect()
              const text = (part.textContent ?? '').trim().slice(0, 30)
              const spill = Math.round(
                Math.max(
                  partBox.right - box.right,
                  box.left - partBox.left,
                  partBox.bottom - box.bottom,
                  box.top - partBox.top,
                ),
              )
              const clipped = Math.round(part.scrollWidth - part.clientWidth)

              return [
                ...(spill > 1 ? [`${text}: box escapes its card by ${spill}px`] : []),
                ...(clipped > 1 ? [`${text}: text is ${clipped}px wider than its box`] : []),
              ]
            })
          }),
        )

        expect(escapes).toEqual([])
      })
    }
  }

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
   * Every tab the design draws now has a screen behind it. The inert-tab
   * fallback in navItems.ts (href omitted -> <span aria-disabled>) is kept for
   * future tabs, so this asserts the finished state instead: all five are real
   * links, and none of them renders as the disabled span.
   */
  test('every nav tab resolves to a real destination', async ({ page }) => {
    await page.goto('/')

    const tabs = page.locator('nav[aria-label="Primary"] a')
    await expect(tabs).toHaveCount(APP_NAV_ITEMS.length)
    await expect(page.locator('nav[aria-label="Primary"] [aria-disabled="true"]')).toHaveCount(0)

    for (const item of APP_NAV_ITEMS) {
      const tab = page.locator(`[data-nav-id="${item.id}"]`)
      await expect(tab).toBeVisible()
      expect(await tab.evaluate((el) => el.tagName)).toBe('A')
      await expect(tab).toHaveAttribute('href', item.href ?? '')
    }
  })

  test('Individual Team closes each accordion 32px under its copy', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/teams/team-1')
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    /*
     * Accordion 908:1875 is 352 tall over a 102 summary and 218 of text, so the
     * rule that closes a panel sits 32 under the last line however long the CMS
     * copy runs. Every panel is opened because the fixed height this replaced
     * only ever showed on the one that starts open.
     */
    const panels = await page.evaluate(() => {
      const found = [...document.querySelectorAll('details')]
      for (const panel of found) panel.setAttribute('open', '')
      return found.map((panel) => {
        const copy = panel.querySelector('p')
        if (copy === null) return null
        const border = Number.parseFloat(getComputedStyle(panel).borderBottomWidth)
        return {
          padding: getComputedStyle(panel).paddingBottom,
          // Distance from the last line to the rule, which is the bottom border.
          gap: panel.getBoundingClientRect().bottom - border - copy.getBoundingClientRect().bottom,
          // A panel that still pinned a height would stop tracking its copy.
          // (scrollHeight is not usable here: text-box-trim deliberately makes
          // the copy's box shorter than the line boxes inside it.)
          slack:
            panel.getBoundingClientRect().height -
            border -
            (panel.querySelector('summary')?.getBoundingClientRect().height ?? 0) -
            copy.getBoundingClientRect().height,
        }
      })
    })

    expect(panels.length).toBeGreaterThan(1)
    for (const panel of panels) {
      expect(panel?.padding).toBe('32px')
      expect(Math.abs((panel?.slack ?? 0) - 32)).toBeLessThan(1)
      // Sub-pixel line metrics move the last line's box by a fraction.
      expect(Math.abs((panel?.gap ?? 0) - 32)).toBeLessThan(1)
    }
  })

  /*
   * 27 Aug feedback, desktop: "reduce the spacing/padding between the text and
   * the line". The desktop block pinned the open panel at the frame's 356, so
   * on every team whose CMS write-up is shorter than the copy the frame drew,
   * the closing rule sat well below the last line -- 136px adrift on the worst
   * of the roster. It now ends --space-32 under its own copy, as mobile does.
   */
  test('Individual Team closes each desktop accordion 32px under its copy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })

    /*
     * team-1 carries the shortest off-season write-up and buffalo-bills the
     * longest, so between them they cover both sides of the frame's 356. How
     * many panels each yields differs because the CMS has only filled the
     * off-season section for Buffalo -- its other four have no copy to measure.
     */
    for (const { path, panelCount } of [
      { path: '/teams/team-1', panelCount: 5 },
      { path: '/teams/buffalo-bills', panelCount: 1 },
    ]) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)

      const panels = await page.evaluate(() => {
        const found = [...document.querySelectorAll('details')]
        for (const panel of found) panel.setAttribute('open', '')

        return found.flatMap((panel) => {
          const copy = panel.querySelector('p')
          const summary = panel.querySelector('summary')
          if (copy === null || summary === null) return []

          const border = Number.parseFloat(getComputedStyle(panel).borderBottomWidth)
          const box = panel.getBoundingClientRect()

          return [
            {
              // Distance from the last line to the rule, which is the bottom border.
              gap: box.bottom - border - copy.getBoundingClientRect().bottom,
              // A panel still pinning a height would stop tracking its copy.
              slack:
                box.height -
                border -
                summary.getBoundingClientRect().height -
                copy.getBoundingClientRect().height,
            },
          ]
        })
      })

      expect(panels).toHaveLength(panelCount)
      for (const panel of panels) {
        expect(Math.abs(panel.slack - 32)).toBeLessThan(1)
        expect(Math.abs(panel.gap - 32)).toBeLessThan(1)
      }
    }
  })

  /*
   * Opening a panel must push everything after it down the page, never run its
   * copy under the next section. The deployed build pinned the open panel and
   * the accordions block at frame heights, so a long write-up (Baltimore's
   * defence) overflowed onto the black prediction section instead of moving it.
   */
  test('Individual Team pushes the sections below down when accordions open', async ({ page }) => {
    for (const viewport of [
      { width: 430, height: 932 },
      { width: 1280, height: 782 },
    ]) {
      await page.setViewportSize(viewport)
      // Baltimore ships the longest defence write-up in the roster.
      await page.goto('/teams/team-3')
      await page.evaluate(() => document.fonts.ready)

      const flow = await page.evaluate(() => {
        const prediction = document.querySelector('[data-node-id="162:1674"]')
        if (prediction === null) throw new Error('Individual Team is missing its prediction section')

        const predictionTopBefore = prediction.getBoundingClientRect().top + window.scrollY
        const panels = [...document.querySelectorAll('details')]
        for (const panel of panels) panel.setAttribute('open', '')

        const predictionTop = prediction.getBoundingClientRect().top + window.scrollY

        return {
          panelCount: panels.length,
          predictionMoved: predictionTop - predictionTopBefore,
          // The deepest copy bottom must stay above the next section.
          clearance:
            prediction.getBoundingClientRect().top -
            Math.max(
              ...panels.map(
                (panel) => panel.querySelector('p')?.getBoundingClientRect().bottom ?? -Infinity,
              ),
            ),
        }
      })

      expect(flow.panelCount).toBeGreaterThan(1)
      // Four panels opened, so the page below them has to have moved down.
      expect(flow.predictionMoved).toBeGreaterThan(0)
      // 32 under the last line, plus the block's own 56 tail.
      expect(flow.clearance).toBeGreaterThanOrEqual(32)
    }
  })

  /*
   * 27 Aug feedback, desktop: "make the cards end before the Nav so that there
   * is no overlap". Frame 390:1337 ends flush with the last Explore card, so at
   * the end of the scroll the docked pill sat on the carousel.
   */
  test('Individual Team ends its Explore cards clear of the desktop nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/teams/buffalo-bills')
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })

    const tail = await page.evaluate(() => {
      const nav = document.querySelector('[data-app-nav]')
      const cards = [...document.querySelectorAll('[data-node-id="181:1446"] article')]
      if (nav === null || cards.length === 0) {
        throw new Error('Individual Team is missing its nav or Explore cards')
      }

      return {
        cardCount: cards.length,
        gapToNav:
          nav.getBoundingClientRect().top -
          Math.max(...cards.map((card) => card.getBoundingClientRect().bottom)),
      }
    })

    expect(tail.cardCount).toBeGreaterThan(1)
    expect(tail.gapToNav).toBeGreaterThan(24)
  })

  test('Individual Team ends clear of the docked nav', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/teams/team-1')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => undefined)))
    })
    await scrollScreenToEnd(page)

    // The page used to end flush with the last Explore card, so the nav covered it.
    const lastCard = await page.locator('[aria-labelledby="explore-title"] article').last().boundingBox()
    const nav = await page.getByRole('navigation', { name: 'Primary' }).boundingBox()

    expect(lastCard, 'Explore carousel rendered no cards').not.toBeNull()
    expect(nav, 'Nav was not rendered').not.toBeNull()
    expect((nav?.y ?? 0) - (lastCard?.y ?? 0) - (lastCard?.height ?? 0)).toBeGreaterThan(24)
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
    /*
     * Sections are content-driven since the 27 Aug review, so every number below
     * is the frame's, reached by wrapping the design's own Buffalo copy rather
     * than by a height the stylesheet pins. Two things follow:
     *
     *  - the layout lands within a few px of the frame rather than exactly on
     *    it, because Figma wraps a paragraph a fraction differently than a
     *    browser does, and
     *  - Chromium and WebKit disagree with each other by ~3px over the page for
     *    the same reason, which a pinned height used to hide.
     *
     * DRIFT is that budget. It is far tighter than any real layout regression —
     * a section losing its padding or a card its aspect ratio moves tens of px —
     * so this still fails on one. Heights the design does pin (881, 717, 605,
     * 474, 712.546) stay exact; only what text drives is given the budget.
     */
    const DRIFT = 6
    const near = (actual: number | undefined, expected: number, tolerance = DRIFT) =>
      expect(Math.abs((actual ?? Number.NaN) - expected)).toBeLessThanOrEqual(tolerance)

    const overviewBox = await page.locator('[data-node-id="162:2236"]').boundingBox()
    near(overviewBox?.y, 494, 1)
    near(overviewBox?.height, 825)
    const accordionsBox = await page.locator('[data-node-id="162:1668"]').boundingBox()
    near(accordionsBox?.y, 1319, 1)
    near(accordionsBox?.height, 932, 8)
    const predictionBox = await page.locator('[data-node-id="162:1674"]').boundingBox()
    near(predictionBox?.y, 2257)
    near(predictionBox?.height, 638, 1)
    // Frame 1311 is 881 tall in Figma: a 340px copy block over a 541px photo.
    const favouriteBox = await page.locator('[data-node-id="188:2513"]').boundingBox()
    near(favouriteBox?.y, 2895)
    near(favouriteBox?.height, 881, 1)
    // 823:5900 sits under the bet lines on mobile only, and every section below
    // Frame 1311 rides on its height — dropping it pulled them all up by 340px.
    const favouriteCopy = await page.locator('[data-node-id="823:5900"]').boundingBox()
    near(favouriteCopy?.height, 126, 1)
    near(favouriteCopy?.y, 3058)
    const oddsBox = await page.locator('[data-node-id="162:2237"]').boundingBox()
    near(oddsBox?.y, 3776)
    near(oddsBox?.height, 712.546, 1)
    const scheduleBox = await page.locator('[data-node-id="738:4484"]').boundingBox()
    expect(scheduleBox).toMatchObject({ x: 0, width: 430, height: 717 })
    near(scheduleBox?.y, 4489)
    const scheduleGridBox = await page.locator('[data-node-id="730:3141"]').boundingBox()
    expect(scheduleGridBox).toMatchObject({ x: 24, width: 382, height: 605 })
    near(scheduleGridBox?.y, 4601)
    const exploreBox = await page.locator('[data-node-id="181:1446"]').boundingBox()
    near(exploreBox?.y, 5206)
    near(exploreBox?.height, 474, 1)

    const heroImage = page.locator('[data-node-id="162:2215"] > picture img')
    expect(await heroImage.boundingBox()).toMatchObject({
      width: 430,
      height: 319,
    })
    await expect(heroImage).toHaveCSS('object-fit', 'cover')
    await expect(heroImage).toHaveCSS('object-position', '50% 100%')
    const predictionImage = await page.locator('[data-node-id="162:1674"] img').boundingBox()
    expect(predictionImage?.width).toBeCloseTo(430, 0)
    expect(predictionImage?.height).toBeCloseTo(282.72, 1)
    // Cover-cropped and pushed 82px down the section, per the Figma fill.
    const favouriteImage = page.locator('[data-node-id="188:2513"] picture img')
    const favouriteImageBox = await favouriteImage.boundingBox()
    near(favouriteImageBox?.y, 2977)
    near(favouriteImageBox?.width, 430, 1)
    near(favouriteImageBox?.height, 881, 1)
    await expect(favouriteImage).toHaveCSS('object-fit', 'cover')

    const predictionPillBox = await page.locator('[data-node-id="162:1676"]').boundingBox()
    expect(predictionPillBox).toMatchObject({ x: 131, width: 168, height: 43 })
    near(predictionPillBox?.y, 2313)
    const predictionScoreBox = await page.locator('[data-node-id="162:1678"]').boundingBox()
    expect(predictionScoreBox).toMatchObject({ x: 16, width: 398, height: 115 })
    near(predictionScoreBox?.y, 2380)
    const predictionScoreLine = page.locator('[data-node-id="162:1678"] > p')
    await expect(predictionScoreLine).toHaveCSS('line-height', '44px')
    await expect(predictionScoreLine).toHaveCSS('text-box-trim', 'trim-both')
    await expect(predictionScoreLine).toHaveCSS('white-space', 'nowrap')
    const predictionCopyBox = await page.locator('[data-node-id="162:2212"]').boundingBox()
    expect(predictionCopyBox).toMatchObject({ x: 16, width: 398 })
    near(predictionCopyBox?.y, 2519)
    // The frame draws 126; the copy now measures its own five lines to it.
    near(predictionCopyBox?.height, 126, 1)

    const expandedAccordionCopy = page.locator('[data-node-id="162:1669"] > p')
    const accordionCopyBox = await expandedAccordionCopy.boundingBox()
    // The frame's 310 is what the design's own copy measures, not a pinned height.
    near(accordionCopyBox?.height, 310, 3)
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
    // 32 of padding to the rule (27 Aug feedback), measured here to the outside
    // of the 0.5 rule and through the copy's trimmed text box.
    near(accordionBottomGap, 33, 1)

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

  /*
   * Card 908:1948 is a 183x53 composition with the difficulty tag beside the
   * week and venue metadata. Two columns of it are narrower than 183 on every
   * phone below 430, so the card scales rather than re-laying-out (the fallback
   * this replaced dropped the tag onto a second line under 404, which caught
   * every 390px phone). What is asserted is therefore the frame's proportions,
   * not its pixels: the same box ratio and the same share of the card between
   * the metadata and the tag, at every width the shell supports.
   */
  test('Individual Team holds the frame Schedule card at every phone width', async ({ page }) => {
    // 19 of the frame's 183 sit between the widest metadata and the tag.
    const FRAME_GAP_SHARE = 19 / 183
    const FRAME_ASPECT = 183 / 53

    for (const width of [320, 360, 375, 390, 402, 414, 430]) {
      await page.setViewportSize({ width, height: 932 })
      // Baltimore ships "WK 18 - Home", the widest metadata in the roster.
      await page.goto('/teams/team-3')
      await page.evaluate(async () => {
        await document.fonts.ready
      })

      const cards = page.locator('[data-node-id="730:3141"] article')
      await expect(cards).toHaveCount(18)

      const measured = await cards.evaluateAll((scheduleCards) =>
        scheduleCards.flatMap((card) => {
          const metadata = card.querySelector('[data-schedule-meta]')
          const tag = card.querySelector('[data-schedule-tag]')
          const opponent = card.querySelector('p')

          if (tag === null) return []
          if (metadata === null || opponent === null) {
            throw new Error('Expected a tagged Schedule card to contain metadata.')
          }

          const box = card.getBoundingClientRect()
          const textEnd = Math.max(
            metadata.getBoundingClientRect().right,
            opponent.getBoundingClientRect().right,
          )

          return [
            {
              aspect: box.width / box.height,
              gapShare: (tag.getBoundingClientRect().left - textEnd) / box.width,
            },
          ]
        }),
      )

      expect(measured).toHaveLength(17)
      for (const card of measured) {
        expect(Math.abs(card.aspect - FRAME_ASPECT)).toBeLessThan(0.05)
        // Shorter weeks leave more room; none may leave less than the frame does.
        expect(card.gapShare).toBeGreaterThan(FRAME_GAP_SHARE - 0.01)
      }

      /*
       * The tightest card is the one carrying the widest metadata, and it has
       * to land on the frame's own share rather than merely clearing it — that
       * is what says the card scaled instead of just having room to spare.
       */
      const tightest = Math.min(...measured.map((card) => card.gapShare))
      expect(Math.abs(tightest - FRAME_GAP_SHARE)).toBeLessThan(0.01)
    }
  })

  test('Individual Team renders the Schedule at frame size on the 430 it was drawn for', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/teams/buffalo-bills')
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    expect(await page.locator('[data-node-id="738:4484"]').boundingBox()).toMatchObject({
      width: 430,
      height: 717,
    })
    expect(await page.locator('[data-node-id="730:3141"]').boundingBox()).toMatchObject({
      x: 24,
      width: 382,
      height: 605,
    })

    const card = page.locator('[data-node-id="730:3141"] article').first()
    expect(await card.boundingBox()).toMatchObject({ width: 183, height: 53 })
    // Frame 1410 and the Button/Filter instance inside 908:1948.
    await expect(card.locator('p').first()).toHaveCSS('font-size', '14px')
    const tagBox = await card.locator('[data-schedule-tag]').boundingBox()
    expect(tagBox?.width).toBeCloseTo(70, 0)
    expect(tagBox?.height).toBeCloseTo(21, 0)
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

    /*
     * The accordions (397:2129) are content-driven since the 27 Aug review asked
     * for each panel to end --space-32 under its own copy rather than at the
     * frame's pinned 356 — pinning it left up to 136px of dead navy between the
     * last line and the closing rule, depending on the team. Buffalo's own
     * write-up runs a few px past what the frame drew, so that section is a
     * little over its 844 and every section under it rides the difference.
     *
     * DRIFT is that budget, and it applies only from the accordions down. It is
     * far tighter than any real layout regression — a section losing its padding
     * or an image its aspect ratio moves tens of px — so this still fails on one.
     */
    const DRIFT = 8
    const near = (actual: number | undefined, expected: number, tolerance = DRIFT) =>
      expect(Math.abs((actual ?? Number.NaN) - expected)).toBeLessThanOrEqual(tolerance)

    const pageBox = await page.locator('[data-desktop-node-id="390:1337"]').boundingBox()
    expect(pageBox).toMatchObject({ x: 0, y: 0, width: 1280 })
    // The frame's 4761 plus the nav-clearing tail (104 + 32) the 27 Aug
    // review asked for -- frame 390:1337 ends flush with the Explore cards.
    near(pageBox?.height, 4897)

    for (const section of [
      { id: '390:1741', y: 0, height: 147, contentDriven: false },
      { id: '390:1744', y: 147, height: 487, contentDriven: false },
      { id: '397:1940', y: 634, height: 622, contentDriven: false },
      { id: '397:2129', y: 1256, height: 844, contentDriven: true },
      { id: '397:2201', y: 2100, height: 531, contentDriven: true },
      { id: '397:2207', y: 2615, height: 637, contentDriven: true },
      { id: '397:2265', y: 3252, height: 358, contentDriven: true },
      { id: '791:2688', y: 3610, height: 677, contentDriven: true },
      { id: '397:2318', y: 4287, height: 474, contentDriven: true },
    ]) {
      const box = await page.locator(`[data-desktop-node-id="${section.id}"]`).boundingBox()

      if (section.contentDriven) {
        expect(box).toMatchObject({ x: 0, width: 1280 })
        near(box?.y, section.y)
        // Only the accordions themselves change height; the rest just move.
        near(box?.height, section.height, section.id === '397:2129' ? DRIFT : 1)
      } else {
        expect(box).toMatchObject({ x: 0, y: section.y, width: 1280, height: section.height })
      }
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
    const staffBox = await page.locator('[data-node-id="162:1605"]').boundingBox()
    expect(staffBox).toMatchObject({ x: 80, width: 1120, height: 168 })
    near(staffBox?.y, 3386)
    await expect(page.locator('[data-node-id="181:1431"] article')).toHaveCount(5)

    /*
     * Asserted as "the desktop <source> won", not by file name. Emitted assets
     * are named by content hash, so two identical files collapse to one name
     * and which name a picture resolves to depends on what else the build
     * contains — the placeholders in src/assets/teams are copies of these very
     * images. Comparing against the srcset the page itself declares pins the
     * behaviour without pinning a file name.
     */
    for (const nodeId of ['390:1744', '397:2207']) {
      const picture = page.locator(`[data-desktop-node-id="${nodeId}"] > picture`)
      const mobileSrc = await picture.locator('img').getAttribute('src')
      const desktopSrcSet = await picture.locator('source').getAttribute('srcset')
      expect(desktopSrcSet, `${nodeId} serves one image to both breakpoints`).not.toBe(mobileSrc)

      const chosen = await picture
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.currentSrc)
      expect(chosen).toBe(new URL(desktopSrcSet ?? '', page.url()).href)
    }
    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 678,
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

    // Updated frame 938:6081 (28 Aug): the band grew to 175 to hold the back link.
    expect(await page.locator('[data-node-id="938:6081"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 430,
      height: 175,
    })
    const backLink = page.getByRole('link', { name: 'Back to all Awards' })
    expect(await page.getByRole('heading', { level: 1 }).boundingBox()).toMatchObject({
      x: 24,
      y: 175,
      width: 315,
    })
    const cards = page.locator('[data-mvp-card]')
    await expect(cards).toHaveCount(3)
    const firstMvpCard = await cards.first().boundingBox()
    expect(firstMvpCard).not.toBeNull()
    expect(firstMvpCard?.x).toBeCloseTo(24, 0)
    expect(firstMvpCard?.y).toBeCloseTo(228, 0)
    expect(firstMvpCard?.width).toBeCloseTo(316, 0)
    expect(firstMvpCard?.height).toBeCloseTo(505, 0)
    const secondMvpCard = await cards.nth(1).boundingBox()
    expect(secondMvpCard).not.toBeNull()
    expect(secondMvpCard?.x).toBeCloseTo(356, 0)
    expect(secondMvpCard?.y).toBeCloseTo(228, 0)
    expect(secondMvpCard?.width).toBeCloseTo(316, 0)
    await expect(page.locator('[data-nav-id="awards"]')).toHaveAttribute('aria-current', 'page')

    // 28 Aug feedback: the back link freezes with the band; the title scrolls.
    // The 932 frame viewport holds the whole page, so a phone-height viewport
    // stands in to make the document actually scrollable.
    await page.setViewportSize({ width: 430, height: 600 })
    const linkAtRest = await backLink.boundingBox()
    expect(linkAtRest).not.toBeNull()
    const scrolled = await page.evaluate(() => {
      window.scrollTo(0, 200)
      return window.scrollY
    })
    expect(scrolled, 'Route is not scrollable, so freezing proves nothing').toBeGreaterThan(0)
    expect((await backLink.boundingBox())?.y).toBeCloseTo(linkAtRest?.y ?? 0, 0)
    const scrolledHeading = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(scrolledHeading?.y).toBeCloseTo(175 - scrolled, 0)
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
      y: 678,
      width: 700,
      height: 64,
    })

    const cards = page.locator('[data-team-card]')
    await expect(cards).toHaveCount(32)
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
      expect(atTop).toMatchObject({ x: 290, y: 678, width: 700, height: 64 })
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
      expect(nav?.y).toBeCloseTo(viewport.height - (40 + 64) * scale, 0)
      expect(nav?.width).toBeCloseTo(700 * scale, 0)
      expect(nav?.height).toBeCloseTo(64 * scale, 0)
    }
  })

  test('All Bets preserves its source geometry and filters categories', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/all-bets')
    await page.evaluate(() => document.fonts.ready)

    // The sections hold exactly the bets the CMS publishes, so the page has no
    // fixed height: it ends at its own content plus one --nav-clearance (121)
    // and a --space-24 tail. See screens.ts.
    const betsPage = await page.locator('[data-node-id="251:2889"]').boundingBox()
    const lastCard = await page.locator('[data-bet-card]').last().boundingBox()
    expect(betsPage).not.toBeNull()
    expect(lastCard).not.toBeNull()
    expect((betsPage?.height ?? 0) - ((lastCard?.y ?? 0) + (lastCard?.height ?? 0))).toBeCloseTo(
      145,
      0,
    )
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

    // One card per published CMS bet: 3 + 3 + 3 + 3 + 32 + 1 today.
    const cards = page.locator('[data-bet-card]')
    await expect(cards).toHaveCount(BET_CARD_COUNT)
    expect(await cards.first().boundingBox()).toMatchObject({ width: 382, height: 70 })

    const allBetsFilter = page.getByRole('button', { name: 'All', exact: true })
    const exclusive = page.getByRole('button', { name: 'Exclusive' })
    const mvp = page.getByRole('button', { name: 'MVP Picks' })
    const visibleSections = page.locator('[data-bet-section]:not([hidden])')

    await exclusive.click()
    await expect(allBetsFilter).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleSections).toHaveCount(1)
    await expect(page.locator('[data-bet-card]:not([hidden])')).toHaveCount(
      betCardCount('exclusive'),
    )

    /*
     * 28 Aug feedback: categories combine. Adding MVP Picks widens the list
     * rather than replacing Exclusive, and "All" stays unpressed while any
     * category is.
     */
    await mvp.click()
    await expect(exclusive).toHaveAttribute('aria-pressed', 'true')
    await expect(mvp).toHaveAttribute('aria-pressed', 'true')
    await expect(allBetsFilter).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleSections).toHaveCount(2)

    /*
     * 28 Aug feedback: "nothing is selected and I still see things". Clearing
     * the last category is an empty selection, not a silent fallback to "All",
     * so the screen empties out and says so.
     */
    await exclusive.click()
    await expect(visibleSections).toHaveCount(1)
    await mvp.click()
    await expect(allBetsFilter).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleSections).toHaveCount(0)
    await expect(page.getByText('No bets match your filters.')).toBeVisible()

    // "All" is the way back to everything, and it is an explicit click.
    await allBetsFilter.click()
    await expect(allBetsFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(visibleSections).toHaveCount(6)

    // "All" is the one filter that does not combine: it clears the categories.
    await exclusive.click()
    await expect(visibleSections).toHaveCount(1)
    await allBetsFilter.click()
    await expect(exclusive).toHaveAttribute('aria-pressed', 'false')
    await expect(visibleSections).toHaveCount(6)

    await page.getByRole('searchbox', { name: 'Search bets' }).fill('not a player')
    await expect(page.getByText('No bets match your filters.')).toBeVisible()
  })

  /*
   * 28 Aug feedback: "cross-check the padding on the Selected filter". Figma
   * 251:3002 is 69 x 33 with the label at x=12 and the 25px clear icon ending
   * 4px short of the right edge -- 12 / 8 / 4 horizontally and 4 vertically.
   */
  test('All Bets pads the selected filter to its Figma box', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/all-bets')
    await page.evaluate(() => document.fonts.ready)

    const padding = await page.locator('[data-filter-value="all"]').evaluate((chip) => {
      const style = getComputedStyle(chip)
      return {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft,
      }
    })
    expect(padding).toMatchObject({
      top: '4px',
      right: '4px',
      bottom: '4px',
      left: '12px',
    })

    // The 25px icon has to fit inside the 33px chip, not overflow its padding box.
    const chip = await page.locator('[data-filter-value="all"]').boundingBox()
    const icon = await page.locator('[data-filter-value="all"] [data-filter-clear]').boundingBox()
    expect(chip?.height).toBeCloseTo(33, 0)
    expect(icon?.height).toBeCloseTo(25, 0)
    expect((icon?.y ?? 0) - (chip?.y ?? 0)).toBeCloseTo(4, 0)
    expect((chip?.x ?? 0) + (chip?.width ?? 0) - ((icon?.x ?? 0) + (icon?.width ?? 0))).toBeCloseTo(
      4,
      0,
    )
  })

  /*
   * 791:3532 puts "Clear All" flush with the right edge of the 382 filter block,
   * on the row that carries "Offensive ROTY Picks" (27 Aug feedback). "Nothing
   * to clear" is no category chosen -- the "All" default -- with an empty search.
   */
  test('All Bets reveals Clear All once a category or a search narrows the list', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/all-bets')
    await page.evaluate(() => document.fonts.ready)

    const clearAll = page.getByRole('button', { name: 'Clear All' })
    const search = page.getByRole('searchbox', { name: 'Search bets' })
    const allCategory = page.getByRole('button', { name: 'All', exact: true })

    await expect(clearAll).toBeHidden()

    await search.fill('lamar')
    await expect(clearAll).toBeVisible()

    await clearAll.click()
    await expect(clearAll).toBeHidden()
    await expect(search).toHaveValue('')

    await page.getByRole('button', { name: 'Exclusive' }).click()
    await expect(clearAll).toBeVisible()

    // Frame 1376 sits at x=24 and is 382 wide, and the control ends on its edge.
    const clearAllBox = await clearAll.boundingBox()
    expect(clearAllBox?.x).toBeCloseTo(337, 0)
    const roty = await page.getByRole('button', { name: 'Offensive ROTY Picks' }).boundingBox()
    // The frame draws it beside the last chip rather than on a row of its own.
    expect((clearAllBox?.y ?? 0) + (clearAllBox?.height ?? 0) / 2).toBeCloseTo(
      (roty?.y ?? 0) + (roty?.height ?? 0) / 2,
      0,
    )

    await clearAll.click()
    await expect(clearAll).toBeHidden()
    await expect(allCategory).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-bet-section]:not([hidden])')).toHaveCount(6)
  })

  /*
   * Mobile centres both REDEEM OFFER buttons under the card they belong to
   * (27 Aug feedback). The desktop frame does not — 803:5566 sits at x=0 of its
   * 580 column — which the desktop test below still pins at x=588.
   */
  test('FanDuel centres each Redeem Offer button on mobile', async ({ page }) => {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 932 })
      await page.goto('/fanduel')
      await page.evaluate(() => document.fonts.ready)

      // Selected by role rather than by Figma node ID: the duplicated offer card
      // is the app's own and carries no node ID (28 Aug feedback).
      const offsets = await page
        .locator('[data-fanduel-offer] [aria-label^="Redeem"]')
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const box = button.getBoundingClientRect()
            const column = button.parentElement?.getBoundingClientRect()
            if (column === undefined) throw new Error('Redeem Offer button has no content column')

            return { start: box.left - column.left, end: column.right - box.right }
          }),
        )

      expect(offsets).toHaveLength(3)
      for (const offset of offsets) {
        expect(offset.start).toBeGreaterThan(0)
        expect(Math.abs(offset.start - offset.end)).toBeLessThan(1)
      }
    }
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
      y: 678,
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

  /*
   * 27 Aug feedback, desktop: "make the cards end before the Nav so that there
   * is no overlap" — the MVP Picks instance of it. The nav's old 106px offset
   * put its top at 612, across the cards' odds row; at the mobile 40 the cards
   * clear it. This pins that at the end of the scroll.
   */
  test('desktop Most Valuable Player Picks ends its cards clear of the nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/awards/mvp')
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })

    const clearance = await page.evaluate(() => {
      const nav = document.querySelector('[data-app-nav]')
      const cards = [...document.querySelectorAll('[data-mvp-card]')]
      if (nav === null || cards.length === 0) {
        throw new Error('MVP Picks is missing its nav or cards')
      }

      return {
        cardCount: cards.length,
        gapToNav:
          nav.getBoundingClientRect().top -
          Math.max(...cards.map((card) => card.getBoundingClientRect().bottom)),
      }
    })

    expect(clearance.cardCount).toBe(3)
    expect(clearance.gapToNav).toBeGreaterThan(24)
  })

  test('desktop All Bets matches the current 1280px Figma composition', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 782 })
    await page.goto('/all-bets')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images).map((image) => image.decode()))
    })

    // No height pin: the page ends at whatever the CMS published plus the
    // desktop nav clearance, asserted at the end of this test.
    expect(await page.locator('[data-all-bets-page]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
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

    /*
     * 27 Aug feedback: "cross-check the spacing between the filters". Frame
     * 791:3391 flows the chips left to right with 16px gaps — five on the
     * first row, two on the second, mixed case. The mobile column direction
     * used to fill 106px columns top-to-bottom here instead.
     */
    const chipRows = await page
      .locator('[data-filter-value]')
      .evaluateAll((chips) =>
        chips.map((chip) => {
          const box = chip.getBoundingClientRect()
          return { label: chip.textContent?.trim(), x: box.x, y: box.y, right: box.right }
        }),
      )
    expect(chipRows.filter((chip) => Math.abs(chip.y - 171) < 1)).toHaveLength(5)
    const secondRow = chipRows.filter((chip) => Math.abs(chip.y - 220) < 1)
    expect(secondRow.map((chip) => chip.label)).toEqual([
      'Defensive POTY Picks',
      'Offensive ROTY Picks',
    ])
    for (let i = 1; i < chipRows.length; i += 1) {
      const chip = chipRows[i]!
      const previous = chipRows[i - 1]!
      if (Math.abs(chip.y - previous.y) < 1) {
        expect(chip.x - previous.right).toBeCloseTo(16, 0)
      }
    }

    const firstBet = page.locator('[data-bet-section="mvp"] [data-bet-card]').first()
    const firstBetBox = await firstBet.boundingBox()
    expect(firstBetBox).toMatchObject({ x: 80, width: 357 })
    expect(firstBetBox?.y).toBeCloseTo(358, 0)
    // 75 is the frame's card; a published name that wraps to three lines grows
    // its whole grid row (align-items: stretch), so the height is a floor.
    expect(firstBetBox?.height ?? 0).toBeGreaterThanOrEqual(75)

    /*
     * 27 Aug feedback: "cross-check the text layout ... the line height". Frame
     * 1378 sets "Lamar Jackson +430" as one inline paragraph in a 168px column
     * at 24/26, so the odds flow after the name instead of living in their own
     * column, where they used to split into "+43 / 0".
     */
    const pick = firstBet.locator('p')
    await expect(pick).toHaveCSS('font-size', '24px')
    await expect(pick).toHaveCSS('line-height', '26px')
    const pickBox = await pick.boundingBox()
    expect(pickBox?.width).toBeCloseTo(168, 0)
    // The CTA is an <a> when the CMS publishes a bet URL and a <button> when it
    // does not, so it is located by its accessible name rather than its role.
    const firstBetButton = firstBet.getByLabel(/^Place bet on /)
    await expect(firstBetButton).toBeVisible()
    // WebKit lays the card out 1/64px shy of Chromium, so no exact matches here.
    const firstBetButtonBox = await firstBetButton.boundingBox()
    expect(firstBetButtonBox?.x).toBeCloseTo(280, 0)
    expect(firstBetButtonBox?.width).toBeCloseTo(141, 0)
    expect(firstBetButtonBox?.height).toBeCloseTo(36, 0)

    // Every published favourite future renders as a real card on the frame's
    // three 357px columns (x = 80, 462, 844), instead of the 21 hardcoded
    // desktop-only cards this section used to draw.
    const futureCards = page.locator('[data-bet-section="favourite-futures"] [data-bet-card]')
    await expect(futureCards).toHaveCount(betCardCount('favourite-futures'))
    expect(await futureCards.nth(0).boundingBox()).toMatchObject({ x: 80, width: 357 })
    expect(await futureCards.nth(1).boundingBox()).toMatchObject({ x: 462, width: 357 })
    expect(await futureCards.nth(2).boundingBox()).toMatchObject({ x: 844, width: 357 })
    await expect(
      page.locator('[data-bet-section="exclusive"] [data-bet-card]'),
    ).toHaveCount(betCardCount('exclusive'))

    expect(await page.locator('[data-app-nav]').boundingBox()).toMatchObject({
      x: 290,
      y: 678,
      width: 700,
      height: 64,
    })

    /*
     * 1 Sep feedback: "in the bottom a part that I can not scroll" — the page
     * used to end flush with the last card, which the floating nav then
     * covered. The desktop nav clearance keeps the end of the list readable.
     */
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    const clearance = await page.evaluate(() => {
      const nav = document.querySelector('[data-app-nav]')
      const cards = [...document.querySelectorAll('[data-bet-card]')]
      if (nav === null || cards.length === 0) {
        throw new Error('All Bets is missing its nav or cards')
      }

      return (
        nav.getBoundingClientRect().top -
        Math.max(...cards.map((card) => card.getBoundingClientRect().bottom))
      )
    })
    expect(clearance).toBeGreaterThan(24)
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
      height: 1443,
    })
    expect(await page.locator('[data-node-id="803:5181"]').boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: 1280,
      height: 147,
    })

    /*
     * Three cards, not the frame's two: the 28 Aug review asked for the standard
     * offer to be duplicated, so it repeats on the frame's own 24px gap and the
     * copy matches its source card box for box.
     */
    const offers = page.locator('[data-fanduel-offer]')
    await expect(offers).toHaveCount(3)
    expect(await offers.nth(0).boundingBox()).toMatchObject({ x: 80, y: 187, width: 1120, height: 380 })
    expect(await offers.nth(1).boundingBox()).toMatchObject({ x: 80, y: 591, width: 1120, height: 322 })
    expect(await offers.nth(2).boundingBox()).toMatchObject({ x: 80, y: 937, width: 1120, height: 322 })

    const rewardsCta = page.getByRole('button', { name: 'Redeem Rewards Club offer', exact: true })
    const offerCta = page.getByRole('button', { name: 'Redeem offer', exact: true })
    const duplicateCta = page.getByRole('button', { name: 'Redeem second offer', exact: true })
    await expect(rewardsCta).toBeVisible()
    await expect(offerCta).toBeVisible()
    await expect(duplicateCta).toBeVisible()
    expect(await rewardsCta.boundingBox()).toMatchObject({ x: 588, y: 499, width: 175, height: 36 })
    expect(await offerCta.boundingBox()).toMatchObject({ x: 588, y: 832, width: 175, height: 36 })
    expect(await duplicateCta.boundingBox()).toMatchObject({ x: 588, y: 1178, width: 175, height: 36 })
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
      y: 678,
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
