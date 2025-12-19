/**
 * @file /src/utils/paragraph.ts
 * @name Paragraph
 * @description Utility functions for paragraphs.
 */

import { Node as PMNode, ResolvedPos } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import type { Nullable } from '../../types/record'
import type { NullableNodePos } from '../../types/node'
import { getParentNodePosOfType, getPositionNodeType, isAtomNode, isNodeEmpty } from './node'
import { isPosAtEndOfDocument, isPosAtStartOfDocument } from './document'
import { binarySearch, findClosestIndex, inRange } from '../math'
import { getBodyAfterPos, getBodyBeforePos, getEndOfBodyPosition } from './body/bodyPosition'
import type { ParagraphLineInfo } from '../../types/paragraph'
import { isAtEndOfTextNode, isAtStartOfTextNode, measureCumulativeTextWidths, measureText } from './text'
import { isAtHardBreak } from './hardBreak'

/**
 * Check if the given node is a paragraph node.
 *
 * @param node - The node to check.
 * @returns {boolean} True if the node is a paragraph node, false otherwise.
 */
export const isParagraphNode = (node: Nullable<PMNode>): boolean => {
  if (!node) {
    console.warn('No node provided')
    return false
  }

  return node.type.name === 'paragraph'
}

/**
 * Get the type of the node at the specified position.
 *
 * @param $pos - The resolved position in the document.
 * @returns The type of the node at the specified position.
 */
export const isPositionWithinParagraph = ($pos: ResolvedPos): boolean => {
  return getPositionNodeType($pos) === 'paragraph'
}

/**
 * Get the start of the paragraph position.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The start position of the paragraph.
 */
export const getStartOfParagraphPosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  if (typeof pos === 'number') {
    return getStartOfParagraphPosition(doc, doc.resolve(pos))
  }

  const { pos: paragraphPos } = getParagraphNodeAndPosition(doc, pos)

  return paragraphPos
}

/**
 * Get the end of the paragraph position.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The end position of the paragraph.
 */
export const getEndOfParagraphPosition = (doc: PMNode, $pos: ResolvedPos | number): number => {
  if (typeof $pos === 'number') {
    return getEndOfParagraphPosition(doc, doc.resolve($pos))
  }

  const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

  if (!paragraphNode) {
    return paragraphPos
  }

  return paragraphPos + paragraphNode.content.size
}

/**
 * Get the previous paragraph node.
 *
 * @param doc - The document node.
 * @param pos - The position in the document.
 * @returns {NullableNodePos} The previous paragraph node or null if not found and position.
 */
export const getPreviousParagraph = (doc: PMNode, pos: number): NullableNodePos => {
  let prevParagraphPos = pos
  let prevParagraphNode = null

  while (prevParagraphNode === null && prevParagraphPos > 0) {
    prevParagraphPos -= 1
    const node = doc.nodeAt(prevParagraphPos)

    if (!node) {
      continue
    }

    if (isParagraphNode(node)) {
      prevParagraphNode = node
      // eslint-disable-next-line no-self-assign
      prevParagraphPos = prevParagraphPos
    }
  }

  if (!prevParagraphNode) {
    prevParagraphPos = -1
  }

  return { pos: prevParagraphPos, node: prevParagraphNode }
}

/**
 * Get the next paragraph node.
 *
 * @param doc - The document node.
 * @param pos - The position in the document.
 * @returns {NullableNodePos} The next paragraph node or null if not found and position.
 */
export const getNextParagraph = (doc: PMNode, pos: number): NullableNodePos => {
  const documentLength = doc.content.size
  let nextParagraphPos = pos
  let nextParagraphNode = null

  while (nextParagraphNode === null && nextParagraphPos < documentLength) {
    nextParagraphPos += 1
    const node = doc.nodeAt(nextParagraphPos)

    if (!node) {
      continue
    }

    if (isParagraphNode(node)) {
      nextParagraphNode = node
      // eslint-disable-next-line no-self-assign
      nextParagraphPos = nextParagraphPos
    }
  }

  if (!nextParagraphNode) {
    nextParagraphPos = -1
  }

  return { pos: nextParagraphPos, node: nextParagraphNode }
}

/**
 * Determine if the resolved position is at the start of a paragraph node.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document.
 * @returns {boolean} True if the position is at the start of a paragraph node, false otherwise.
 */
