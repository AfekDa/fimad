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
import heroPoster from './hero-poster.webp?url'
import heroPosterDesktop from './hero-poster-desktop.webp?url'
import yearMark from './year-2026.png?url'
import featureBadge from './feature-badge.webp?url'
import divider from './divider.svg?url'
import authorAvatar from './avatar-cody.webp?url'
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
import teamsLogoBuffalo from './teams-logo-buffalo.webp?url'
import teamsIconSearch from './teams-icon-search.svg?url'
import teamsActiveRing from './teams-active-ring.svg?url'
import teamsActiveCross from './teams-active-cross.svg?url'
import teamsClearAllCross from './teams-clear-all-cross.svg?url'
import teamsDivider from './teams-divider.svg?url'
import teamsNavHome from './teams-nav-home.svg?url'
import teamsNavTeams from './teams-nav-teams.svg?url'
import teamsCardBuffalo from './teams-card-buffalo.webp?url'
import teamsCardCincinnati from './teams-card-cincinnati.webp?url'
import teamsCardCleveland from './teams-card-cleveland.webp?url'
import teamsCardPittsburgh from './teams-card-pittsburgh.webp?url'
import teamsCardMiami from './teams-card-miami.webp?url'
import teamsCardJets from './teams-card-jets.webp?url'
import teamsCardHouston from './teams-card-houston.webp?url'
import teamsCardJacksonville from './teams-card-jacksonville.webp?url'

/* Individual Team — Figma frame 162:1586 */
import teamBuffaloHero from './team-buffalo-hero.webp?url'
import teamBuffaloHeroDesktop from './team-buffalo-hero-desktop.webp?url'
import teamBuffaloPrediction from './team-buffalo-prediction.webp?url'
import teamBuffaloFuture from './team-buffalo-future.webp?url'
import teamBuffaloFutureDesktop from './team-buffalo-future-desktop.webp?url'
import teamOddsWinTotal from './team-odds-win-total.webp?url'
import teamOddsMakePlayoffs from './team-odds-make-playoffs.webp?url'
import teamOddsMissPlayoffs from './team-odds-miss-playoffs.webp?url'
import teamOddsSuperbowl from './team-odds-superbowl.webp?url'
import teamOddsConference from './team-odds-conference.webp?url'
import teamOddsDivision from './team-odds-division.webp?url'
import teamAccordionDown from './team-accordion-down.svg?url'
import teamAccordionUp from './team-accordion-up.svg?url'
import teamExploreCard from './team-explore-card.webp?url'

/* All Awards — Figma frame 188:2037 */
import awardCardMvp from './award-card-mvp.webp?url'
import mvpCardLamar from './mvp-card-lamar.webp?url'

/* Error State — Figma frames 946:7342 (mobile) and 946:7202 (desktop) */
import errorReferee from './error-referee.webp?url'
import errorRefereeDesktop from './error-referee-desktop.webp?url'
import errorFlame from './error-flame.webp?url'

/* FanDuel Page — desktop Figma frame 803:5180. */
import fanduelRewardsClub from './fanduel-rewards-club-card.webp?url'
import fanduelOffer from './fanduel-offer.webp?url'
import fanduelLockIcon from './fanduel-icon-lock.svg?url'
import fanduelMedalIcon from './fanduel-icon-medal.svg?url'

export const ASSETS = {
  heroPoster,
  heroPosterDesktop,
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
  fanduelLockIcon,
  fanduelMedalIcon,
  errorReferee,
  errorRefereeDesktop,
  errorFlame,
} as const

export type AssetName = keyof typeof ASSETS
