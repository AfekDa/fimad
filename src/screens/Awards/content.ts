import { imagesForAward } from '../../assets/awardImages'
import { cmsAward, image } from '../../data/cms'
import { AWARDS } from '../../data/awards'

export interface AwardCardContent {
  readonly nodeId: string
  readonly headingNodeId: string
  readonly buttonNodeId: string
  readonly title: string
  readonly href: string
  readonly image: string
  /**
   * What the picture shows, for screen readers.
   *
   * A placeholder while every folder holds a copy of the design's one card
   * photograph. Replacing `src/assets/awards/award-<n>/card.png` should mean
   * rewriting the matching line here — it is the sentence that describes it.
   */
  readonly imageAlt: string
}

/** The Figma nodes behind each card on All Awards frame 188:2037, in source order. */
const CARD_NODE_IDS = [
  { nodeId: '188:2047', headingNodeId: '188:2048', buttonNodeId: '188:2049' },
  { nodeId: '188:2050', headingNodeId: '188:2051', buttonNodeId: '188:2052' },
  { nodeId: '188:2053', headingNodeId: '188:2054', buttonNodeId: '188:2055' },
  { nodeId: '188:2056', headingNodeId: '188:2057', buttonNodeId: '188:2058' },
] as const

/** One card per award, each drawing its picture from its own asset folder. */
export const AWARD_CARDS: readonly AwardCardContent[] = AWARDS.map((award, index) => {
  const nodes = CARD_NODE_IDS[index]
  if (nodes === undefined) {
    throw new Error(`Award ${award.number} has no card drawn on frame 188:2037`)
  }

  return {
    ...nodes,
    title: award.title,
    href: award.href,
    image: image(cmsAward(award.number)?.card_image, imagesForAward(award.number).card),
    imageAlt: `Award ${award.number} cover photograph`,
  }
})