export const isAtStartOfParagraph = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isAtStartOfParagraph(doc, doc.resolve($pos))
  }

  const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

  if (!paragraphNode) {
    return false
  }

  // We allow for the cursor to be at the start of the paragraph node or the start of the first text child node.
  return inRange($pos.pos, paragraphPos, paragraphPos + 1)
}

/**
 * Determine if the resolved position is at the end of a paragraph node.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document.
 * @returns {boolean} True if the position is at the end of a paragraph node, false otherwise.
 */
export const isAtEndOfParagraph = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isAtEndOfParagraph(doc, doc.resolve($pos))
  }

  const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

  if (!paragraphNode) {
    return false
  }

  return $pos.pos + 1 === paragraphPos + paragraphNode.nodeSize
}

/**
 * Determine if the resolved position is at the start or end of a paragraph node.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document.
 * @returns {boolean} True if the position is at the start or end of a paragraph node, false otherwise.
 */
export const isAtStartOrEndOfParagraph = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  return isAtStartOfParagraph(doc, $pos) || isAtEndOfParagraph(doc, $pos)
}

/**
 * Determine if the previous paragraph is empty.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the previous paragraph is empty or does not exist, false otherwise.
 */
export const isPreviousParagraphEmpty = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isPreviousParagraphEmpty(doc, doc.resolve($pos))
  }

  const { node: prevParagraphNode } = getPreviousParagraph(doc, $pos.pos)

  if (!prevParagraphNode) {
    return false
  }

  return isNodeEmpty(prevParagraphNode)
}

/**
 * Determine if the next paragraph is empty.
 *
 * @param doc - The document node.
 * @param $pos - The resolved position in the document or the absolute position of the node.
 * @returns {boolean} True if the next paragraph is empty or does not exist, false otherwise.
 */
export const isNextParagraphEmpty = (doc: PMNode, $pos: ResolvedPos | number): boolean => {
  if (typeof $pos === 'number') {
    return isNextParagraphEmpty(doc, doc.resolve($pos))
  }

  const { node: nextParagraphNode } = getNextParagraph(doc, $pos.pos)

  if (!nextParagraphNode) {
    return false
  }

  return isNodeEmpty(nextParagraphNode)
}

/**
 * Get the paragraph node position.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {number} The position of the paragraph node.
 */
export const getThisParagraphNodePosition = (doc: PMNode, pos: ResolvedPos | number): number => {
  return getParentNodePosOfType(doc, pos, 'paragraph').pos
}

/**
 * Get the paragraph node position and the paragraph node itself.
 *
 * @param doc - The document node.
 * @param pos - The resolved position in the document or the absolute position of the node.
 * @returns {NullableNodePos} The position and the node or null if not found of the paragraph.
 */
export const getParagraphNodeAndPosition = (doc: PMNode, pos: ResolvedPos | number): NullableNodePos => {
  if (typeof pos === 'number') {
    return getParagraphNodeAndPosition(doc, doc.resolve(pos))
  }

  if (isPosAtStartOfDocument(doc, pos, false)) {
    return getNextParagraph(doc, pos.pos)
  } else if (isPosAtEndOfDocument(doc, pos)) {
    return getPreviousParagraph(doc, pos.pos)
  }

  const paragraphPos = getThisParagraphNodePosition(doc, pos)
  const paragraphNode = doc.nodeAt(paragraphPos)

  if (!isParagraphNode(paragraphNode)) {
    console.warn('No paragraph node found')
    return { pos: -1, node: paragraphNode }
  }

  return { pos: paragraphPos, node: paragraphNode }
}

/**
 * Gets the previous page's past body paragraph and position, if any, before the given position.
 * @param doc - The current document.
 * @param pos - Any position within the current page's body
 * @returns {NullableNodePos} The previous page body's last paragraph and position, if any.
 */
export const getLastParagraphInPreviousPageBodyBeforePos = (doc: PMNode, pos: ResolvedPos | number): NullableNodePos => {
  const previousPageBody = getBodyBeforePos(doc, pos)

  if (!previousPageBody.node) {
    return previousPageBody
  }

  const endOfPrevPgBodyPos = getEndOfBodyPosition(doc, previousPageBody.pos)

  return getPreviousParagraph(doc, endOfPrevPgBodyPos)
}

