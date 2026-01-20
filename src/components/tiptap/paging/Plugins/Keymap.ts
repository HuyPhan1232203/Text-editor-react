/**
 * @file /src/Plugins/Keymap.ts
 * @name Keymap
 * @description Custom plugin for handling keymaps for page navigation.
 */

import { keymap } from '@tiptap/pm/keymap'
import {
  getResolvedPosition,
  isHighlighting,
  moveToNearestTextSelection,
  moveToNextTextBlock,
  moveToPreviousTextBlock,
  moveToThisTextBlock,
  setSelection,
  setSelectionAtPos,
  setSelectionToEndOfParagraph,
  setSelectionToParagraph,
  setSelectionToStartOfParagraph
} from '../utils/selection'

import {
  getFirstParagraphInNextPageBodyAfterPos,
  getLastParagraphInPreviousPageBodyBeforePos,
  getOffsetForDistanceInLine,
  getParagraphLineInfo,
  getParagraphNodeAndPosition,
  isAtStartOrEndOfParagraph,
  isParagraphNode,
  isPosAtFirstLineOfParagraph,
  isPosAtLastLineOfParagraph,
  isPositionWithinParagraph
} from '../utils/nodes/paragraph'
import { isNodeEmpty } from '@tiptap/core'
import { appendAndReplaceNode, deleteNode } from '../utils/nodes/node'
import { isPageNode } from '../utils/nodes/page/page'
import {
  isPosAtStartOfDocumentBody,
  isPosAtEndOfBody,
  isPosAtFirstChildOfBody,
  isPosAtLastChildOfBody,
  isPosAtStartOfBody
} from '../utils/nodes/body/bodyCondition'
import { getPageNodeAndPosition } from '../utils/nodes/page/pagePosition'
import { isTextNode } from '../utils/nodes/text'
import {
  isPosAtEndOfPageAmendment,
  isPosAtFirstChildOfPageAmendment,
  isPosAtLastChildOfPageAmendment,
  isPosAtStartOfPageAmendment
} from '../utils/nodes/headerFooter/headerFooterCondition'

