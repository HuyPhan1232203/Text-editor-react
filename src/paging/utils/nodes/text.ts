/**
 * @file /src/utils/nodes/text.ts
 * @name Text
 * @description Utility functions for text nodes.
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import type { Nullable } from '../../types/record'
import type { NullableNodePos } from '../../types/node'
import { getParentNodePosOfType } from './node'

/**
 * Check if the given node is a text node.
 *
 * @param node - The node to check.
 * @returns {boolean} True if the node is a text node, false otherwise.
 */
export const isTextNode = (node: Nullable<PMNode>): boolean => {
  if (!node) {
    console.warn('No node provided')
    return false
  }

  return node.type.name === 'text'
}

/**
 * Check if the given position is at the start of the text node.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the start of the text node, false otherwise.
 */
export const isAtStartOfTextNode = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isAtStartOfTextNode(doc, doc.resolve($pos))
  }

  const { pos: textPos, node: textNode } = getTextNodeAndPosition(doc, $pos)

  if (!textNode) {
    return false
  }

  return $pos.pos === textPos
}

/**
 * Check if the given position is at the end of the text node.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the position is at the end of the text node, false otherwise.
 */
export const isAtEndOfTextNode = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isAtEndOfTextNode(doc, doc.resolve($pos))
  }

  const { pos: textPos, node: textNode } = getTextNodeAndPosition(doc, $pos)

  if (!textNode) {
    return false
  }

  return $pos.pos + 1 === textPos + textNode.nodeSize
}

/**
 * Get the position of the text node.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The position of the text node.
 */
export const getThisTextNodePosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  return getParentNodePosOfType(doc, pos, 'text').pos
}

/**
 * Get the text node and the position of the text node.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {NullableNodePos} The text node and the position of the text node.
 */
export const getTextNodeAndPosition = (doc: PMNode, pos: ResolvedPos | number): NullableNodePos => {
  if (typeof pos === 'number') {
    return getTextNodeAndPosition(doc, doc.resolve(pos))
  }

  const textPos = getThisTextNodePosition(doc, pos)
  const textNode = doc.nodeAt(textPos)

  if (!isTextNode(textNode)) {
    console.warn('No text node found')
    return { pos: -1, node: textNode }
  }

  return { pos: textPos, node: textNode }
}

/**
 * Measure the width and height of a text node.
 *
 * @param text - The text content of the node.
 * @param computedStyles - The computed styles of the node.
 * @returns {DOMRect} The bounding rectangle of the text node.
 */
export const measureText = (text: string, computedStyles: CSSStyleDeclaration): DOMRect => {
  const span = document.createElement('span')

  span.textContent = text
  span.style.position = 'absolute'
  span.style.visibility = 'hidden'
  span.style.whiteSpace = 'nowrap'
  span.style.font = computedStyles.font
  span.style.letterSpacing = computedStyles.letterSpacing
  span.style.wordSpacing = computedStyles.wordSpacing
  span.style.lineHeight = computedStyles.lineHeight

  document.body.appendChild(span)

  const clientBoundingRect = span.getBoundingClientRect()

  document.body.removeChild(span)

  return clientBoundingRect
}

/**
 * Measure the cumulative width of each character in a text node.
 *
 * @param textContent - The text content of the node.
 * @param computedStyles - The computed styles of the node.
 * @returns {number[]} The cumulative width of each character in the text node.
 */
export const measureCumulativeTextWidths = (textContent: string, computedStyles: CSSStyleDeclaration): number[] => {
  const cumulativeWidths: number[] = []

  let cumulativeWidth = 0

  for (let i = 0; i < textContent.length; i++) {
    const char = textContent[i]
    const { width } = measureText(char, computedStyles)

    cumulativeWidth += width
    cumulativeWidths.push(cumulativeWidth)
  }

  return cumulativeWidths
}