/**
 * Gets the next page's first body paragraph and positiom, if any, after the given position.
 * @param doc - The current document.
 * @param pos - Any position within the current page's body
 * @returns {NullableNodePos} The next page body's first paragraph and position, if any.
 */
export const getFirstParagraphInNextPageBodyAfterPos = (doc: PMNode, pos: ResolvedPos | number): NullableNodePos => {
  const nextPageBody = getBodyAfterPos(doc, pos)

  if (!nextPageBody.node) {
    return nextPageBody
  }

  return getNextParagraph(doc, nextPageBody.pos)
}

/**
 * Get the paragraph DOM node.
 *
 * @param view - The editor view.
 * @param paragraphPos - The position of the paragraph in the document.
 * @returns {Node} The paragraph DOM node.
 */
const getParagraphDOMNode = (view: EditorView, paragraphPos: number): Nullable<HTMLElement> => {
  // DOM nodes are offsetted by 1 for some reason.
  const paragraphTextPos = paragraphPos + 1

  return (view.domAtPos(paragraphTextPos).node as HTMLElement) ?? null
}

/**
 * Measure the widths of each character in a paragraph.
 *
 * @param pDOMNode - The paragraph DOM node.
 * @returns {number[]} An array of character widths.
 */
const measureTextWidths = (pDOMNode: HTMLElement): number[] => {
  const charWidths: number[] = []

  const textContent = pDOMNode.textContent || ''
  const computedStyles = getComputedStyle(pDOMNode)

  for (let i = 0; i < textContent.length; i++) {
    const char = textContent[i]
    const { width } = measureText(char, computedStyles)

    charWidths.push(width)
  }

  return charWidths
}

/**
 * Measure the width of the text up to a given offset in a paragraph.
 *
 * @param pDOMNode - The paragraph DOM node.
 * @param offset - The offset within the paragraph.
 * @param lineNumber - The line number within the paragraph.
 * @param lineBreakOffsets - The offsets where line breaks occur.
 * @returns {number} The width of the text up to the offset.
 */
export const getTextWidthUpToOffsetInLine = (
  pDOMNode: HTMLElement,
  offset: number,
  lineNumber: number,
  lineBreakOffsets: number[]
): number => {
  const textUpToOffset = pDOMNode.textContent?.slice(lineBreakOffsets[lineNumber], offset) || ''
  const computedStyles = getComputedStyle(pDOMNode)
  const { width } = measureText(textUpToOffset, computedStyles)

  return width
}

/**
 * Get the offset within a line given the offset in the paragraph and line number.
 *
 * @param offset - The offset within the paragraph.
 * @param lineNumber - The line number within the paragraph.
 * @param lineBreakOffsets - The offsets where line breaks occur.
 * @returns {number} The offset within the line.
 */
const getOffsetInLine = (offset: number, lineNumber: number, lineBreakOffsets: number[]): number => {
  if (lineNumber === 0) {
    return offset
  }

  return offset - lineBreakOffsets[lineNumber]
}

export const getOffsetForDistanceInLine = (
  view: EditorView,
  pos: ResolvedPos | number,
  lineNumber: number,
  targetDistance: number
): number => {
  const pDOMNode = getPDOMNodeFromPos(view, pos)

  if (!pDOMNode) return 0

  const lineBreakOffsets = getParagraphLineBreakOffsets(view, pDOMNode)
  const thisLineOffset = lineBreakOffsets[lineNumber]
  const nextLineOffset = lineBreakOffsets[lineNumber + 1]
  const textContent = pDOMNode.textContent?.slice(thisLineOffset, nextLineOffset) || ''

  const computedStyles = getComputedStyle(pDOMNode)
  const charWidths = measureCumulativeTextWidths(textContent, computedStyles)

  const closestIndex = findClosestIndex(charWidths, targetDistance)

  return thisLineOffset + closestIndex + 1
}

/**
 * Measure the widths of each line in a paragraph.
 *
 * @param pDOMNode - The paragraph DOM node.
 * @returns {number[]} An array of line widths.
 */
