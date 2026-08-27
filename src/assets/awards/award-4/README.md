# Award 4 image

This is the picture award 4 shows. To change it, replace the file and keep
the name. That is the whole procedure: nothing to import, no table to edit.

| File       | Size       | Where it shows                            |
| ---------- | ---------- | ----------------------------------------- |
| `card.png` | 1146 x 900 | the photograph filling the All Awards card |

It is a placeholder — the design ships one card photograph, so all four folders
start with a copy of it. Identical copies cost nothing: git stores one blob and
the build emits one file, however many folders point at it.

The size is not pinned. The card scales its photograph with `object-fit: cover`,
so a replacement only has to be roughly this shape to be framed the same way —
unlike the team pictures, whose boxes are measured crops.

`.jpg`, `.jpeg`, `.webp` and `.avif` work too, so `card.jpg` is read just like
`card.png` — delete the `.png` when you swap the format, or the build stops on
the two files claiming one slot.

When you replace the picture, rewrite award 4's `imageAlt` in
`src/screens/Awards/content.ts`: that is the sentence describing this image to
screen readers.

See ../README.md for how the folder is read.
