/**
 * The published bets, laid over the design's own bet cards.
 *
 * `content.ts` owns the sections — their node ids and how many cards each frame
 * draws. The CMS supplies the players and the odds, filling the cards in order
 * and leaving any card it has no bet for showing the design's placeholder.
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

    if (published.length === 0) return section

    return {
      ...section,
      bets: section.bets.map((card, index) => {
        const bet = published[index]

        if (bet === undefined) return card

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
