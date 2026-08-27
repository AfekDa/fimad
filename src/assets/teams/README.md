# Team pictures

One folder per team, `team-1` through `team-32`, matching the roster in
`src/data/teams.ts`. Each folder holds that team’s eleven pictures.

## Changing a team’s picture

Replace the file, keeping its name:

    src/assets/teams/team-2/hero.png

That is the whole procedure. There is no import to add and no table to edit —
`src/assets/teamImages.ts` reads these folders by name at build time, and every
screen resolves a team’s pictures through it, so the All 32 Teams card, the
team’s own page and its card in other teams’ Explore carousels all follow from
the file you just replaced.

## The slots

| File                        | Size        | Where it shows                                       |
| --------------------------- | ----------- | ---------------------------------------------------- |
| `all-32-teams-team-<n>.png` | 1024 x 683  | this team on the All 32 Teams page                   |
| `hero.png`                  | 1024 x 701  | full-bleed photo behind the team name                |
| `hero-desktop.png`          | 1155 x 885  | the same, above 768px                                |
| `prediction.png`            | 992 x 682   | photo under the PREDICTIONS block                    |
| `prediction-desktop.png`    | 992 x 682   | the same, above 768px                                |
| `favorite.png`              | 1108 x 1763 | photo behind FAVORITE FUTURE                         |
| `favorite-desktop.png`      | 814 x 1024  | the same, above 768px                                |
| `explore.png`               | 1024 x 701  | this team in other teams’ Explore All Teams carousel |
| `explore-desktop.png`       | 1024 x 701  | the same, above 768px                                |
| `logo.png`                  | 1920 x 1920 | team lockup, on both this page and the grid card     |
| `logo-desktop.png`          | 1920 x 1920 | the same, above 768px                                |

Each `-desktop` file is served above 768px through a `<picture>`, the plain
one below it. Three of the pairs — prediction, explore and logo — start out
identical, because the design reframes one picture with a different box at that
breakpoint rather than shipping a second export: the prediction photo becomes a
right-hand column, the lockup keeps its measured crop. Replace only the
`-desktop` half to give the wider layout a crop of its own; leave the pair
identical to keep today’s behaviour. Hero and Favorite Future are the other case,
where the design does ship two bitmaps at different aspect ratios.

The All 32 Teams card has no desktop half: the grid draws the same photograph at
both breakpoints.

The All 32 Teams file spells its own team out — `team-5/all-32-teams-team-5.png`
— so it stays recognisable away from the folder: in a downloads pile, or in
`dist/`, where the built asset takes its name from the source file. Plain
`all-32-teams.png` fills the same slot if you would rather not repeat it, but a
spelled-out name has to carry its own folder’s number — an
`all-32-teams-team-6.png` inside `team-5` names no slot, and stops the build.

Each folder’s own README lists the size of the file actually in it. The eight
design card photographs the roster cycles are 1024 x 683 except Buffalo’s, which
is 1024 x 701, so teams 1, 9, 17 and 25 start with the taller one.

`.jpg`, `.jpeg`, `.webp` and `.avif` are read as well, so `logo.jpg` is picked
up exactly like `logo.png`. Delete the `.png` when you change format, or the
build stops on two files claiming one slot. Extensions must be lowercase.

**Keep the pixel size.** These boxes are measured from the Figma frame rather
than fitted, and there is no `object-fit` anywhere in the team styles — the box
*is* the crop. A same-size replacement is framed identically; a different size
reframes the shot instead of scaling it.

## What is in them today

Placeholders. The design ships one team’s photography, so every folder starts
with a copy of it — apart from the All 32 Teams file, where the roster’s eight
design card photographs are dealt out in the order the frame draws them
(buffalo, cincinnati, cleveland, pittsburgh, miami, jets, houston,
jacksonville), so team 1 looks exactly as it did before the folders existed.

Copying costs almost nothing. Git stores one blob per unique file, so 32
identical `hero.png` are one object; Vite names emitted assets by content hash,
so they collapse to a single file in `dist/` too. The 352 files are ~323 MB in
the working tree and add ~0 to both the repository and the build.

## Deleting a file

A slot with no file falls back to the design’s own picture rather than breaking,
so a half-filled folder still renders. The All 32 Teams picture is the one slot
with no single default: without it the grid goes back to cycling the design’s
eight photographs, so team 1 and team 9 would share one.

## Getting the name wrong

A file whose name is not one of the eleven slots fails the build with the list of
valid names, rather than being silently ignored. Same for a `team-*` folder
outside the roster, and for two files claiming the same slot. The check itself
is shared with the award folders — see `src/assets/imageFolders.ts`.

## What is *not* here

Anything shared by all 32 pages stays in `src/assets/` and is named in
`assets.ts`: the six FanDuel odds tiles (`team-odds-*.png`), the accordion
arrows and the search icons. The design’s own team photographs stay there too —
they back the fallbacks above, and `/teams/buffalo-bills`, the frame the
Playwright fidelity suite compares against, renders from them directly.
