import { ASSETS } from '../../assets/assets'
import { imagesForTeam } from '../../assets/teamImages'
import { cmsTeam, image as cmsImage } from '../../data/cms'
import { TEAMS } from '../../data/teams'
import type { Conference } from '../../data/teams'

export type TeamCardCrop =
  /** A CMS upload is framed full-bleed, since no measured box was cut for it. */
  | 'cms'
  | 'buffalo'
  | 'cincinnati'
  | 'cleveland'
  | 'pittsburgh'
  | 'miami'
  | 'jets'
  | 'houston'
  | 'jacksonville'

export interface TeamCardContent {
  /**
   * Figma node ids, and so only present on the eight cards the design draws.
   *
   * The roster is 32 long, so the cards past the eighth have no node behind
   * them; leaving the attribute off keeps a node id pointing at exactly one
   * element, which is what the fidelity specs locate by.
   */
  readonly nodeId: string | undefined
  readonly imageNodeId: string | undefined
  readonly buttonNodeId: string | undefined
  readonly image: string
  readonly imageAlt: string
  readonly crop: TeamCardCrop
  /** A CMS logo is a plain mark, so it is shown whole instead of reframed. */
  readonly logoIsCms: boolean
  readonly logoScale: 1 | 1.15 | 1.3
  readonly logo: string
  readonly logoDesktop: string
  readonly team: string
  readonly conference: Conference
  readonly href: string
}

interface TeamCardVisual {
  readonly nodeId: string
  readonly imageNodeId: string
  readonly buttonNodeId: string
  readonly image: string
  readonly crop: TeamCardCrop
}

/**
 * The card treatments drawn on All Teams frame 162:1760 — Figma node ids, card
 * photography and the per-card crop each photo needs.
 *
 * The design only ships eight, so the 32 roster teams cycle through them. The
 * photographs are the design's; the names on the cards come from the roster.
 */
const CARD_VISUALS: readonly TeamCardVisual[] = [
  {
    nodeId: '181:1360',
    imageNodeId: 'I181:1360;162:2225',
    buttonNodeId: 'I181:1360;181:283',
    image: ASSETS.teamsCardBuffalo,
    crop: 'buffalo',
  },
  {
    nodeId: '474:1382',
    imageNodeId: '474:1383',
    buttonNodeId: '474:1388',
    image: ASSETS.teamsCardCincinnati,
    crop: 'cincinnati',
  },
  {
    nodeId: '474:1389',
    imageNodeId: '474:1390',
    buttonNodeId: '474:1395',
    image: ASSETS.teamsCardCleveland,
    crop: 'cleveland',
  },
  {
    nodeId: '474:1396',
    imageNodeId: '474:1397',
    buttonNodeId: '474:1402',
    image: ASSETS.teamsCardPittsburgh,
    crop: 'pittsburgh',
  },
  {
    nodeId: '474:1427',
    imageNodeId: '474:1428',
    buttonNodeId: '474:1433',
    image: ASSETS.teamsCardMiami,
    crop: 'miami',
  },
  {
    nodeId: '474:1434',
    imageNodeId: '474:1435',
    buttonNodeId: '474:1440',
    image: ASSETS.teamsCardJets,
    crop: 'jets',
  },
  {
    nodeId: '474:1441',
    imageNodeId: '474:1442',
    buttonNodeId: '474:1447',
    image: ASSETS.teamsCardHouston,
    crop: 'houston',
  },
  {
    nodeId: '474:1448',
    imageNodeId: '474:1449',
    buttonNodeId: '474:1454',
    image: ASSETS.teamsCardJacksonville,
    crop: 'jacksonville',
  },
]

/** One card per roster team, each linking to that team's own page. */
export const ALL_TEAMS_CARDS: readonly TeamCardContent[] = TEAMS.map((team, index) => {
  const visual = CARD_VISUALS[index % CARD_VISUALS.length]

  if (visual === undefined) {
    throw new Error('CARD_VISUALS is empty, so no team card can be built')
  }

  const isDrawnInFigma = index < CARD_VISUALS.length
  const images = imagesForTeam(team.number)
  const published = cmsTeam(team.number)

  return {
    nodeId: isDrawnInFigma ? visual.nodeId : undefined,
    imageNodeId: isDrawnInFigma ? visual.imageNodeId : undefined,
    buttonNodeId: isDrawnInFigma ? visual.buttonNodeId : undefined,
    image: cmsImage(published?.card_image, images.card ?? visual.image),
    /* The measured boxes were cut around the design's own exports, so a CMS
     * upload of any other size would be zoomed and clipped by them. */
    crop: published?.card_image ? 'cms' : visual.crop,
    logoIsCms: Boolean(published?.logo_image),
    logoScale: team.logoScale,
    logo: cmsImage(published?.logo_image, images.logo),
    logoDesktop: cmsImage(published?.logo_image, images.logoDesktop),
    imageAlt: `${team.name} player portrait`,
    team: team.name,
    conference: team.conference,
    href: team.href,
  }
})
