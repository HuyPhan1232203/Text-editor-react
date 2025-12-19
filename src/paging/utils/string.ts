/**
 * @file /src/utils/string.ts
 * @name String
 * @description Utility functions for string manipulation.
 */

/**
 * Converts a string to title case.
 *
 * @param str - The input string to convert.
 * @returns {string} The string in title case.
 */
export const titleCase = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}
