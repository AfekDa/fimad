import { describe, expect, it } from 'vitest'
import { getStartRoute, routes } from './registry'

describe('route registry', () => {
  it('exposes unique paths', () => {
    const paths = routes.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('exposes unique Figma node ids', () => {
    const nodeIds = routes.map((route) => route.nodeId)
    expect(new Set(nodeIds).size).toBe(nodeIds.length)
  })

  it('uses kebab-case paths for every non-root route', () => {
    const nonRoot = routes.filter((route) => route.path !== '/')
    for (const route of nonRoot) {
      expect(route.path).toMatch(/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('records a positive native frame size for every screen', () => {
    for (const route of routes) {
      expect(route.width).toBeGreaterThan(0)
      expect(route.height).toBeGreaterThan(0)
    }
  })

  it('defines the root path as the start route', () => {
    expect(getStartRoute().path).toBe('/')
  })
})
