/**
 * The published team page, laid over the design's placeholder one.
 *
 * `content.ts` owns the layout — node ids, card order, crops and the prose that
 * stands in until an editor writes the real thing. This module replaces only
 * what the CMS has actually published for that team, field by field, so a blank
 * field in the content hub still renders the design's own placeholder.
 */
import type {
  ScheduleDifficulty,
  ScheduleLocation,
  TeamPageContent,
} from './content'
import { cmsTeam, image, paragraphs, text, url } from '../../data/cms'
import type { CmsTeamGame, CmsTeamLines } from '../../data/cms'

/** Odds cards in the order frame 162:1605 draws them, against their CMS keys. */
const LINE_KEYS: readonly (keyof CmsTeamLines)[] = [
  'win_total',
  'make_playoffs',
  'miss_playoffs',
  'win_superbowl',
  'win_conference',
  'win_division',
]

/** Accordion sections in the order the design stacks them. */
const SECTION_KEYS = [
  'offseason_changes',
  'quarterbacks',
  'running_backs',
  'receivers',
  'defence',
] as const

function locationFrom(
  published: string | undefined,
  fallback: ScheduleLocation | null,
): ScheduleLocation | null {
  if (published === 'Home' || published === 'Away') return published
  if (published === 'None') return null

  return fallback
}

function difficultyFrom(
  published: string | undefined,
  fallback: ScheduleDifficulty | null,
): ScheduleDifficulty | null {
  switch (published) {
    case 'Easy':
      return 'easy'
    case 'Moderate':
      return 'moderate'
    case 'Difficult':
      return 'difficult'
    default:
      return fallback
  }
}

export function withCmsContent(number: number, base: TeamPageContent): TeamPageContent {
  const published = cmsTeam(number)

  if (published === undefined) return base

  const games = new Map<number, CmsTeamGame>()
  for (const game of published.schedule ?? []) {
    if (typeof game.week === 'number') games.set(game.week, game)
  }

  const opponentFor = (week: number, fallback: string): string =>
    text(games.get(week)?.opponent, fallback)

  const staffNames = [
    published.head_coach,
    published.offensive_coordinator,
    published.defensive_coordinator,
  ]

  return {
    ...base,
    name: text(published.name, base.name).toUpperCase(),
    heroImage: image(published.hero_image_mobile ?? published.hero_image, base.heroImage),
    heroImageDesktop: image(published.hero_image, base.heroImageDesktop),
    logo: image(published.logo_image, base.logo),
    logoDesktop: image(published.logo_image, base.logoDesktop),
    overviewParagraphs: paragraphs(published.overview, base.overviewParagraphs),
    staff: base.staff.map((member, index) => ({
      ...member,
      name: text(staffNames[index], member.name).toUpperCase(),
    })),
    accordionSections: base.accordionSections.map((section, index) => {
      const key = SECTION_KEYS[index]

      return {
        ...section,
        paragraphs: paragraphs(key === undefined ? undefined : published[key], section.paragraphs),
      }
    }),
    predictionImage: image(
      published.prediction_image_mobile ?? published.prediction_image,
      base.predictionImage,
    ),
    predictionImageDesktop: image(published.prediction_image, base.predictionImageDesktop),
    predictionRecord: text(published.prediction_record, base.predictionRecord),
    predictionCopy: text(published.prediction_text, base.predictionCopy),
    favoriteImage: image(
      published.future_image_mobile ?? published.future_image,
      base.favoriteImage,
    ),
    favoriteImageDesktop: image(published.future_image, base.favoriteImageDesktop),
    favoritePlayer: text(published.future_player, base.favoritePlayer).toUpperCase(),
    favoriteBet: text(published.future_market, base.favoriteBet).toUpperCase(),
    favoriteCopy: text(published.future_text, base.favoriteCopy),
    favoriteBetUrl: url(published.future_bet_url) ?? base.favoriteBetUrl,
    odds: base.odds.map((odd, index) => {
      const key = LINE_KEYS[index]

      return {
        ...odd,
        value: text(key === undefined ? undefined : published.lines?.[key], odd.value),
      }
    }),
    schedule: base.schedule.map((game) => {
      const location = locationFrom(games.get(game.week)?.location, game.location)

      return {
        ...game,
        opponent: location === null ? 'NO GAME' : opponentFor(game.week, game.opponent),
        location,
        difficulty:
          location === null
            ? null
            : difficultyFrom(games.get(game.week)?.difficulty, game.difficulty),
      }
    }),
    desktopSchedule: base.desktopSchedule.map((game) => ({
      ...game,
      opponent: opponentFor(game.week, game.opponent),
    })),
  }
}
