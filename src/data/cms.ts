/**
 * The CMS payload, as published by the Base44 content hub.
 *
 * `cms-content.json` is committed by the CMS's Publish action; every screen's
 * content module reads its copy and imagery from here and falls back to the
 * design's own placeholders for anything the CMS has not filled in yet.
 */
import payload from './cms-content.json'

export interface CmsHome {
  readonly hero_image?: string
  /** Portrait crop for the mobile hero; the wide `hero_image` is desktop-only. */
  readonly hero_image_mobile?: string
  readonly title?: string
  readonly intro_text?: string
  readonly features?: readonly string[]
  readonly closing_text?: string
  readonly author_name?: string
  readonly author_avatar?: string
  readonly author_signature?: string
  readonly social_x_url?: string
  readonly social_facebook_url?: string
  readonly social_instagram_url?: string
}

export interface CmsTeamLines {
  readonly win_total?: string
  readonly make_playoffs?: string
  readonly miss_playoffs?: string
  readonly win_superbowl?: string
  readonly win_conference?: string
  readonly win_division?: string
}

export interface CmsTeamGame {
  readonly week?: number
  readonly opponent?: string
  readonly location?: string
  readonly difficulty?: string
}

export interface CmsTeam {
  readonly name?: string
  readonly slug?: string
  readonly conference?: string
  readonly order?: number
  readonly card_image?: string
  readonly logo_image?: string
  readonly hero_image?: string
  readonly hero_image_mobile?: string
  readonly overview?: string
  readonly head_coach?: string
  readonly offensive_coordinator?: string
  readonly defensive_coordinator?: string
  readonly offseason_changes?: string
  readonly quarterbacks?: string
  readonly running_backs?: string
  readonly receivers?: string
  readonly defence?: string
  readonly prediction_record?: string
  readonly prediction_text?: string
  readonly prediction_image?: string
  readonly prediction_image_mobile?: string
  readonly future_image?: string
  readonly future_image_mobile?: string
  readonly future_player?: string
  readonly future_market?: string
  readonly future_text?: string
  readonly future_bet_url?: string
  readonly lines?: CmsTeamLines
  readonly schedule?: readonly CmsTeamGame[]
}

export interface CmsAwardPick {
  readonly player_name?: string
  readonly image?: string
  readonly description?: string
  readonly odds?: string
  readonly bet_url?: string
}

export interface CmsAward {
  readonly title?: string
  readonly subtitle?: string
  readonly slug?: string
  readonly card_image?: string
  readonly order?: number
  readonly picks?: readonly CmsAwardPick[]
}

export interface CmsBet {
  readonly category?: string
  readonly player_name?: string
  readonly odds?: string
  readonly bet_url?: string
  readonly order?: number
}

export interface CmsFanduel {
  readonly rewards_image?: string
  readonly rewards_label_1?: string
  readonly rewards_label_2?: string
  readonly rewards_label_3?: string
  readonly rewards_button_label?: string
  readonly rewards_button_url?: string
  readonly offer_image?: string
  readonly offer_title?: string
  readonly offer_text?: string
  readonly redeem_label?: string
  readonly redeem_url?: string
}

interface CmsPayload {
  readonly generated_at?: string
  readonly home?: CmsHome | null
  readonly teams?: readonly CmsTeam[]
  readonly awards?: readonly CmsAward[]
  readonly bets?: readonly CmsBet[]
  readonly fanduel?: CmsFanduel | null
}

const content = payload as unknown as CmsPayload

export const CMS_HOME: CmsHome | undefined = content.home ?? undefined

/** Teams in the order the CMS sorts them, which is the order the site numbers them. */
export const CMS_TEAMS: readonly CmsTeam[] = [...(content.teams ?? [])].sort(
  (a, b) => (a.order ?? 0) - (b.order ?? 0),
)

/** The CMS record behind a 1-based roster number, or undefined when unpublished. */
export function cmsTeam(number: number): CmsTeam | undefined {
  return CMS_TEAMS[number - 1]
}

/** Awards in CMS order, which is the order the site numbers them. */
export const CMS_AWARDS: readonly CmsAward[] = [...(content.awards ?? [])].sort(
  (a, b) => (a.order ?? 0) - (b.order ?? 0),
)

/** The CMS record behind a 1-based award number, or undefined when unpublished. */
export function cmsAward(number: number): CmsAward | undefined {
  return CMS_AWARDS[number - 1]
}

export const CMS_FANDUEL: CmsFanduel | undefined = content.fanduel ?? undefined

/** Published bets of one category, in CMS order. */
export function cmsBetsByCategory(category: string): readonly CmsBet[] {
  return [...(content.bets ?? [])]
    .filter((entry) => entry.category === category)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/** A published url, or undefined when the CMS field is blank. */
export function url(value: string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

/** The published string, or the design's own when the CMS field is blank. */
export function text(value: string | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

/** Same, for an image url. */
export function image(value: string | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

/** A CMS textarea split into paragraphs on blank lines, or the fallback prose. */
export function paragraphs(
  value: string | undefined,
  fallback: readonly string[],
): readonly string[] {
  if (typeof value !== 'string') return fallback

  const written = value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')

  return written.length === 0 ? fallback : written
}
