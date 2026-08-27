import { imageForAwardCard } from '../../assets/awardImages'
import { ASSETS } from '../../assets/assets'
import type { Award } from '../../data/awards'

export interface MvpPickContent {
  readonly nodeId: string
  readonly rankNodeId: string
  readonly nameNodeId: string
  readonly descriptionNodeId: string
  readonly oddsNodeId: string
  readonly rank: number
  readonly name: string
  readonly description: string
  readonly odds: string
  readonly image: string
  /**
   * What the picture shows, for screen readers.
   *
   * Replacing `src/assets/awards/award-<n>/cards/award-<n>-card-<k>.png`
   * should mean rewriting this — it is the sentence that describes it.
   */
  readonly imageAlt: string
}

const DESCRIPTION =
  'Despite throwing 41 touchdowns and over 4,100 yards last season, Lamar couldn’t retain his MVP title. It was the first time he surpassed 4,000 passing yards and he only threw 4 interceptions as well. I suspect there was some voter fatigue but that shouldn’t be an issue for him this season. The Baltimore offense remains one of the best in the NFL and the addition of DeAndre Hopkins gives Lamar another weapon.'

/** The Figma nodes behind each card on frame 188:2186, in source order. */
const CARD_NODE_IDS = [
  {
    nodeId: '188:2196',
    rankNodeId: '188:2198',
    nameNodeId: '188:2201',
    descriptionNodeId: '188:2202',
    oddsNodeId: '188:2204',
  },
  {
    nodeId: '188:2481',
    rankNodeId: '188:2483',
    nameNodeId: '188:2486',
    descriptionNodeId: '188:2487',
    oddsNodeId: '188:2489',
  },
  {
    nodeId: '188:2497',
    rankNodeId: '188:2499',
    nameNodeId: '188:2502',
    descriptionNodeId: '188:2503',
    oddsNodeId: '188:2505',
  },
] as const

/**
 * The design’s own three cards, drawn on frame 188:2186 and rendered verbatim
 * at /awards/mvp — the frame the Playwright suite measures against, which is
 * why its copy and photograph are left exactly as the design has them.
 */
export const MVP_PICKS: readonly MvpPickContent[] = CARD_NODE_IDS.map((nodes, index) => ({
  ...nodes,
  rank: index + 1,
  name: 'LAMAR JACKSON',
  description: DESCRIPTION,
  odds: '+430',
  image: ASSETS.mvpCardLamar,
  imageAlt: 'Lamar Jackson in a Baltimore Ravens uniform',
}))

/**
 * The three cards on one award’s own page.
 *
 * Placeholders, like the roster in ../../data/teams.ts: the copy names the
 * award so the four pages are told apart, and each card draws its picture from
 * that award’s `cards` folder, so replacing one file changes one card.
 */
export function createAwardPicks(award: Award): readonly MvpPickContent[] {
  return CARD_NODE_IDS.map((nodes, index) => {
    const rank = index + 1
    return {
      ...nodes,
      rank,
      name: `AWARD ${award.number} PICK ${rank}`,
      description: `Placeholder write-up for pick ${rank} of award ${award.number}. ${DESCRIPTION}`,
      odds: '+430',
      image: imageForAwardCard(award.number, rank),
      imageAlt: `Award ${award.number} pick ${rank} photograph`,
    }
  })
}
