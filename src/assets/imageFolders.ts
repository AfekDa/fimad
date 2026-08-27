/**
 * Reading a folder of pictures per item.
 *
 * `src/assets/teams/team-2/hero.png` and `src/assets/awards/award-3/card.png`
 * are the same idea — a numbered folder holding one file per slot, so a
 * picture is changed by replacing a file rather than by editing code — so both
 * are read through here.
 *
 * The `import.meta.glob` call itself stays with each caller: Vite has to see a
 * literal pattern to expand it at build time, so it cannot be passed in.
 */

export interface ImageFolders<Slot extends string> {
  /** What `import.meta.glob` returned: `./teams/team-2/hero.png` -> url. */
  readonly files: Readonly<Record<string, string>>
  /** The folder under `src/assets` that was globbed, e.g. `teams`. */
  readonly root: string
  /** The folder-name prefix inside it, e.g. `team` for `team-2`. */
  readonly prefix: string
  /** How many items there are; a folder numbered past this is an error. */
  readonly count: number
  /** File name without its extension -> the slot that file fills. */
  readonly slots: Readonly<Record<string, Slot>>
}

/**
 * What each numbered folder holds, keyed by its number. A folder with no
 * pictures in it has no entry.
 *
 * A file may repeat its own folder's name as a suffix — in `team-5`, both
 * `all-32-teams.png` and `all-32-teams-team-5.png` fill the `all-32-teams`
 * slot. Spelling it out makes a file recognisable once it is away from its
 * folder, in a downloads pile or in `dist/`, where the emitted asset takes its
 * name from the source file. The number has to be the folder's own: a
 * `-team-6` file in `team-5` names no slot, and so stops the build.
 *
 * A file that does not name a slot, a folder numbered off the end, and two
 * files claiming one slot are all thrown on rather than ignored: this runs
 * while the module initialises, so they stop the build the way a missing
 * `?url` import in assets.ts does.
 */
export function readImageFolders<Slot extends string>(
  folders: ImageFolders<Slot>,
): Readonly<Record<number, Partial<Record<Slot, string>>>> {
  const { files, root, prefix, count, slots } = folders
  const filePath = new RegExp(`^[.]/${root}/${prefix}-([0-9]+)/(.+)[.][^.]+$`)
  const table: Record<number, Partial<Record<Slot, string>>> = {}

  for (const [path, url] of Object.entries(files)) {
    const match = filePath.exec(path)
    /* The glob only yields paths of this shape, so this is unreachable; it is
     * here to narrow the two capture groups rather than to catch anything. */
    if (match === null) throw new Error(`${path} is not a src/assets/${root} file`)

    const number = Number(match[1])
    if (number < 1 || number > count) {
      throw new Error(`${path} is off the end: src/assets/${root} holds ${prefix} 1-${count}`)
    }

    const fileName = match[2] ?? ''
    const ownSuffix = `-${prefix}-${number}`
    const slotName = fileName.endsWith(ownSuffix)
      ? fileName.slice(0, -ownSuffix.length)
      : fileName

    const slot = slots[slotName]
    if (slot === undefined) {
      throw new Error(`${path} is not one of the picture slots: ${Object.keys(slots).join(', ')}`)
    }

    const item: Partial<Record<Slot, string>> = table[number] ?? {}
    if (item[slot] !== undefined) {
      throw new Error(
        `${prefix} ${number} has more than one ${slot} picture; keep one file per slot`,
      )
    }
    item[slot] = url
    table[number] = item
  }

  return table
}
