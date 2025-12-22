/**
 * @file /src/utils/nodes/headerFooter/headerFooterCondition.ts
 * @name HeaderFooterCondition
 * @description Utility functions for header and footer conditions.
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { getPageChildNodePosFromPosition } from '../page/page'
import { isPositionWithinParagraph } from '../paragraph'
import { getEndOfPageAmendmentAndParagraphPosition, getStartOfPageAmendmentAndParagraphPosition } from '../../pagination'
import { isAtEndOfNode, isAtStartOfNode } from '../../positionCondition'
import { isHeaderFooterNode } from './headerFooter'

/**
 * Check if the given position is within a header or footer.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 */
export const isPosInPageAmendment = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    $pos = doc.resolve($pos)
  }

  const { node: pageChildNode } = getPageChildNodePosFromPosition(doc, $pos)

  if (!pageChildNode) return false

  return isHeaderFooterNode(pageChildNode)
}

/**
 * Check if the given position is at the start of a header or footer.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the start of a header or footer, false otherwise.
 */
export const isPosAtStartOfPageAmendment = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  return isPosMatchingStartOfPageAmendmentCondition(doc, $pos, true)
}

/**
 * Check if the given position is at the first child of a header or footer.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the first child of the header or footer, false otherwise.
 */
export const isPosAtFirstChildOfPageAmendment = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  return isPosMatchingStartOfPageAmendmentCondition(doc, $pos, false)
}

/**
 * Check if the given position is at the end of a header or footer.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the end of a header or footer, false otherwise.
 */
export const isPosAtEndOfPageAmendment = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  return isPosMatchingEndOfPageAmendmentCondition(doc, $pos, true)
}

/**
 * Check if the given position is at the last child of a header or footer.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the last child of the header or footer, false otherwise.
 */
export const isPosAtLastChildOfPageAmendment = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  return isPosMatchingEndOfPageAmendmentCondition(doc, $pos, false)
}

/**
 * Check if the given position is at the start of the first page's header or footer.
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @param checkExactStart - Whether the position must be at the exact start of the header or footer.
 * @returns {boolean} True if the position is at the start of the first page's header or footer, false otherwise.
 */
export const isPosMatchingStartOfPageAmendmentCondition = (
  doc: PMNode, $pos: ResolvedPos | number, checkExactStart: boolean): boolean => {
  if (typeof $pos === 'number') {
    $pos = doc.resolve($pos)
  }

  if (!isPosInPageAmendment(doc, $pos)) {
    return false
  }

  // Ensure that the position is within a valid block (paragraph)
  if (!isPositionWithinParagraph($pos)) {
    return false
  }

  const { startOfPageAmendmentPos, startOfParagraphPos } = getStartOfPageAmendmentAndParagraphPosition(doc, $pos)

  if (startOfPageAmendmentPos < 0) {
    console.warn('Invalid page amendment position')
    return false
  }

  if (startOfParagraphPos < 0) {
    console.warn('Invalid paragraph position')
    return false
  }

  return isAtStartOfNode($pos, startOfPageAmendmentPos, startOfParagraphPos, checkExactStart)
}

/**
 * Check if the given position is at the end of the last page's header or footer.
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @param checkExactEnd - Whether the position must be at the exact end of the header or footer.
 * @returns {boolean} True if the position is at the end of the last page's header or footer, false otherwise.
 */
export const isPosMatchingEndOfPageAmendmentCondition = (
  doc: PMNode, $pos: ResolvedPos | number, checkExactEnd: boolean): boolean => {
  if (typeof $pos === 'number') {
    $pos = doc.resolve($pos)
  }

  if (!isPosInPageAmendment(doc, $pos)) {
    return false
  }

  // Ensure that the position is within a valid block (paragraph)
  if (!isPositionWithinParagraph($pos)) {
    return false
  }

  const { endOfPageAmendmentPos, endOfParagraphPos } = getEndOfPageAmendmentAndParagraphPosition(doc, $pos)

  if (endOfPageAmendmentPos < 0) {
    console.warn('Invalid page amendment position')
    return false
  }

  if (endOfParagraphPos < 0) {
    console.warn('Invalid paragraph position')
    return false
  }

  return isAtEndOfNode($pos, endOfPageAmendmentPos, endOfParagraphPos, checkExactEnd)
}
