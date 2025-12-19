/**
 * @file /src/utils/pagination.ts
 * @name Pagination
 * @description Utility functions for paginating the editor content.
 */

import { NodeType, Node as PMNode, ResolvedPos, Schema } from '@tiptap/pm/model'
import { PAGE_NODE_NAME } from '../constants/page'
import { BODY_NODE_NAME } from '../constants/body'
import { HEADER_FOOTER_NODE_NAME } from '../constants/pageRegions'
import type { PaginationNodeTypes } from '../types/pagination'
import { getStartOfBodyPosition, getEndOfBodyPosition } from './nodes/body/bodyPosition'
import { getEndOfParagraphPosition, getStartOfParagraphPosition } from './nodes/paragraph'
import { getStartOfPageAmendmentPosition, getEndOfPageAmendmentPosition } from './nodes/headerFooter/headerFooterPosition'

/**
 * Get the start of the page amendment and paragraph positions.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {startOfPageAmendmentPos: number, startOfParagraphPos: number} The start positions of the
 * page amendment and paragraph.
 */
export const getStartOfPageAmendmentAndParagraphPosition = (
  doc: PMNode,
  pos: ResolvedPos | number
): { startOfPageAmendmentPos: number, startOfParagraphPos: number } => {
  const startOfParagraphPos = getStartOfParagraphPosition(doc, pos)
  const startOfPageAmendmentPos = getStartOfPageAmendmentPosition(doc, pos)

  return { startOfPageAmendmentPos, startOfParagraphPos }
}

/**
 * Get the end of the page amendment and paragraph positions.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {endOfPageAmendmentPos: number, endOfParagraphPos: number} The end positions of the
 * page amendment and paragraph.
 */
export const getEndOfPageAmendmentAndParagraphPosition = (
  doc: PMNode,
  $pos: ResolvedPos | number
): { endOfPageAmendmentPos: number, endOfParagraphPos: number } => {
  const endOfParagraphPos = getEndOfParagraphPosition(doc, $pos)
  const endOfPageAmendmentPos = getEndOfPageAmendmentPosition(doc, $pos)

  return { endOfPageAmendmentPos, endOfParagraphPos }
}

/**
 * Get the start of the body and paragraph positions.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {startOfBodyPos: number, startOfParagraphPos: number} The start positions of the body and paragraph.
 */
export const getStartOfBodyAndParagraphPosition = (
  doc: PMNode,
  pos: ResolvedPos | number
): { startOfBodyPos: number, startOfParagraphPos: number } => {
  const startOfParagraphPos = getStartOfParagraphPosition(doc, pos)
  const startOfBodyPos = getStartOfBodyPosition(doc, pos)

  return { startOfBodyPos, startOfParagraphPos }
}

/**
 * Get the end of the body and paragraph positions.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {endOfBodyPos: number, endOfParagraphPos: number} The end positions of the body and paragraph.
 */
export const getEndOfBodyAndParagraphPosition = (
  doc: PMNode,
  $pos: ResolvedPos | number
): { endOfBodyPos: number, endOfParagraphPos: number } => {
  const endOfParagraphPos = getEndOfParagraphPosition(doc, $pos)
  const endOfBodyPos = getEndOfBodyPosition(doc, $pos)

  return { endOfBodyPos, endOfParagraphPos }
}

/**
 * Collect the node types for pagination.
 *
 * @param schema - The schema of the editor.
 * @returns {PaginationNodeTypes} The node types for pagination.
 * @throws {Error} Throws an error if the page, body, or header/footer node types are not found in the schema.
 */
export const getPaginationNodeTypes = (schema: Schema): PaginationNodeTypes => {
  const { nodes } = schema

  const pageNodeType = nodes[PAGE_NODE_NAME]
  const headerFooterNodeType: NodeType | undefined = nodes[HEADER_FOOTER_NODE_NAME]
  const bodyNodeType = nodes[BODY_NODE_NAME]
  const paragraphNodeType = nodes.paragraph

  if (!pageNodeType || !bodyNodeType) {
    throw new Error('Page or body node type not found in schema')
  }

  return { pageNodeType, headerFooterNodeType, bodyNodeType, paragraphNodeType }
}
