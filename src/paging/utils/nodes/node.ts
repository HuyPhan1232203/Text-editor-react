/**
 * @file /src/utils/node.ts
 * @name Node
 * @description Utility functions for creating custom nodes in the editor.
 */

import type { Node as PMNode, ResolvedPos, TagParseRule } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state'
import { parseHTMLNodeGetAttrs } from '../attributes/getAttributes'
import { EditorView } from '@tiptap/pm/view'
import type { Nullable, Undefinable } from '../../types/record'

/**
 * Get the type of the node at the specified position.
 *
 * @param $pos - The resolved position in the document.
 * @returns {ResolvedPos} The type of the node at the specified position.
 */
export const getPositionNodeType = ($pos: ResolvedPos): string => {
  return $pos.parent.type.name
}

/**
 * Retrieves the size of a ProseMirror node if it is defined, otherwise returns 0.
 *
 * @param node - The ProseMirror node which may be undefined.
 * @returns The size of the node if it is defined, otherwise 0.
 */
export const getMaybeNodeSize = (node: Undefinable<PMNode>): number => {
  return node?.nodeSize ?? 0
}

/**
 * Check if the node type matches the specified type.
 *
 * @param node - The node to check.
 * @param type - The type of the node to match. Can be string or an array of strings.
 * @returns {boolean} True if the node type matches, false otherwise.
 */
const doesNodeTypeMatch = (node: Nullable<PMNode>, type: string | string[]): boolean => {
  if (!node) {
    return false
  }

  const nodeTypeName = node.type.name

  if (Array.isArray(type)) {
    return type.includes(nodeTypeName)
  }
  return nodeTypeName === type
}

/**
 * Get the parent node position of the specified type.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @param type - The type of the node to search for. Can be string or an array of strings.
 * @returns {ResolvedPos} The position of the parent node of the specified type.
 */
export const getParentNodePosOfType = (
  doc: PMNode, $pos: ResolvedPos | number, type: string | string[]): ResolvedPos => {
  // Base case: If the position is a number, resolve it
  if (typeof $pos !== 'number') {
    const thisNode = doc.nodeAt($pos.pos)

    if (thisNode) {
      if (doesNodeTypeMatch(thisNode, type)) {
        return $pos
      }
    }

    if ($pos.pos === 0) {
      // We have not found the node of the specified type
      console.error(`Could not find node of type ${type}`)
      return $pos
    }

    try {
      return getParentNodePosOfType(doc, $pos.before(), type)
    } catch (error) {
      console.log(error)
      return getParentNodePosOfType(doc, doc.resolve($pos.pos - 1), type)
    }
  }

  const thisPos = doc.resolve($pos)

  // Base case: If the node at the position is of the specified type, return the position
  if (doesNodeTypeMatch(doc.nodeAt($pos), type)) {
    return thisPos
  }

  if ($pos === 0) {
    // We have not found the node of the specified type
    console.error(`Could not find node of type ${type}`)
    return thisPos
  }

  // Recursive case: Move one level up and check again
  const prevPos = thisPos.before()

  return getParentNodePosOfType(doc, prevPos, type)
}

/**
 * Append the new node to the existing node and replace the existing node with the new node.
 *
 * @param tr - The current transaction.
 * @param pos - The position to replace the node at.
 * @param existingNode - The existing node to replace.
 * @param newNode - The new node to append and replace with.
 * @returns {void}
 */
export const appendAndReplaceNode = (tr: Transaction, pos: number, existingNode: PMNode, newNode: PMNode): void => {
  const newContent = existingNode.content.append(newNode.content)

  tr.replaceWith(pos, pos + existingNode.nodeSize - 1, newContent)
}

/**
 * Delete the node at the specified position.
 *
 * @param tr - The current transaction.
 * @param pos - The position of the node to delete.
 * @param node - The node to delete.
 * @returns {void}
 */
export const deleteNode = (tr: Transaction, pos: number, node: PMNode): void => {
  tr.delete(pos, pos + node.nodeSize)
}

/**
 * Check if the node is empty.
 *
 * @param node - The node to check.
 * @returns {boolean} True if the node is empty, false otherwise.
 */
export const isNodeEmpty = (node: PMNode): boolean => {
  return node.content.size === 0
}

/**
 * A rule that matches a node based on the specified tag and attribute.
 *
 * @param baseElement - The base element to match.
 * @param nodeTagAttribute - The attribute of the node tag.
 * @param preventNestedNodes - True if nested nodes should be prevented, false otherwise.
 * @returns {TagParseRule} The rule that matches the node based on the specified tag and attribute.
 */
export const parseHTMLNode = (
  baseElement: string, nodeTagAttribute: string, preventNestedNodes: boolean): TagParseRule => ({
  tag: `${baseElement}[${nodeTagAttribute}]`,
  getAttrs: parseHTMLNodeGetAttrs(nodeTagAttribute, preventNestedNodes)
})

/**
 * Check if the given node is atomic.
 *
 * @param node - The node to check.
 * @returns {boolean} True if the node is a text node, false otherwise.
 */
export const isAtomNode = (view: EditorView, node: Node): boolean => {
  const pos = view.posAtDOM(node, 0)
  const pmNode = view.state.doc.nodeAt(pos)

  return !!(pmNode && pmNode.type.spec.atom)
}
