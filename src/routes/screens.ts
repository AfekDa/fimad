/**
 * Screen manifest — pure data, no component or stylesheet imports.
 *
 * Routing itself is file-based (src/pages/), so this is no longer a registry:
 * it is the record of each screen's Figma geometry, read by the Playwright
 * fidelity specs, which cannot process CSS modules or asset imports.
 *
 * Source: Figma file LLdGlhexL3wmfFd4HBeOKm, page "Page 1".
 */
export interface ScreenMeta {
  /** Route path. The Figma prototype starting frame maps to '/'. */
  readonly path: string
  /** Human-readable Figma frame name, verbatim from the design. */
  readonly frameName: string
  /** Figma node ID of the source top-level frame. */
  readonly nodeId: string
  /** Native frame width in CSS pixels, from Figma. */
  readonly width: number
  /** Native frame height in CSS pixels, from Figma. */
  readonly height: number
  /**
   * Height of the device viewport the frame is drawn for, in CSS pixels.
   *
   * The frame is taller than the viewport because it shows the whole scrollable
   * document; this is the height at which viewport-anchored chrome (the bottom
   * nav) lands where the frame draws it.
   */
  readonly viewportHeight: number
}

/**
 * Only one top-level frame on the page is a full screen. The other three
 * ("Button/Filter" 1:19, "Icons" 1:43, "Nav" 1:128) are component definition
 * sheets and are implemented as reusable components, not routes.
 */
export const SCREENS: readonly ScreenMeta[] = [
  {
    path: '/',
    frameName: 'Homepage',
    nodeId: '1:90',
    width: 430,
    height: 1697,
    /* Nav scrim 1:126 ends at 747 + 185 = 932. */
    viewportHeight: 932,
  },
  {
    path: '/teams',
    frameName: 'All Teams Page',
    nodeId: '162:1760',
    width: 430,
    height: 2931,
    /* Nav scrim 162:1822 ends at the 932px device viewport edge. */
    viewportHeight: 932,
  },
]
