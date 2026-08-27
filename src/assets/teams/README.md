# Team pictures

One folder per team, `team-1` through `team-32`, matching the roster in
`src/data/teams.ts`. Each folder holds that team's eight pictures.

## Changing a team's picture

Replace the file, keeping its name:

    src/assets/teams/team-2/hero.png

That is the whole procedure. There is no import to add and no table to edit —
`src/assets/teamImages.ts` reads these folders by name at build time, and every
screen resolves a team's pictures through it, so the All Teams grid card, the
team's own page and its card in other teams' Explore carousels all follow from
the file you just replaced.

## The slots

| File                   | Size        | Where it shows                                       |
| ---------------------- | ----------- | ---------------------------------------------------- |
| `card.png`             | 1024 x 683  | All Teams grid card                                   |
| `hero.png`             | 1024 x 701  | full-bleed photo behind the team name                 |
| `hero-desktop.png`     | 1155 x 885  | the same, above 768px                                 |
| `prediction.png`       | 992 x 682   | photo under the PREDICTIONS block                     |
| `favorite.png`         | 1108 x 1763 | photo behind FAVORITE FUTURE                          |
| `favorite-desktop.png` | 814 x 1024  | the same, above 768px                                 |
| `explore.png`          | 1024 x 701  | this team in other teams' Explore All Teams carousel  |
| `logo.png`             | 1920 x 1920 | team lockup above the team name                       |

Each folder's own README lists the size of the file actually in it — the eight
design card photographs the roster cycles are 1024 x 683 except Buffalo's, which
is 1024 x 701, so teams 1, 9, 17 and 25 start with the taller one.

`.jpg`, `.jpeg`, `.webp` and `.avif` are read as well, so `card.jpg` is picked
up exactly like `card.png`. Delete the `.png` when you change format, or the
build stops on two files claiming one slot. Extensions must be lowercase.

**Keep the pixel size.** These boxes are measured from the Figma frame rather
than fitted, and there is no `object-fit` anywhere in the team styles — the box
*is* the crop. A same-size replacement is framed identically; a different size
reframes the shot instead of scaling it.

## What is in them today

Placeholders. The design ships one team's photography, so every folder starts
with a copy of it — apart from `card.png`, where the roster's eight design card
photographs are dealt out in the order the All Teams frame draws them (buffalo,
cincinnati, cleveland, pittsburgh, miami, jets, houston, jacksonville) so team 1
looks exactly as it did before the folders existed.

Copying costs almost nothing. Git stores one blob per unique file, so 32
identical `hero.png` are one object; Vite names emitted assets by content hash,
so they collapse to a single file in `dist/` too. The 256 files are ~246 MB in
the working tree and add ~0 to both the repository and the build.

## Deleting a file

A slot with no file falls back to the design's own picture rather than breaking,
so a half-filled folder still renders. `card` is the one slot with no single
default: with no `card.png` the All Teams grid goes back to cycling the design's
eight photographs, so team 1 and team 9 would share one.

## Getting the name wrong

A file whose name is not one of the eight slots fails the build with the list of
valid names, rather than being silently ignored. Same for a `team-*` folder
outside the roster, and for two files claiming the same slot. This matches the
rest of `src/assets`, where a missing or misnamed asset is a build error and
never a runtime 404.

## What is *not* here

Anything shared by all 32 pages stays in `src/assets/` and is named in
`assets.ts`: the six FanDuel odds tiles (`team-odds-*.png`), the accordion
arrows and the search icons. The design's own team photographs stay there too —
they back the fallbacks above, and `/teams/buffalo-bills`, the frame the
Playwright fidelity suite compares against, renders from them directly.
