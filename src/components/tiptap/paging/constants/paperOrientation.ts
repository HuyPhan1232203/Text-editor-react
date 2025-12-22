/**
 * @file /src/constants/pageMargins.ts
 * @name PageMargins
 * @description Constants for page margins in the editor.
 */

import type { PaperOrientation, PaperOrientationSelect } from '../types/paper'
import { titleCase } from '../utils/string'

export const paperOrientations: PaperOrientation[] = ['portrait', 'landscape']

/**
 * A mapped version of the paper orientations where the oreintation is the key
 * and the label is the title cased version of the orientation. E.g. can be used
 * in a select input.
 */
export const paperOrientationsSelect: PaperOrientationSelect[] = paperOrientations.map((orientation) => ({
  orientation,
  label: titleCase(orientation)
}))

export const DEFAULT_PAPER_ORIENTATION: PaperOrientation = 'portrait'
