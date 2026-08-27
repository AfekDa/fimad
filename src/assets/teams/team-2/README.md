# TEAM 2 images

These eight files are what TEAM 2 shows. To change one, replace the file and
keep the name. That is the whole procedure: nothing to import, no table to edit.

| File                      | Size        | Where it shows                                       |
| ------------------------- | ----------- | ---------------------------------------------------- |
| `all-32-teams-team-2.png` | 1024 x 683  | this team on the All 32 Teams page                   |
| `hero.png`                | 1024 x 701  | full-bleed photo behind the team name                |
| `hero-desktop.png`        | 1155 x 885  | the same, above 768px                                |
| `prediction.png`          | 992 x 682   | photo under the PREDICTIONS block                    |
| `favorite.png`            | 1108 x 1763 | photo behind FAVORITE FUTURE                         |
| `favorite-desktop.png`    | 814 x 1024  | the same, above 768px                                |
| `explore.png`             | 1024 x 701  | this team in other teams’ Explore All Teams carousel |
| `logo.png`                | 1920 x 1920 | team lockup above the team name                      |

The All 32 Teams file spells this team out so it stays recognisable away from the
folder — in a downloads pile, or in `dist/`, where the built asset takes its name
from the source file. `all-32-teams.png` fills the same slot if you would rather not
repeat it, but a spelled-out name has to carry this folder’s number: an
`all-32-teams-team-3.png` in here names no slot, and stops the build.

They are placeholders — the design only ships one team’s photography, so every
folder starts with a copy of it. Identical copies cost nothing: git stores one
blob and the build emits one file, however many folders point at it.

**Keep the pixel size.** These boxes are measured from the Figma frame rather
than fitted, and no team style uses `object-fit` — the box *is* the crop. A
same-size replacement is framed identically; a different size reframes the shot
instead of scaling it.

`.jpg`, `.jpeg`, `.webp` and `.avif` work too, so `logo.jpg` is read just like
`logo.png` — delete the `.png` when you swap the format, or the build stops on the
two files claiming one slot.

See ../README.md for how the folder is read.
