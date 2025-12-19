/**
 * @file /src/utils/nodes/headerFooter/headerFooterPosition.ts
 * @name HeaderFooterPosition
 * @description Utility functions for header and footer positions.
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { getParentNodePosOfType } from '../node'
import { HEADER_FOOTER_NODE_NAME } from '../../../constants/pageRegions'
import type { Nullable } from '../../../types/record'

/**
 * Get the header or footer node (parent of the current node) position.
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The position of the header or footer node.
 */
export const getThisPageAmendmentNodePosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  return getParentNodePosOfType(doc, pos, HEADER_FOOTER_NODE_NAME).pos
}

/**
 * Get the header or footer node position and the header or footer node itself.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {pageAmendmentPos: number, pageAmendmentNode: Node} The position and the node of the header or footer.
 */
export const getPageAmendmentNodeAndPosition = (
  doc: PMNode,
  pos: ResolvedPos | number
): { pageAmendmentPos: number, pageAmendmentNode: Nullable<PMNode> } => {
  if (typeof pos === 'number') {
    return getPageAmendmentNodeAndPosition(doc, doc.resolve(pos))
  }

  const pageAmendmentPos = getThisPageAmendmentNodePosition(doc, pos)
  const pageAmendmentNode = doc.nodeAt(pageAmendmentPos)

  return { pageAmendmentPos, pageAmendmentNode }
}

/**
 * Get the start of the header or footer position.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The start position of the header or footer.
 */
export const getStartOfPageAmendmentPosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  if (typeof pos === 'number') {
    return getStartOfPageAmendmentPosition(doc, doc.resolve(pos))
  }

  const { pageAmendmentPos } = getPageAmendmentNodeAndPosition(doc, pos)

  return pageAmendmentPos
}

/**
 * Get the end of the header or footer position.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The end position of the header or footer.
 */
export const getEndOfPageAmendmentPosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  if (typeof pos === 'number') {
    return getEndOfPageAmendmentPosition(doc, doc.resolve(pos))
  }

  const { pageAmendmentPos, pageAmendmentNode } = getPageAmendmentNodeAndPosition(doc, pos)

  if (!pageAmendmentNode) {
    return pageAmendmentPos
  }

  return pageAmendmentPos + pageAmendmentNode.content.size
}
