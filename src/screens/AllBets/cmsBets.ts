/**
 * The published bets, laid over the design's own bet cards.
 *
 * `content.ts` owns the sections and their node ids. Once the CMS publishes a
 * category, its section shows exactly the published bets: one card per bet,
 * however many that is. The design's own card list only decides how each card
 * is tagged (bets past the design's count reuse its last node ids) and what a
 * section shows before the CMS has published anything for it. Trimming to the
 * published count is what keeps a design placeholder — a fake player with fake
 * odds — from surviving next to real bets in a category the CMS only part
 * fills (1 Sep feedback: "the bets are in the wrong section").
 */
import type { BetSectionContent } from './content'
import { cmsBetsByCategory, text, url } from '../../data/cms'

/** Section ids on frame 251:3133 against the categories the CMS files bets under. */
const CATEGORY_BY_SECTION: Readonly<Record<string, string>> = {
  mvp: 'mvp',
  'offensive-poty': 'offensive_poty',
  'defensive-poty': 'defensive_poty',
  'offensive-roty': 'offensive_roty',
  'favourite-futures': 'favorite_future',
  exclusive: 'exclusive',
}

export function withCmsBets(
  sections: readonly BetSectionContent[],
): readonly BetSectionContent[] {
  return sections.map((section) => {
    const category = CATEGORY_BY_SECTION[section.id]
    const published = category === undefined ? [] : cmsBetsByCategory(category)

    const lastCard = section.bets.at(-1)
    if (published.length === 0 || lastCard === undefined) return section

    return {
      ...section,
      bets: published.map((bet, index) => {
        const card = section.bets[index] ?? lastCard

        return {
          ...card,
          name: text(bet.player_name, card.name),
          odds: text(bet.odds, card.odds),
          betUrl: url(bet.bet_url),
        }
      }),
    }
  })
}
