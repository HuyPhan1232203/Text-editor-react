/**
 * @file /src/utils/page.ts
 * @name Page
 * @description Utility functions for page nodes in the editor.
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { PAGE_NODE_NAME } from '../../../constants/page'
import type { NodePosArray, NullableNodePos } from '../../../types/node'
import type { Nullable } from '../../../types/record'
import { getParentNodePosOfType } from '../node'
import { BODY_NODE_NAME } from '../../../constants/body'
import { HEADER_FOOTER_NODE_NAME } from '../../../constants/pageRegions'

/**
 * Check if the given node is a page node.
 *
 * @param node - The node to check.
 * @returns {boolean} True if the node is a page node, false otherwise.
 */
export const isPageNode = (node: Nullable<PMNode>): boolean => {
  if (!node) {
    console.warn('No node provided')
    return false
  }

  return node.type.name === PAGE_NODE_NAME
}

/**
 * Check if the document has page nodes.
 *
 * @param state - The editor state.
 * @returns {boolean} True if the document has page nodes, false otherwise.
 */
export const doesDocHavePageNodes = (state: EditorState): boolean => {
  const { schema } = state
  const pageType = schema.nodes.page

  let hasPageNodes = false

  state.doc.forEach((node) => {
    if (node.type === pageType) {
      hasPageNodes = true
      return false
    }
  })

  return hasPageNodes
}

/**
 * Collect page nodes and their positions in the document.
 *
 * @param doc - The document node.
 * @returns {NodePosArray} A map of page positions to page nodes.
 */
export const collectPageNodes = (doc: PMNode): NodePosArray => {
  const pageNodes: NodePosArray = []

  doc.forEach((node, offset) => {
    if (isPageNode(node)) {
      pageNodes.push({ node, pos: offset })
    }
  })

  return pageNodes
}

/**
 * Given a position in the document, get the child node of the page node at that position.
 * I.e. that will be a header/footer node or a body node.
 * @param doc - The document node.
 * @param $pos - The resolved position in the document.
 * @returns {NullableNodePos} The child node position of the page node at the given position.
 */
export const getPageChildNodePosFromPosition = (doc: PMNode, $pos: ResolvedPos | number): NullableNodePos => {
  if (typeof $pos === 'number') {
    return getPageChildNodePosFromPosition(doc, doc.resolve($pos))
  }

  const pageChildPos = getParentNodePosOfType(doc, $pos, [BODY_NODE_NAME, HEADER_FOOTER_NODE_NAME])
  const pageChildNode = doc.nodeAt(pageChildPos.pos)

  if (!pageChildNode) {
    console.warn('No page child node found')
    return { pos: -1, node: pageChildNode }
  }

  return { pos: pageChildPos.pos, node: pageChildNode }
}
