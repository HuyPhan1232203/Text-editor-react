/**
 * @file /src/utils/nodes/page/pageNumber.ts
 * @name PageNumber
 * @description Utility functions for page numbers
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import type { NodePos } from '../../../types/node'
import type { Nullable } from '../../../types/record'
import { collectPageNodes, doesDocHavePageNodes, isPageNode } from './page'
import { getPageNodeAndPosition } from './pagePosition'
import { handleOutOfRangePageNum, isPageNumInRange } from './pageRange'

/**
 * Get the page node by page number.
 *
 * @param doc - The current document.
 * @param pageNum - The page number to find the page node for (0-indexed).
 * @returns {Nullable<PMNode>} The page node of the specified page or null
 * if the page could not be found.
 */
export const getPageNodeByPageNum = (doc: PMNode, pageNum: number): Nullable<PMNode> => {
  if (!isPageNumInRange(doc, pageNum)) {
    console.warn('Page number:', pageNum, 'is out of range for the document')
    return null
  }

  const pageNode = doc.child(pageNum)

  if (!isPageNode(pageNode)) {
    console.error('Unexpected! Doc child num:', pageNum, 'is not a page node!')
    return null
  }

  return pageNode
}

/**
 * Get the page node and position by page number.
 *
 * @param doc - The current document.
 * @param pageNum - The page number to find the page node for (0-indexed).
 * @returns {Nullable<NodePos>} The page node position of the specified page or null
 * if the page could not be found.
 */
export const getPageNodePosByPageNum = (doc: PMNode, pageNum: number): Nullable<NodePos> => {
  if (!isPageNumInRange(doc, pageNum)) {
    console.warn('Page number:', pageNum, 'is out of range for the document')
    return null
  }

  const pageNodes = collectPageNodes(doc)

  return pageNodes[pageNum]
}

/**
 * Get the page number of the resolved position.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document.
 * @param zeroIndexed - Whether to return the page number as zero-indexed. Default is true.
 * @returns {number} The page number of the resolved position.
 */
export const getPageNumber = (doc: PMNode, $pos: ResolvedPos | number, zeroIndexed: boolean = true): number => {
  if (typeof $pos === 'number') {
    return getPageNumber(doc, doc.resolve($pos))
  }

  const { pos: pagePos } = getPageNodeAndPosition(doc, $pos)

  if (pagePos < 0) {
    console.log('Unable to find page node')
    return -1
  }

  const pageNodes = collectPageNodes(doc)
  const pageNode = pageNodes.findIndex((node) => node.pos === pagePos)

  return pageNode + (zeroIndexed ? 0 : 1)
}

/**
 * Retrieves a specific attribute of a given page number.
 * Falls back to defaults if the page number is invalid or the attribute is missing.
 *
 * @param state - The editor state.
 * @param pageNum - The page number to retrieve the attribute for.
 * @param defaultValue - The default value to return if the attribute is missing.
 * @param getNodeAttribute - A function to extract the attribute from the page node.
 * @returns {T} The attribute of the specified page or default.
 */
export const getPageAttributeByPageNum = <T>(
  state: EditorState,
  pageNum: number,
  defaultValue: T,
  getNodeAttribute: (node: PMNode) => Nullable<T>
): T => {
  if (!doesDocHavePageNodes(state)) {
    return defaultValue
  }

  const { doc } = state

  if (!isPageNumInRange(doc, pageNum)) {
    return handleOutOfRangePageNum(state, pageNum, (s, p) => getPageAttributeByPageNum(s, p, defaultValue, getNodeAttribute))
  }

  const pageNode = getPageNodeByPageNum(doc, pageNum)

  if (!pageNode) {
    return defaultValue
  }

  return getNodeAttribute(pageNode) ?? defaultValue
}