export const measureParagraphLineWidths = (pDOMNode: HTMLElement): number[] => {
  const range = document.createRange()

  range.selectNodeContents(pDOMNode)
  const rects = range.getClientRects()

  const lines: number[] = []
  let currentLineWidths: number[] = []
  let cumulativeLineLeft: number = rects[0]?.left || 0
  let cumulativeLineTop: number = rects[0]?.top || 0
  let prevLineRight: number = 0

  const addNewLine = (width?: number) => {
    lines.push(currentLineWidths.reduce((acc, width) => acc + width, 0))
    if (width) {
      currentLineWidths = [width]
    }
  }

  Array.from(rects).forEach((rect, index) => {
    if (index === 0) {
      // First line
      currentLineWidths.push(rect.width)
    } else {
      if (rect.left === prevLineRight) {
        // Next element in line
        currentLineWidths.push(rect.width)
      } else if (rect.left === cumulativeLineLeft && rect.top > cumulativeLineTop) {
        // New Line
        addNewLine(rect.width)
      } else if (rect.left >= cumulativeLineLeft) {
        // Skip
      } else {
        // New Line
        addNewLine(rect.width)
      }
    }

    cumulativeLineLeft = rect.left
    cumulativeLineTop = rect.top
    prevLineRight = rect.right
  })

  if (currentLineWidths.length > 0) {
    // Add the last line
    addNewLine()
  }

  return lines
}

/**
 * Get offsets where explicit and soft line breaks occur in a paragraph.
 *
 * @param pDOMNode - The paragraph DOM node.
 * @returns {number[]} An array of offsets where line breaks occur.
 */
const getParagraphLineBreakOffsets = (view: EditorView, pDOMNode: HTMLElement): number[] => {
  const charWidths = measureTextWidths(pDOMNode)
  const lineWidths = measureParagraphLineWidths(pDOMNode)

  const offsets: number[] = [0]
  let cumulativeWidth = 0
  let rectIndex = 0
  let charIndex = 0

  const sumTextNodes = (node: HTMLElement): void => {
    const isBr = node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR'

    if (isBr && offsets[offsets.length - 1] !== charIndex) {
      offsets.push(charIndex)
      rectIndex++
      cumulativeWidth = 0
    } else if (isAtomNode(view, node)) {
      // Atom nodes are treated as a single character
      charIndex += 1
    } else if (node.nodeType === Node.TEXT_NODE) {
      const nodeTextContent = node.textContent || ''

      for (let i = 0; i < nodeTextContent.length; i++) {
        charIndex += 1
        cumulativeWidth += charWidths[charIndex] || 0

        if (cumulativeWidth > lineWidths[rectIndex]) {
          offsets.push(charIndex)
          rectIndex++
          cumulativeWidth = 0
        }
      }
    } else {
      // Recursively call for nested elements
      const nestedChildren = (node as HTMLElement).childNodes

      Array.from(nestedChildren).forEach((childNode) => {
        sumTextNodes(childNode as HTMLElement)
      })
    }
  }

  sumTextNodes(pDOMNode)

  return offsets
}

/**
 * Get the line number for a given position within a paragraph using binary search.
 *
 * @param lineBreakOffsets - The offsets where line breaks occur.
 * @param offset - The position within the paragraph.
 * @returns {number} The line number of the position (0-indexed).
 */
const getLineNumberForPosition = (lineBreakOffsets: number[], offset: number): number => {
  const compareOffsets = (a: number, b: number): number => a - b

  return binarySearch(lineBreakOffsets, offset, compareOffsets)
}

const getPDOMNodeFromPos = (view: EditorView, pos: ResolvedPos | number): Nullable<HTMLElement> => {
  if (typeof pos !== 'number') {
    pos = pos.pos
  }

  const paragraphPos = getThisParagraphNodePosition(view.state.doc, pos)

  return getParagraphDOMNode(view, paragraphPos)
}

/**
 * Helper function to calculate the total length of text content in an element.
 * It will recursively sum the lengths of all text nodes within the element.
 *
 * @param elementNode - The DOM element node (e.g., <code>, <span>).
 * @returns {number} - The total length of text content inside the element.
 */
