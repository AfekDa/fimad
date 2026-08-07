import { describe, expect, it } from 'vitest'
import { SCREENS } from './screens'

describe('screen manifest', () => {
  /**
   * Routing is file-based now, so a manifest entry with no page behind it is an
   * implementation error rather than a blank route — the same guarantee the
   * route registry used to give by throwing at import time.
   *
   * This is the only assertion the manifest earns: everything else about it
   * (uniqueness, path shape, positive dimensions) is a property of a hardcoded
   * literal, not of the app.
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
