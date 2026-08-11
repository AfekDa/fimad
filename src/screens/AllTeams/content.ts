import { ASSETS } from '../../assets/assets'

export type TeamCardCrop =
  | 'buffalo'
  | 'cincinnati'
  | 'cleveland'
  | 'pittsburgh'
  | 'miami'
  | 'jets'
  | 'houston'
  | 'jacksonville'

export interface TeamCardContent {
  readonly nodeId: string
  readonly imageNodeId: string
  readonly buttonNodeId: string
  readonly image: string
  readonly imageAlt: string
  readonly crop: TeamCardCrop
  readonly team: string
  readonly conference: 'AFC' | 'NFC'
}

/**
 * Visible card sequence from All Teams frame 162:1760.
 * The design intentionally repeats the Buffalo Bills logo and label while its
 * card imagery names the eight AFC teams/players below.
 */
export const ALL_TEAMS_CARDS: readonly TeamCardContent[] = [
  {
    nodeId: '181:1360',
    imageNodeId: 'I181:1360;162:2225',
    buttonNodeId: 'I181:1360;181:283',
    image: ASSETS.teamsCardBuffalo,
    imageAlt: 'Buffalo Bills player portrait',
    crop: 'buffalo',
    team: 'Buffalo Bills',
    conference: 'AFC',
  },
  {
    nodeId: '474:1382',
    imageNodeId: '474:1383',
    buttonNodeId: '474:1388',
    image: ASSETS.teamsCardCincinnati,
    imageAlt: "Cincinnati Bengals wide receiver Ja'Marr Chase",
    crop: 'cincinnati',
    team: 'Cincinnati Bengals',
    conference: 'AFC',
  },
  {
    nodeId: '474:1389',
    imageNodeId: '474:1390',
    buttonNodeId: '474:1395',
    image: ASSETS.teamsCardCleveland,
    imageAlt: 'Cleveland Browns quarterback Shedeur Sanders',
    crop: 'cleveland',
    team: 'Cleveland Browns',
    conference: 'AFC',
  },
  {
    nodeId: '474:1396',
    imageNodeId: '474:1397',
    buttonNodeId: '474:1402',
    image: ASSETS.teamsCardPittsburgh,
    imageAlt: 'Pittsburgh Steelers quarterback Aaron Rodgers',
    crop: 'pittsburgh',
    team: 'Pittsburgh Steelers',
    conference: 'AFC',
  },
  {
    nodeId: '474:1427',
    imageNodeId: '474:1428',
    buttonNodeId: '474:1433',
    image: ASSETS.teamsCardMiami,
    imageAlt: "Miami Dolphins running back De'Von Achane",
    crop: 'miami',
    team: 'Miami Dolphins',
    conference: 'AFC',
  },
  {
    nodeId: '474:1434',
    imageNodeId: '474:1435',
    buttonNodeId: '474:1440',
    image: ASSETS.teamsCardJets,
    imageAlt: 'New York Jets running back Breece Hall',
    crop: 'jets',
    team: 'New York Jets',
    conference: 'AFC',
  },
  {
    nodeId: '474:1441',
    imageNodeId: '474:1442',
    buttonNodeId: '474:1447',
    image: ASSETS.teamsCardHouston,
    imageAlt: 'Houston Texans wide receiver Nico Collins',
    crop: 'houston',
    team: 'Houston Texans',
    conference: 'AFC',
  },
  {
    nodeId: '474:1448',
    imageNodeId: '474:1449',
    buttonNodeId: '474:1454',
    image: ASSETS.teamsCardJacksonville,
    imageAlt: 'Jacksonville Jaguars quarterback Trevor Lawrence',
    crop: 'jacksonville',
    team: 'Jacksonville Jaguars',
    conference: 'AFC',
  },
] as const
