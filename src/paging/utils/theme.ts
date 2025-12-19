/**
 * @file /src/utils/theme.ts
 * @name Theme
 * @description Utility functions for handling the theme of the application
 */

import { type AppTheme, DARK_THEME, LIGHT_THEME } from '../constants/theme'

/**
 * Returns the preferred device theme based on the user's system settings.
 * @returns The preferred device theme (either DARK_THEME or LIGHT_THEME).
 */
export const getDeviceTheme = (): AppTheme => {
  return window.matchMedia(`(prefers-color-scheme: ${DARK_THEME.toLowerCase()})`).matches ? DARK_THEME : LIGHT_THEME
}
