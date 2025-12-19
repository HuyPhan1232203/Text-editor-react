/**
 * @file /src/utils/colour.ts
 * @name Colour
 * @description Utility functions for working with colours.
 */

/**
 * Checks if the given paper colour is a valid colour format.
 *
 * This function validates the paper colour by checking if it is in
 * hexadecimal, RGB, or RGBA format.
 *
 * @param paperColour - The colour string to validate.
 * @returns `true` if the colour is valid, otherwise `false`.
 */
export const isValidColour = (paperColour: string): boolean => {
  return isHex(paperColour) || isRGB(paperColour) || isRGBA(paperColour)
}

/**
 * Checks if a given string is a valid hexadecimal color code.
 *
 * A valid hexadecimal color code starts with a '#' followed by either
 * 3 or 6 hexadecimal characters (0-9, A-F, a-f).
 *
 * @param colour - The string to be checked.
 * @returns `true` if the string is a valid hexadecimal color code, otherwise `false`.
 */
const isHex = (colour: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  return hexRegex.test(colour)
}

/**
 * Checks if a given string is in the RGB color format.
 *
 * The RGB color format is defined as `rgb(r, g, b)` where `r`, `g`, and `b` are integers
 * between 0 and 255 inclusive.
 *
 * @param colour - The string to check.
 * @returns `true` if the string is in the RGB color format, otherwise `false`.
 */
const isRGB = (colour: string): boolean => {
  const rgbRegex = /^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/

  return rgbRegex.test(colour)
}

/**
 * Checks if the given colour string is in the RGBA format.
 *
 * The RGBA format is expected to be in the form: `rgba(r, g, b, a)`
 * where `r`, `g`, and `b` are integers between 0 and 255, and `a` is a float between 0 and 1.
 *
 * @param colour - The colour string to check.
 * @returns `true` if the colour string is in the RGBA format, otherwise `false`.
 */
const isRGBA = (colour: string): boolean => {
  const rgbaRegex = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0|1|0?\.\d+)\)$/

  return rgbaRegex.test(colour)
}
