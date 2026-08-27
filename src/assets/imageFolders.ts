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

export interface NestedImageFolders {
  /** What `import.meta.glob` returned: `./awards/award-2/cards/…` -> url. */
  readonly files: Readonly<Record<string, string>>
  /** The folder under `src/assets` that was globbed, e.g. `awards`. */
  readonly root: string
  /** The outer folder-name prefix, e.g. `award` for `award-2`. */
  readonly prefix: string
  /** How many outer folders there are. */
  readonly count: number
  /** The folder inside each one, e.g. `cards`. */
  readonly subfolder: string
  /** The file-name prefix inside it, e.g. `card` for `card-3.png`. */
  readonly itemPrefix: string
  /** How many items each outer folder holds. */
  readonly itemCount: number
}

/**
 * The same idea one level down: a folder inside each numbered folder, holding
 * one picture per card on that item’s own page. Returns
 * `award -> card -> url`, with no entry for an award whose folder is empty.
 *
 * As above, a file may spell its owner out: in `award-2/cards`, both
 * `card-3.png` and `award-2-card-3.png` are card 3. The number in a
 * spelled-out name has to be the folder’s own, so an `award-1-card-3.png`
 * filed under `award-2` stops the build rather than being quietly misread.
 */
export function readNestedImageFolders(
  folders: NestedImageFolders,
): Readonly<Record<number, Readonly<Record<number, string>>>> {
  const { files, root, prefix, count, subfolder, itemPrefix, itemCount } = folders
  const filePath = new RegExp(
    `^[.]/${root}/${prefix}-([0-9]+)/${subfolder}/(.+)[.][^.]+$`,
  )
  const table: Record<number, Record<number, string>> = {}

  for (const [path, url] of Object.entries(files)) {
    const match = filePath.exec(path)
    /* The glob only yields paths of this shape; this narrows the captures. */
    if (match === null) throw new Error(`${path} is not a src/assets/${root} file`)

    const owner = Number(match[1])
    if (owner < 1 || owner > count) {
      throw new Error(`${path} is off the end: src/assets/${root} holds ${prefix} 1-${count}`)
    }

    const fileName = match[2] ?? ''
    const ownPrefix = `${prefix}-${owner}-`
    const itemName = fileName.startsWith(ownPrefix)
      ? fileName.slice(ownPrefix.length)
      : fileName

    const item = Number(new RegExp(`^${itemPrefix}-([0-9]+)$`).exec(itemName)?.[1] ?? NaN)
    if (!Number.isInteger(item) || item < 1 || item > itemCount) {
      throw new Error(
        `${path} does not name one of the ${itemCount} ${itemPrefix} pictures: ` +
          `${itemPrefix}-1 through ${itemPrefix}-${itemCount}, optionally written out ` +
          `as ${prefix}-${owner}-${itemPrefix}-1`,
      )
    }

    const owned: Record<number, string> = table[owner] ?? {}
    if (owned[item] !== undefined) {
      throw new Error(`${prefix} ${owner} has more than one ${itemPrefix} ${item} picture`)
    }
    owned[item] = url
    table[owner] = owned
  }

  return table
}
