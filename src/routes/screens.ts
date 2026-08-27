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
  /**
   * Why this screen's content deliberately differs from its Figma export.
   *
   * Set only when the app is meant to render something the frame does not draw,
   * which makes a pixel comparison against the export meaningless rather than
   * failing. The geometry and nav-docking assertions still run; only the two
   * screenshot comparisons are skipped, with this string as the reason.
   */
  readonly divergesFromFigma?: string
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
    /* Measured at 430 with the full 32-card roster. The frame itself is 2931
     * tall (2877 once its 54px device status bar, which the app does not render,
     * comes off) because the design only draws eight of the cards. */
    height: 10366,
    /* App Nav 162:1823 sits at y=811 in the frame, so at 811 - 54 = 757 in the
     * document; 757 + 81 + 40 puts the viewport edge at 878. */
    viewportHeight: 878,
    divergesFromFigma:
      'The frame draws eight cards labelled with real AFC teams. The app ships the 32-team placeholder roster instead (src/data/teams.ts), so the card labels and the page height are both intentionally different from the export. Card geometry is unchanged and is still asserted in responsive.spec.ts.',
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
    divergesFromFigma:
      'Superseded by frame 908:1853 ("Correct Content"), which re-flowed this page for the real team writing the CMS now publishes: it sizes each accordion to its own text (352, 444, 513, 582, 375) where 162:1586 drew one shared 448, and it runs 7522 tall against that frame’s 5523. The app follows the newer frame, so every section below the accordions sits at a different offset than this export draws it. The 27 Aug review also asked for a page tail that clears the docked nav, which no frame draws at all. Section geometry is still asserted in responsive.spec.ts, and the nav-docking assertion below still runs.',
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
    viewportHeight: 782,
    /* Desktop Nav 803:5318 is 64 tall. */
    navHeight: 64,
    /*
     * The frame docks it at y=730 inside a browser mockup whose own bottom edge
     * is 794, i.e. flush with the floor. The 27 Aug review asked for the nav to
     * sit "closer to the bottom end ... same as mobile", so the app draws it at
     * the mobile 40 instead -- see --desktop-nav-bottom-offset.
     */
    navBottomOffset: 40,
  },
]
