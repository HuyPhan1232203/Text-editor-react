/**
 * @file /src/utils/window.ts
 * @name Window
 * @description Utility functions for interacting with the window object.
 */

import { MM_PER_INCH, STANDARD_PIXELS_PER_INCH } from '../constants/sizing'
import { pythagoreanTheorem } from './math'

/**
 * Calculates the DPI of the window.
 * @returns The DPI of the window.
 */
const calculateWindowDPI = (): number => {
  const ratio = pythagoreanTheorem(window.screen.width, window.screen.height)
        / pythagoreanTheorem(window.screen.availWidth, window.screen.availHeight)
  const dpi = ratio * STANDARD_PIXELS_PER_INCH

  return dpi
}

/**
 * Converts millimeters to pixels.
 *
 * @param mm - The length in millimeters.
 * @returns The length in pixels.
 */
export const mmToPixels = (mm: number): number => {
  const dpi = calculateWindowDPI()
  const inches = mm / MM_PER_INCH

  return inches * dpi
}
