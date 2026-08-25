/**
 * Every image asset in the project, keyed by the role it plays rather than by
 * the file it happens to live in.
 *
 * This is the one place an asset is named. To swap an image — a new hero, a
 * different avatar, a re-exported icon — change the path on its import line
 * here and every component that uses it follows. Nothing else imports from
 * `src/assets/*` directly.
 *
 * Imports use `?url` so a missing or renamed file fails the build instead of
 * 404ing at runtime; `build.assetsInlineLimit` is 0 in astro.config.mjs to keep
 * that guarantee for small files too.
 *
 * Fonts are not here: they are referenced from `src/styles/fonts.css` by
 * `@font-face`, which never reaches the module graph.
 */

/* Homepage — Figma frame 1:90 */
import heroPoster from './hero-poster.png?url'
import yearMark from './year-2026.png?url'
import featureBadge from './feature-badge.png?url'
import divider from './divider.svg?url'
import authorAvatar from './avatar-cody.png?url'
import authorSignature from './signature.png?url'
import socialX from './social-x.svg?url'
import socialFacebook from './social-facebook.png?url'
import socialInstagram from './social-instagram.svg?url'

/* Nav icons — Figma frame "Icons" (1:43) */
import iconHome from './icon-home.png?url'
import iconTeams from './icon-teams.png?url'
import iconAwards from './icon-awards.png?url'
import iconBets from './icon-bets.png?url'
import iconFanduel from './icon-fanduel.png?url'

/* Button / Filter — Figma frame 1:19 */
import arrowBlack from './icon-arrow-black.svg?url'
import arrowBlue from './icon-arrow-blue.svg?url'
import arrowGrey from './icon-arrow-grey.svg?url'
import arrowWhite from './icon-arrow-white.svg?url'
import fanduelMark from './icon-fanduel-mark.png?url'
import clearRing from './icon-clear-circle.svg?url'
import clearCross from './icon-clear-cross.svg?url'

/* All Teams — Figma frame 162:1760 in file hrRMGXvPDGwzDZmt9mv841 */
import teamsFanduelMask from './teams-fanduel-mask.png?url'
import teamsIconAwards from './teams-icon-awards.svg?url'
import teamsIconBets from './teams-icon-bets.svg?url'
import teamsIconArrow from './teams-icon-arrow.svg?url'
import teamsClearRing from './teams-clear-ring.svg?url'
import teamsClearCross from './teams-clear-cross.svg?url'
import teamsLogoBuffalo from './teams-logo-buffalo.png?url'
import teamsIconSearch from './teams-icon-search.svg?url'
import teamsActiveRing from './teams-active-ring.svg?url'
import teamsActiveCross from './teams-active-cross.svg?url'
import teamsClearAllCross from './teams-clear-all-cross.svg?url'
import teamsDivider from './teams-divider.svg?url'
import teamsNavHome from './teams-nav-home.svg?url'
import teamsNavTeams from './teams-nav-teams.svg?url'
import teamsCardBuffalo from './teams-card-buffalo.png?url'
import teamsCardCincinnati from './teams-card-cincinnati.png?url'
import teamsCardCleveland from './teams-card-cleveland.png?url'
import teamsCardPittsburgh from './teams-card-pittsburgh.png?url'
import teamsCardMiami from './teams-card-miami.png?url'
import teamsCardJets from './teams-card-jets.png?url'
import teamsCardHouston from './teams-card-houston.png?url'
import teamsCardJacksonville from './teams-card-jacksonville.png?url'

/* Individual Team — Figma frame 162:1586 */
import teamBuffaloHero from './team-buffalo-hero.png?url'
import teamBuffaloHeroDesktop from './team-buffalo-hero-desktop.png?url'
import teamBuffaloPrediction from './team-buffalo-prediction.png?url'
import teamBuffaloFuture from './team-buffalo-future.png?url'
import teamBuffaloFutureDesktop from './team-buffalo-future-desktop.png?url'
import teamOddsWinTotal from './team-odds-win-total.png?url'
import teamOddsMakePlayoffs from './team-odds-make-playoffs.png?url'
import teamOddsMissPlayoffs from './team-odds-miss-playoffs.png?url'
import teamOddsSuperbowl from './team-odds-superbowl.png?url'
import teamOddsConference from './team-odds-conference.png?url'
import teamOddsDivision from './team-odds-division.png?url'
import teamAccordionDown from './team-accordion-down.svg?url'
import teamAccordionUp from './team-accordion-up.svg?url'
import teamExploreCard from './team-explore-card.png?url'

/* All Awards — Figma frame 188:2037 */
import awardCardMvp from './award-card-mvp.png?url'
import mvpCardLamar from './mvp-card-lamar.png?url'

/* FanDuel Page — desktop Figma frame 803:5180. */
import fanduelRewardsClub from './fanduel-raw-1.png?url'
import fanduelOffer from './fanduel-offer.png?url'

export const ASSETS = {
  heroPoster,
  yearMark,
  featureBadge,
  divider,
  authorAvatar,
  authorSignature,
  socialX,
  socialFacebook,
  socialInstagram,
  iconHome,
  iconTeams,
  iconAwards,
  iconBets,
  iconFanduel,
  arrowBlack,
  arrowBlue,
  arrowGrey,
  arrowWhite,
  fanduelMark,
  clearRing,
  clearCross,
  teamsFanduelMask,
  teamsIconAwards,
  teamsIconBets,
  teamsIconArrow,
  teamsClearRing,
  teamsClearCross,
  teamsLogoBuffalo,
  teamsIconSearch,
  teamsActiveRing,
  teamsActiveCross,
  teamsClearAllCross,
  teamsDivider,
  teamsNavHome,
  teamsNavTeams,
  teamsCardBuffalo,
  teamsCardCincinnati,
  teamsCardCleveland,
  teamsCardPittsburgh,
  teamsCardMiami,
  teamsCardJets,
  teamsCardHouston,
  teamsCardJacksonville,
  teamBuffaloHero,
  teamBuffaloHeroDesktop,
  teamBuffaloPrediction,
  teamBuffaloFuture,
  teamBuffaloFutureDesktop,
  teamOddsWinTotal,
  teamOddsMakePlayoffs,
  teamOddsMissPlayoffs,
  teamOddsSuperbowl,
  teamOddsConference,
  teamOddsDivision,
  teamAccordionDown,
  teamAccordionUp,
  teamExploreCard,
  awardCardMvp,
  mvpCardLamar,
  fanduelRewardsClub,
  fanduelOffer,
} as const

export type AssetName = keyof typeof ASSETS
