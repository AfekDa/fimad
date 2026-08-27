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
  /**
   * Height of the rendered document in CSS pixels.
   *
   * This is the Figma frame height minus any device chrome the frame draws but
   * the app deliberately does not render (see All Teams below). The fidelity
   * specs clip to this, so it has to describe the app's document, not the
   * artboard.
   */
  readonly height: number
  /**
   * Height of the device viewport the frame is drawn for, in CSS pixels.
   *
   * The frame is taller than the viewport because it shows the whole scrollable
   * document; this is the height at which viewport-anchored chrome (the bottom
   * nav) lands where the frame draws it.
   */
  readonly viewportHeight: number
  /**
   * Height of the docked nav instance this frame draws, in CSS pixels.
   *
   * Defaults to the mobile Nav 1:127 (81). The desktop FanDuel frame instances
   * "Desktop Nav" instead, which is a different component and a different size.
   */
  readonly navHeight?: number
  /**
   * Gap between the bottom of the docked nav and the bottom of the viewport.
   *
   * Defaults to the mobile 40 (nav top 811 + height 81 = 892 in a 932
   * viewport).
   */
  readonly navBottomOffset?: number
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
    nodeId: '162:1721',
    width: 430,
    /* Frame 162:1721 is 1697 tall less its 54px device status bar (162:1759). */
    height: 1643,
    /*
     * Nav scrim 162:1757 ends at 747 + 185 = 932, the device viewport edge, so
     * the band the app actually renders is 932 - 54 = 878.
     */
    viewportHeight: 878,
  },
  {
    path: '/teams',
    frameName: 'All Teams Page',
    nodeId: '162:1760',
    width: 430,
    /* Frame 162:1760 is 2931 tall, but its top 54px are the device status bar,
     * which the app does not render (AllTeams.test.ts). The grid reaches 2878
     * on its own at 430, so nothing pads the page out to reach this. */
    height: 2877,
    /* App Nav 162:1823 sits at y=811 in the frame, so at 811 - 54 = 757 in the
     * document; 757 + 81 + 40 puts the viewport edge at 878. */
    viewportHeight: 878,
  },
  {
    path: '/teams/buffalo-bills',
    frameName: 'Individual Team Page',
    nodeId: '162:1586',
    width: 430,
    /* Frame 162:1586 is 5523 tall less its 54px device status bar. */
    height: 5469,
    /* App Nav 162:1720 sits at y=811, i.e. 757 once the status bar is dropped:
     * the same 878 band as the Homepage. */
    viewportHeight: 878,
  },
  {
    path: '/all-bets',
    frameName: 'Bets Page',
    nodeId: '251:2889',
    width: 430,
    /*
     * Frame 251:2889 is 4861 tall, but its own content stops at 3763 and the
     * 1098 below that is flat #011556 — empty navy the design draws nothing on.
     * The app ends at 3884 instead (content plus one --nav-clearance, so the
     * last bet card clears the docked nav plus a 24 tail), and the band that is
     * compared stops there with it. Nothing is dropped but blank fill.
     */
    height: 3908,
    /* App Nav 251:2934 sits at y=811, i.e. 757 once the status bar is dropped:
     * the same 878 band as the Homepage. */
    viewportHeight: 878,
  },
  {
    path: '/awards',
    frameName: 'All Awards',
    nodeId: '188:2037',
    width: 430,
    /* Frame 188:2037 is 1507 tall less its 54px device status bar. */
    height: 1453,
    /* App Nav 188:2061 sits at y=811, i.e. 757 once the status bar is dropped:
     * the same 878 band as the Homepage. */
    viewportHeight: 878,
  },
  {
    path: '/fanduel',
    frameName: 'FanDuel Page',
    nodeId: '803:5180',
    width: 1280,
    /*
     * Frame 803:5180 is 1215 tall, but its top 118px are a screenshot of the
     * macOS menu bar and Chrome's tab/address/bookmark bars (803:5315 and
     * 803:5316) presenting the page inside a browser. That is mockup framing,
     * not app UI, so the document itself is 1097 — the desktop counterpart of
     * the 54px status bar the mobile frames draw.
     */
    height: 1097,
    /* Places the docked nav at 612 = the frame's 730 less the 118px chrome. */
    viewportHeight: 782,
    /* Desktop Nav 803:5318 is 64 tall at y=730, so 782 - (612 + 64) = 106. */
    navHeight: 64,
    navBottomOffset: 106,
  },
]