const KeymapPlugin = keymap({
  ArrowLeft: (state, dispatch) => {
    if (!dispatch) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtStartOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    if (!isPosAtStartOfBody(doc, $pos)) {
      return false
    }

    const thisPos = $pos.pos
    const expectedTextNodePos = thisPos - 1
    const thisTextNode = doc.nodeAt(expectedTextNodePos)

    if (!thisTextNode) {
      return false
    }

    const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      return false
    }

    if (!isParagraphNode(thisTextNode) && !isTextNode(thisTextNode)) {
      return false
    }

    const { pos: previousParagraphPos, node: previousParagraphNode } = getLastParagraphInPreviousPageBodyBeforePos(doc, paragraphPos)

    if (!previousParagraphNode) {
      // Handle to prevent cursor moving to header
      return true
    }

    setSelectionToEndOfParagraph(
      tr,
      previousParagraphPos,
      previousParagraphNode
    )

    dispatch(tr)
    return true
  },
  ArrowRight: (state, dispatch) => {
    if (!dispatch) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtEndOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    if (!isPosAtEndOfBody(doc, $pos)) {
      return false
    }

    const thisPos = $pos.pos
    const expectedTextNodePos = thisPos - 1
    const thisTextNode = doc.nodeAt(expectedTextNodePos)

    if (!thisTextNode) {
      return false
    }

    const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      return false
    }

    if (!isParagraphNode(thisTextNode) && !isTextNode(thisTextNode)) {
      return false
    }

    const { pos: nextParagraphPos, node: nextParagraphNode } = getFirstParagraphInNextPageBodyAfterPos(doc, paragraphPos)

    if (!nextParagraphNode) {
      // Handle to prevent cursor moving to footer
      return true
    }

    const newSelection = moveToThisTextBlock(tr, nextParagraphPos)

    setSelection(tr, newSelection)

    dispatch(tr)
    return true
  },
  ArrowUp: (state, dispatch, view) => {
    if (!dispatch || !view) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtFirstChildOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    if (!isPosAtFirstChildOfBody(doc, $pos)) {
      return false
    }

    const thisPos = $pos.pos
    const { isAtFirstLine, offsetDistance } = isPosAtFirstLineOfParagraph(
      view,
      $pos
    )

    if (!isAtFirstLine) {
      return false
    }

    const expectedTextNodePos = thisPos - 1
    const thisTextNode = doc.nodeAt(expectedTextNodePos)

    if (!thisTextNode) {
      console.warn('No node found at position', expectedTextNodePos)
      return false
    }

    const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      console.warn('No current paragraph node found')
      return false
    }

    if (!isParagraphNode(thisTextNode) && !isTextNode(thisTextNode)) {
      console.warn(
        'Unexpected node type found at position',
        expectedTextNodePos
      )
      return false
    }

    const { pos: previousParagraphPos, node: previousParagraphNode } = getLastParagraphInPreviousPageBodyBeforePos(doc, paragraphPos)

    if (!previousParagraphNode) {
      if (!isPosAtStartOfBody(doc, $pos)) {
        // Move to the start of the current paragraph
        setSelectionToStartOfParagraph(tr, paragraphPos, paragraphNode)
        dispatch(tr)
      } else {
        // Handle to prevent cursor moving to header
      }

      return true
    }

    const { lineCount: prevParLineCount } = getParagraphLineInfo(
      view,
      previousParagraphPos
    )
    const prevParagraphLastLineNum = prevParLineCount - 1
    const cursorOffset = getOffsetForDistanceInLine(
      view,
      previousParagraphPos,
      prevParagraphLastLineNum,
      offsetDistance
    ) + 1

    setSelectionToParagraph(
      tr,
      previousParagraphPos,
      previousParagraphNode,
      cursorOffset
    )

    dispatch(tr)
    return true
  },
  ArrowDown: (state, dispatch, view) => {
    if (!dispatch || !view) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtLastChildOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    if (!isPosAtLastChildOfBody(doc, $pos)) {
      return false
    }

    const thisPos = $pos.pos
    const { isAtLastLine, offsetDistance } = isPosAtLastLineOfParagraph(
      view,
      $pos
    )

    if (!isAtLastLine) {
      return false
    }

    const expectedTextNodePos = thisPos - 1
    const thisTextNode = doc.nodeAt(expectedTextNodePos)

    if (!thisTextNode) {
      console.warn('No node found at position', expectedTextNodePos)
      return false
    }

    const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      console.warn('No current paragraph node found')
      return false
    }

    if (!isParagraphNode(thisTextNode) && !isTextNode(thisTextNode)) {
      console.warn(
        'Unexpected node type found at position',
        expectedTextNodePos
      )
      return false
    }

    const { pos: nextParagraphPos, node: nextParagraphNode } = getFirstParagraphInNextPageBodyAfterPos(doc, paragraphPos)

    if (!nextParagraphNode) {
      if (!isPosAtEndOfBody(doc, $pos)) {
        // Move to the end of the current paragraph
        setSelectionToEndOfParagraph(tr, paragraphPos, paragraphNode)
        dispatch(tr)
      } else {
        // Handle to prevent cursor moving to footer
      }

      return true
    }

    const cursorOffset = getOffsetForDistanceInLine(view, nextParagraphPos, 0, offsetDistance) + 1
    const newSelection = moveToThisTextBlock(
      tr,
      nextParagraphPos,
      undefined,
      cursorOffset
    )

    setSelection(tr, newSelection)

    dispatch(tr)
    return true
  },
  Enter: (state, dispatch) => {
    if (!dispatch) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr, schema, selection } = state
    const { from } = selection
    const $pos = getResolvedPosition(state)

    // Ensure that the position is within a valid block (paragraph)
    if (!isPositionWithinParagraph($pos)) {
      return false
    }

    const { node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      return false
    }

    // Create a new empty paragraph node
    const newParagraph = schema.nodes.paragraph.create()

    if (isNodeEmpty(paragraphNode)) {
      tr.insert(from, newParagraph)
    } else {
      if (isAtStartOrEndOfParagraph(doc, $pos)) {
        tr.replaceSelectionWith(newParagraph)
      } else {
        const remainingContent = paragraphNode.content.cut($pos.parentOffset)
        const newContentParagraph = schema.nodes.paragraph.create(
          {},
          remainingContent
        )

        tr.replaceWith(
          $pos.pos,
          $pos.pos + remainingContent.size,
          newContentParagraph
        )
      }
    }

    const newSelection = moveToNextTextBlock(tr, from)

    setSelection(tr, newSelection)
    dispatch(tr)
    return true
  },
  Backspace: (state, dispatch) => {
    if (!dispatch) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr, schema } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtStartOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    // Ensure that the position is within a valid block (paragraph)
    if (!isPositionWithinParagraph($pos)) {
      return false
    }

    const thisPos = $pos.pos

    if (isPosAtEndOfBody(doc, $pos)) {
      const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

      if (!paragraphNode) {
        console.warn('No current paragraph node found')
        return false
      }

      if (isNodeEmpty(paragraphNode)) {
        deleteNode(tr, paragraphPos, paragraphNode)
        const selection = moveToPreviousTextBlock(tr, paragraphPos)

        setSelection(tr, selection)
      } else {
        // Remove the last character from the current paragraph
        const newContent = paragraphNode.content.cut(
          0,
          paragraphNode.content.size - 1
        )
        const newParagraph = schema.nodes.paragraph.create({}, newContent)

        tr.replaceWith(
          paragraphPos,
          paragraphPos + paragraphNode.nodeSize,
          newParagraph
        )
        setSelectionAtPos(tr, thisPos - 1)
      }
    } else if (isPosAtStartOfDocumentBody(doc, $pos, true)) {
      // Prevent deleting the first page node
      return true
    } else if (!isPosAtStartOfBody(doc, $pos)) {
      return false
    } else {
      const { node: thisPageNode, pos: thisPagePos } = getPageNodeAndPosition(
        doc,
        $pos
      )

      if (!thisPageNode) {
        return false
      }

      if (!isPosAtStartOfBody(doc, thisPos)) {
        return false
      }

      const prevPageChild = doc.childBefore(thisPagePos)
      const prevPageNode = prevPageChild.node

      // Confirm that the previous node is a page node
      if (!prevPageNode) {
        // Start of document
        return false
      }

      if (!isPageNode(prevPageNode)) {
        return false
      }

      // Append the content of the current paragraph to the end of the previous paragraph
      const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

      if (!paragraphNode) {
        console.warn('No current paragraph node found')
        return false
      }

      const { pos: previousParagraphPos, node: previousParagraphNode } = getLastParagraphInPreviousPageBodyBeforePos(doc, paragraphPos)

      if (!previousParagraphNode) {
        // Handle to prevent cursor moving to header
        return true
      }

      if (!isNodeEmpty(previousParagraphNode) || !isNodeEmpty(paragraphNode)) {
        deleteNode(tr, paragraphPos, paragraphNode)
      }

      appendAndReplaceNode(
        tr,
        previousParagraphPos,
        previousParagraphNode,
        paragraphNode
      )

      // Set the selection to the end of the previous paragraph
      setSelectionToEndOfParagraph(
        tr,
        previousParagraphPos,
        previousParagraphNode
      )
    }

    dispatch(tr)
    return true
  },
  Delete: (state, dispatch) => {
    if (!dispatch) {
      return false
    }

    if (isHighlighting(state)) {
      return false
    }

    const { doc, tr } = state
    const $pos = getResolvedPosition(state)

    if (isPosAtEndOfPageAmendment(doc, $pos)) {
      // Handle to prevent cursor moving out of the page amendment
      return true
    }

    // Ensure that the position is within a valid block (paragraph)
    if (!isPositionWithinParagraph($pos)) {
      return false
    }

    if (!isPosAtEndOfBody(doc, $pos)) {
      return false
    }

    // We need to remove the current paragraph node and prepend any
    // content to the next paragraph node (which will now be at the
    // end of the current page)
    const thisPos = $pos.pos
    const expectedTextNodePos = thisPos - 1
    const thisTextNode = doc.nodeAt(expectedTextNodePos)

    if (!thisTextNode) {
      console.warn('No node found at position', expectedTextNodePos)
      return false
    }

    const { pos: paragraphPos, node: paragraphNode } = getParagraphNodeAndPosition(doc, $pos)

    if (!paragraphNode) {
      console.warn('No current paragraph node found')
      return false
    }

    if (!isParagraphNode(thisTextNode) && !isTextNode(thisTextNode)) {
      console.warn(
        'Unexpected node type found at position',
        expectedTextNodePos
      )
      return false
    }

    const { pos: nextParagraphPos, node: nextParagraphNode } = getFirstParagraphInNextPageBodyAfterPos(doc, paragraphPos)

    if (!nextParagraphNode) {
      // Handle to prevent cursor moving to footer
      return true
    }

    const thisNodeEmpty = isNodeEmpty(paragraphNode)
    const nextNodeEmpty = isNodeEmpty(nextParagraphNode)

    if (!nextNodeEmpty) {
      deleteNode(tr, nextParagraphPos, nextParagraphNode)
    }

    appendAndReplaceNode(tr, paragraphPos, paragraphNode, nextParagraphNode)

    if (thisNodeEmpty) {
      const $newPos = tr.doc.resolve(thisPos)

      if (nextNodeEmpty) {
        moveToNextTextBlock(tr, $newPos)
      } else {
        moveToNearestTextSelection(tr, $newPos)
      }
    } else {
      setSelectionAtPos(tr, thisPos)
    }

    dispatch(tr)
    return true
  }
})

export default KeymapPlugin
