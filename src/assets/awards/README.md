# Award pictures

One folder per award, `award-1` through `award-4`, matching the list in
`src/data/awards.ts`. Each folder holds that award's card photograph.

## Changing an award's picture

Replace the file, keeping its name:

    src/assets/awards/award-3/card.png

That is the whole procedure. There is no import to add and no table to edit —
`src/assets/awardImages.ts` reads these folders by name at build time and the
All Awards screen resolves each card's picture through it.

## The slots

| File       | Size       | Where it shows                             |
| ---------- | ---------- | ------------------------------------------ |
| `card.png` | 1146 x 900 | the photograph filling the All Awards card |

`.jpg`, `.jpeg`, `.webp` and `.avif` are read as well, so `card.jpg` is picked
up exactly like `card.png`. Delete the `.png` when you change format, or the
build stops on two files claiming one slot. Extensions must be lowercase.

**The size is not pinned here.** The card scales its photograph with
`object-fit: cover` and anchors it to the bottom edge, so a replacement only has
to be roughly this shape to be framed the same way. This is the opposite of
`../teams`, where every box is a measured crop and the pixel size has to match.

## What is in them today

Placeholders. The design draws one card four times, so all four folders start
with a copy of its photograph. Copying costs almost nothing: git stores one blob
per unique file, and Vite names emitted assets by content hash, so four
identical `card.png` are one object in the repository and one file in `dist/`.

## The alt text

Not here — each award's `imageAlt` lives beside it in
`src/screens/Awards/content.ts`, so the sentence describing a picture can be
rewritten in the same breath as the picture itself. It is a placeholder today
(`Award 3 cover photograph`) for the same reason the pictures are.

## Deleting a file

An award with no `card.png` falls back to the design's own photograph rather
than breaking, so a half-filled set still renders.

## Getting the name wrong

A file whose name is not a slot fails the build with the list of valid names,
rather than being silently ignored. Same for an `award-*` folder numbered past
the end of the list, and for two files claiming one slot. The check itself is
shared with the team folders — see `src/assets/imageFolders.ts`.
