/**
 * @file /src/utils/pageRegion/getAttributes.ts
 * @name GetAttributes
 * @description Utility functions for getting page region attributes.
 */

import { Node as PMNode } from '@tiptap/pm/model'
import type { PageRegion } from '../../types/pageRegions'
import type { Nullable } from '../../types/record'
import type { NullableNodePos } from '../../types/node'
import { doesDocHavePageNodes } from '../nodes/page/page'
import { getHeaderFooterNodeType, isHeaderFooterNode } from '../nodes/headerFooter/headerFooter'
import { isBodyNode } from '../nodes/body/body'
import { getPageNodeByPageNum } from '../nodes/page/pageNumber'
import { isPageNumInRange, handleOutOfRangePageNum } from '../nodes/page/pageRange'
import { EditorState } from '@tiptap/pm/state'

/**
 * Get the page region node of the current page by the page region type.
 *
 * @param pageNode - The page node to search for the neighbouring page region.
 * @param regionType - The type of the page region to search for.
 * @returns {Nullable<PMNode>} The neighbouring page region node or null if not found.
 */
export const getPageRegionNode = (pageNode: PMNode, regionType: PageRegion): Nullable<PMNode> => {
  let pageRegionNode: Nullable<PMNode> = null

  pageNode.forEach((node) => {
    if (isHeaderFooterNode(node)) {
      if (getHeaderFooterNodeType(node) === regionType) {
        pageRegionNode = node
      }
    } else if (isBodyNode(node)) {
      if (node.type.name === regionType) {
        pageRegionNode = node
      }
    }
  })

  return pageRegionNode
}

/**
 * Get the page region node and position of the current page by the page region type.
 *
 * @param pagePos - The position of the page node to search for the neighbouring page region.
 * @param pageNode - The page node to search for the neighbouring page region.
 * @param regionType - The type of the page region to search for.
 * @returns {NullableNodePos} The neighbouring page region node and position or null if not found.
 */
export const getPageRegionNodeAndPos = (pagePos: number, pageNode: PMNode, regionType: PageRegion): NullableNodePos => {
  let pageRegionNode: Nullable<PMNode> = null
  let pos = pagePos

  if (!pageNode) {
    return { node: null, pos: -1 }
  }

  pageNode.forEach((node, offset) => {
    if (!pageRegionNode) {
      if (isHeaderFooterNode(node)) {
        if (getHeaderFooterNodeType(node) === regionType) {
          pageRegionNode = node
          pos += offset + 1
        }
      } else if (isBodyNode(node)) {
        if (node.type.name === regionType) {
          pageRegionNode = node
          pos += offset + 1
        }
      }
    }
  })

  return { node: pageRegionNode, pos: pageRegionNode ? pos : -1 }
}

/**
 * Retrieves a specific attribute of a the body node of specified type of a given page number.
 * Falls back to the default value if the page number is invalid or the attribute is missing.
 *
 * @param state - The editor state.
 * @param pageNum - The page number to retrieve the attribute for.
 * @param regionType - The type of the region to retrieve the attribute for.
 * @param defaultValue - The default value to return if the attribute is missing.
 * @param getNodeAttribute - A function to retrieve the attribute from a body node.
 * @returns {T} The attribute of the specified body node or default.
 */
export const getPageRegionAttributeByPageNum = <T>(
  state: EditorState,
  pageNum: number,
  regionType: PageRegion,
  defaultValue: T,
  getNodeAttribute: (node: PMNode) => Nullable<T>
): T => {
  if (!doesDocHavePageNodes(state)) {
    return defaultValue
  }

  const { doc } = state

  if (!isPageNumInRange(doc, pageNum)) {
    return handleOutOfRangePageNum(state, pageNum, (s, p) =>
      getPageRegionAttributeByPageNum(s, p, regionType, defaultValue, getNodeAttribute)
    )
  }

  const pageNode = getPageNodeByPageNum(doc, pageNum)

  if (!pageNode) {
    return defaultValue
  }

  const pageRegionNode = getPageRegionNode(pageNode, regionType)

  if (!pageRegionNode) {
    return defaultValue
  }

  return getNodeAttribute(pageRegionNode) ?? defaultValue
}
