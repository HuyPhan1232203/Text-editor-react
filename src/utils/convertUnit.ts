// utils/convertUnits.ts
/**
 * Convert millimeters to pixels
 * Standard conversion: 1mm = 3.7795275591 pixels (at 96 DPI)
 */
export function mmToPx (mm: number): number {
  return Math.round(mm * 3.7795275591)
}

/**
 * Convert pixels to millimeters
 */
export function pxToMm (px: number): number {
  return Math.round((px / 3.7795275591) * 100) / 100
}

/**
 * Convert millimeters to points (for PDF)
 * 1mm = 2.83464567 points
 */
export function mmToPt (mm: number): number {
  return Math.round(mm * 2.83464567 * 100) / 100
}
