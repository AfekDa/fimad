# Award 1 images

Award 1 shows one picture on the All Awards page and three more on its own
page at `/awards/award-1`. To change one, replace the file and keep the name.
That is the whole procedure: nothing to import, no table to edit.

| File                       | Size       | Where it shows                          |
| -------------------------- | ---------- | --------------------------------------- |
| `all-awards-award-1.png`   | 1146 x 900 | this award on the All Awards page       |
| `cards/award-1-card-1.png` | 1024 x 683 | first card on `/awards/award-1`           |
| `cards/award-1-card-2.png` | 1024 x 683 | second card                             |
| `cards/award-1-card-3.png` | 1024 x 683 | third card                              |

A card file may drop the spelled-out owner — `cards/card-2.png` fills the same
slot as `cards/award-1-card-2.png` — but a spelled-out name has to carry this
folder’s number: an `award-2-card-2.png` in here names no card, and stops
the build.

They are placeholders — the design ships one card photograph and one pick
photograph, so every folder starts with copies of them. Identical copies cost
nothing: git stores one blob and the build emits one file, however many folders
point at it.

**Neither size is pinned.** The All Awards card scales its photograph with
`object-fit: cover`; a pick card stretches its own to a fixed 316 x 505 box. So a
replacement only has to be roughly the same shape to be framed the same way —
unlike the team pictures, whose boxes are measured crops.

`.jpg`, `.jpeg`, `.webp` and `.avif` work too, so `card-1.jpg` is read just
like `card-1.png` — delete the `.png` when you swap the format, or the build
stops on the two files claiming one slot.

When you replace a picture, rewrite the sentence describing it: the All Awards
card’s `imageAlt` lives in `src/screens/Awards/content.ts`, and the pick cards’
in `src/screens/MvpPicks/content.ts`.

See ../README.md for how the folder is read.
