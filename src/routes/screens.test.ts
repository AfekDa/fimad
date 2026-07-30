import { describe, expect, it } from 'vitest'
import { SCREENS } from './screens'

describe('screen manifest', () => {
  it('is populated', () => {
    expect(
      SCREENS.length,
      'No screens are implemented. Figma extraction has not run — see BLOCKERS.md.',
    ).toBeGreaterThan(0)
  })

  it('exposes unique paths', () => {
    const paths = SCREENS.map((screen) => screen.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('exposes unique Figma node ids', () => {
    const nodeIds = SCREENS.map((screen) => screen.nodeId)
    expect(new Set(nodeIds).size).toBe(nodeIds.length)
  })

  it('uses kebab-case paths for every non-root screen', () => {
    for (const screen of SCREENS.filter((candidate) => candidate.path !== '/')) {
      expect(screen.path).toMatch(/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('records a positive native frame size for every screen', () => {
    for (const screen of SCREENS) {
      expect(screen.width).toBeGreaterThan(0)
      expect(screen.height).toBeGreaterThan(0)
      expect(screen.viewportHeight).toBeGreaterThan(0)
    }
  })

  it('designates the root path as the prototype starting frame', () => {
    expect(SCREENS.some((screen) => screen.path === '/')).toBe(true)
  })

  /**
   * Routing is file-based now, so a manifest entry with no page behind it is an
   * implementation error rather than a blank route — the same guarantee the
   * route registry used to give by throwing at import time.
   */
  it('has a page module for every screen', () => {
    const pages = import.meta.glob('../pages/**/*.astro')
    const paths = Object.keys(pages)

    for (const screen of SCREENS) {
      const expected = screen.path === '/' ? '../pages/index.astro' : `../pages${screen.path}.astro`
      expect(paths, `No page implements screen "${screen.frameName}" (${screen.nodeId}).`).toContain(
        expected,
      )
    }
  })
})
