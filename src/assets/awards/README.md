# Award pictures

One folder per award, `award-1` through `award-4`, matching the list in
`src/data/awards.ts`. Each folder holds the award’s All Awards picture and, in a
`cards` folder inside it, one picture per card on that award’s own page.

    src/assets/awards/award-3/
    ├── all-awards-award-3.png     <- the card on /awards
    └── cards/
        ├── award-3-card-1.png
        ├── award-3-card-2.png
        └── award-3-card-3.png     <- the three cards on /awards/award-3

## Changing a picture

Replace the file, keeping its name. There is no import to add and no table to
edit — `src/assets/awardImages.ts` reads these folders by name at build time,
and both screens resolve their pictures through it.

## Where each award goes

Each of the four cards on `/awards` links to its own page: award 1 to
`/awards/award-1`, award 2 to `/awards/award-2`, and so on. Those pages are
generated from `src/pages/awards/[award].astro`, and each draws its three cards
from its own `cards` folder, so replacing one file changes one card on one page.

The design’s own page stays at `/awards/mvp`, rendering frame 188:2186 verbatim.
Nothing links to it any more, but the Playwright suite measures against it, so it
is left exactly as the design has it — the same role `/teams/buffalo-bills` plays
for the team pages.

## Naming

A card file may drop the spelled-out owner — in `award-3/cards`, both
`card-2.png` and `award-3-card-2.png` are card 2. Spelling it out keeps the
file recognisable away from its folder, in a downloads pile or in `dist/`, where
the built asset takes its name from the source file. A spelled-out name has to
carry its own folder’s number: an `award-1-card-2.png` filed under `award-3`
names no card, and stops the build.

`.jpg`, `.jpeg`, `.webp` and `.avif` are read as well. Delete the `.png`
when you change format, or the build stops on two files claiming one slot.
Extensions must be lowercase.

## Sizes

Neither is pinned. The All Awards card scales its photograph with
`object-fit: cover` anchored to the bottom edge; a pick card stretches its own to
a fixed 316 x 505 box. So a replacement only has to be roughly the same shape to
be framed the same way. This is the opposite of `../teams`, where every box is a
measured crop and the pixel size has to match.

## What is in them today

Placeholders. The design draws one All Awards card four times and one pick card
three times, so every folder starts with copies of those two photographs.
Copying costs almost nothing: git stores one blob per unique file, and Vite
names emitted assets by content hash, so the sixteen files are two objects in
the repository and two files in `dist/`.

## The alt text

Not here. Each picture’s sentence lives beside the card it describes — the All
Awards card in `src/screens/Awards/content.ts`, the pick cards in
`src/screens/MvpPicks/content.ts` — so it can be rewritten in the same breath as
the picture itself.

## Deleting a file

A picture with no file falls back to the design’s own rather than breaking, so a
half-filled folder still renders.

## Getting the name wrong

A file that names no slot or no card fails the build with the list of valid
names, rather than being silently ignored. Same for an `award-*` folder numbered
past the end of the list, and for two files claiming one slot. The checks are
shared with the team folders — see `src/assets/imageFolders.ts`.
