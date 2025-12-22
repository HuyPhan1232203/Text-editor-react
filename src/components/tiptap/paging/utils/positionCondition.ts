/**
 * @file /src/utils/positionCondition.ts
 * @name PositionCondition
 * @description Utility functions for position conditions.
 */

import { ResolvedPos } from '@tiptap/pm/model'

export const isAtStartOfNode = (
  $pos: ResolvedPos,
  startOfNodePos: number,
  startOfParagraphPos: number,
  checkExactStart: boolean
): boolean => {
  // Determine the condition to check
  // First position of paragraph will always be 1 more than the body position
  const isFirstParagraph = startOfNodePos + 1 === startOfParagraphPos

  if (!isFirstParagraph) return false

  if (checkExactStart) {
    // Check if position is exactly at the start of the body
    // First position of text will always be 1 more than the first paragraph position
    const isPosAtStartOfParagraph = startOfParagraphPos + 1 === $pos.pos

    return isPosAtStartOfParagraph
  }

  return true
}

/**
 * Check if the given position is exactly at the end of the node.
 *
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @param endOfNodePos - The position of the end of the node.
 * @param endOfParagraphPos - The position of the end of the paragraph.
 * @param checkExactEnd - Whether the position must be at the exact end of the node.
 * @returns {boolean} True if the condition is met, false otherwise.
 */
export const isAtEndOfNode = (
  $pos: ResolvedPos, endOfNodePos: number, endOfParagraphPos: number, checkExactEnd: boolean): boolean => {
  const isLastParagraph = endOfParagraphPos + 1 === endOfNodePos

  if (!isLastParagraph) return false

  if (checkExactEnd) {
    // Check if position is exactly at the end of the node
    // Last position of text will always be 1 less than the end of the last paragraph position
    const isPosAtEndOfParagraph = endOfParagraphPos + 1 === $pos.pos

    return isPosAtEndOfParagraph
  }

  return true
}