const getTextLengthFromElement = (view: EditorView, elementNode: HTMLElement, end?: number): number => {
  let totalLength = 0

  // Traverse all child nodes and sum the lengths of text nodes
  Array.from(elementNode.childNodes)
    .slice(0, end)
    .forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        totalLength += (childNode as Text).length
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        if (isAtomNode(view, childNode)) {
          // Atom nodes are treated as a single character
          totalLength += 1
        } else {
          // Recursively call for nested elements
          totalLength += getTextLengthFromElement(view, childNode as HTMLElement)
        }
      }
    })

  return totalLength
}

/**
 * Calculate the paragraph end offset based on the position. Used to correct
 * getting the right DOM node when the position is at the start or end of a paragraph / text node.
 * @param view - The editor view.
 * @param pos - The [resolved] position in the document.
 * @returns {number} The paragraph end offset.
 */
const calculateParagraphEndOffset = (view: EditorView, pos: ResolvedPos | number): number => {
  const { doc } = view.state

  if (isAtStartOfParagraph(doc, pos) || isAtStartOfTextNode(doc, pos)) {
    return 1
  } else if (isAtEndOfParagraph(doc, pos) || isAtEndOfTextNode(doc, pos) || isAtHardBreak(doc, pos)) {
    return -1
  } else {
    return 0
  }
}

/**
 * Given a paragraph position and position within said paragraph, return the number of
 * lines in the paragraph and the line number of the position.
 *
 * @param view - The editor view.
 * @param pos - The [resolved] position in the document.
 * @returns {ParagraphLineInfo} The number of lines in the paragraph and the
 * line number of the position (0-indexed).
 */
export const getParagraphLineInfo = (view: EditorView, pos: ResolvedPos | number): ParagraphLineInfo => {
  if (typeof pos !== 'number') {
    pos = pos.pos
  }

  const returnDefaultLineInfo = (): ParagraphLineInfo => ({
    lineCount: 0,
    lineBreakOffsets: [0],
    lineNumber: 0,
    offsetInLine: 0,
    offsetDistance: 0
  })

  const pDOMNode = getPDOMNodeFromPos(view, pos)

  if (!pDOMNode) return returnDefaultLineInfo()

  const lineBreakOffsets = getParagraphLineBreakOffsets(view, pDOMNode)
  const lineCount = lineBreakOffsets.length

  const paragraphEndOffset = calculateParagraphEndOffset(view, pos)
  let { offset } = view.domAtPos(pos + paragraphEndOffset)
  const { node: paragraphNode, offset: paragraphOffset } = view.domAtPos(pos - offset + paragraphEndOffset)

  const previousOffset = getTextLengthFromElement(view, paragraphNode as HTMLElement, paragraphOffset)

  offset += previousOffset
  const lineNumber = getLineNumberForPosition(lineBreakOffsets, offset)

  offset -= paragraphEndOffset

  const offsetInLine = getOffsetInLine(offset, lineNumber, lineBreakOffsets)
  const offsetDistance = getTextWidthUpToOffsetInLine(pDOMNode, offset, lineNumber, lineBreakOffsets)

  return { lineCount, lineBreakOffsets, lineNumber, offsetInLine, offsetDistance }
}

/**
 * Checks if the position is at the first line of the paragraph.
 *
 * @param view - The editor view.
 * @param $pos - The [resolved] position in the document.
 * @returns {boolean} True if the position is at the first line of the paragraph, false otherwise.
 */
export const isPosAtFirstLineOfParagraph = (
  view: EditorView,
  $pos: ResolvedPos | number
): { isAtFirstLine: boolean } & ParagraphLineInfo => {
  const { lineNumber, ...otherLineInfo } = getParagraphLineInfo(view, $pos)
  const isAtFirstLine = lineNumber === 0

  return { isAtFirstLine, lineNumber, ...otherLineInfo }
}

/**
 * Checks if the position is at the last line of the paragraph.
 *
 * @param view - The editor view.
 * @param $pos - The [resolved] position in the document.
 * @returns {boolean} True if the position is at the last line of the paragraph, false otherwise.
 */
export const isPosAtLastLineOfParagraph = (view: EditorView, $pos: ResolvedPos | number): { isAtLastLine: boolean } & ParagraphLineInfo => {
  const { lineCount, lineNumber, ...otherLineInfo } = getParagraphLineInfo(view, $pos)
  const isAtLastLine = lineNumber + 1 === lineCount

  return { isAtLastLine, lineCount, lineNumber, ...otherLineInfo }
}
