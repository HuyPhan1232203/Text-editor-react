/**
 * Object containing line information about a paragraph
 */
export type ParagraphLineInfo = {
  /**
     * The number of lines in the paragraph (as visible in the DOM)
     */
  lineCount: number

  /**
     * The offset of each line within the paragraph
     */
  lineBreakOffsets: number[]

  /**
     * The line number of a specific position within the paragraph
     * (as visible in the DOM)
     */
  lineNumber: number

  /**
     * The character offset within the line
     */
  offsetInLine: number

  /**
     * The distance in pixels from the start of the line
     */
  offsetDistance: number
}
