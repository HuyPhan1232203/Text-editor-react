/**
 * @file /src/utils/getPageAttributes.ts
 * @name GetPageAttributes
 * @description Utility functions for getting page attributes.
 */

import { EditorState } from '@tiptap/pm/state'
import { Node as PMNode } from '@tiptap/pm/model'
import type { PageNodeAttributes, MarginConfig } from '../../../../types/page'
import {
  calculatePageContentPixelDimensions as calculateBodyPixelDimensions,
  getPageNodePaperSize,
  getPageNumPaperSize
} from './paperSize'
import { getPageNodePaperColour, getPageNumPaperColour } from './paperColour'
import { getPageNodePaperOrientation, getPageNumPaperOrientation } from './paperOrientation'
import { getPageNodePageBorders, getPageNumPageBorders } from './pageBorders'
import { DEFAULT_PAPER_SIZE } from '../../../../constants/paperSize'
import { DEFAULT_PAPER_ORIENTATION } from '../../../../constants/paperOrientation'
import { DEFAULT_PAPER_COLOUR } from '../../../../constants/paperColours'
import { DEFAULT_PAGE_BORDER_CONFIG } from '../../../../constants/pageBorders'
import type { PageRegionNodeAttributesObject } from '../../../../types/pageRegions'
import { doesDocHavePageNodes } from '../page'
import { FOOTER_DEFAULT_ATTRIBUTES, HEADER_DEFAULT_ATTRIBUTES } from '../../../../constants/pageRegions'
import { BODY_DEFAULT_ATTRIBUTES } from '../../../../constants/body'
import { getFooterNodeAttributes, getHeaderNodeAttributes } from '../../headerFooter/headerFooter'
import { getBodyNodeAttributes } from '../../body/body'
import { getPageRegionNode } from '../../../pageRegion/getAttributes'
import type { PaginationNodeAttributes } from '../../../../types/pagination'
import { getPageNodeByPageNum } from '../pageNumber'
import { Editor } from '@tiptap/core'

/**
 * Retrieves the page node attributes from the editor state.
 *
 * @param pageNode - The page node to retrieve the attributes for.
 * @returns {PageNodeAttributes} The attributes of the specified page.
 */
export const getPageNodeAttributes = (pageNode: PMNode): PageNodeAttributes => {
  const paperSize = getPageNodePaperSize(pageNode) ?? DEFAULT_PAPER_SIZE
  const paperOrientation = getPageNodePaperOrientation(pageNode) ?? DEFAULT_PAPER_ORIENTATION
  const paperColour = getPageNodePaperColour(pageNode) ?? DEFAULT_PAPER_COLOUR
  const pageBorders = getPageNodePageBorders(pageNode) ?? DEFAULT_PAGE_BORDER_CONFIG

  return { paperSize, paperOrientation, paperColour, pageBorders }
}

/**
 * Retrieves page attributes from the editor state for a given page number.
 *
 * @param editor - The editor instance.
 * @param pageNum - The page number to retrieve the attributes for.
 * @returns {PageNodeAttributes} The attributes of the specified page.
 */
const getPageNodeAttributesByPageNum = (editor: Editor, pageNum: number): PageNodeAttributes => {
  const paperSize = getPageNumPaperSize(editor, pageNum)
  const paperColour = getPageNumPaperColour(editor, pageNum)
  const paperOrientation = getPageNumPaperOrientation(editor, pageNum)
  const pageBorders = getPageNumPageBorders(editor, pageNum)

  return { paperSize, paperColour, paperOrientation, pageBorders }
}

/**
 * Retrieves the default page region node attributes.
 *
 * @param defaultMarginConfig - Optional margin config from extension options
 * @returns {PageRegionNodeAttributesObject} The default attributes of the page regions.
 */
const getDefaultPageRegionNodeAttributes = (defaultMarginConfig?: MarginConfig): PageRegionNodeAttributesObject => {
  // QUAN TRỌNG: Dùng defaultMarginConfig nếu có, không thì fallback về BODY_DEFAULT_ATTRIBUTES
  const bodyAttributes = defaultMarginConfig
    ? { ...BODY_DEFAULT_ATTRIBUTES, pageMargins: defaultMarginConfig }
    : BODY_DEFAULT_ATTRIBUTES

  return {
    header: HEADER_DEFAULT_ATTRIBUTES,
    body: bodyAttributes,
    footer: FOOTER_DEFAULT_ATTRIBUTES
  }
}

/**
 * Retrieves body attributes from the editor state.
 *
 * @param state - The current editor state.
 * @param pageNum - The page number to retrieve the attributes for.
 * @param defaultMarginConfig - Optional margin config from extension options
 * @returns {PageRegionNodeAttributesObject} The attributes of the specified page.
 */
const getPageRegionNodeAttributes = (
  state: EditorState,
  pageNum: number,
  defaultMarginConfig?: MarginConfig
): PageRegionNodeAttributesObject => {
  console.log(`📄 Getting page region attributes for page ${pageNum}`)
  console.log('   defaultMarginConfig:', defaultMarginConfig)

  if (!doesDocHavePageNodes(state)) {
    console.log('   ⚠️ No page nodes in document, using defaults')
    return getDefaultPageRegionNodeAttributes(defaultMarginConfig)
  }

  const pageNode = getPageNodeByPageNum(state.doc, pageNum)

  if (!pageNode) {
    console.log(`   ⚠️ Page ${pageNum} not found, using defaults`)
    return getDefaultPageRegionNodeAttributes(defaultMarginConfig)
  }

  const headerNode = getPageRegionNode(pageNode, 'header')
  const bodyNode = getPageRegionNode(pageNode, 'body')
  const footerNode = getPageRegionNode(pageNode, 'footer')

  const headerAttributes = headerNode ? getHeaderNodeAttributes(headerNode) : HEADER_DEFAULT_ATTRIBUTES

  // QUAN TRỌNG: Nếu không có bodyNode, dùng defaultMarginConfig
  const bodyAttributes = bodyNode
    ? getBodyNodeAttributes(bodyNode)
    : (defaultMarginConfig
      ? { ...BODY_DEFAULT_ATTRIBUTES, pageMargins: defaultMarginConfig }
      : BODY_DEFAULT_ATTRIBUTES
    )

  console.log(`   ✅ Body attributes for page ${pageNum}:`, bodyAttributes.pageMargins)

  const footerAttributes = footerNode ? getFooterNodeAttributes(footerNode) : FOOTER_DEFAULT_ATTRIBUTES

  return { body: bodyAttributes, header: headerAttributes, footer: footerAttributes }
}

/**
 * Retrieves the page node attributes and calculates the pixel dimensions of the page.
 *
 * @param editor - The editor instance.
 * @param pageNum - The page number to retrieve the attributes for.
 * @param defaultMarginConfig - Optional margin config from extension options
 * @returns {PaginationNodeAttributes} The attributes of the page node,
 * body node and the pixel dimensions of the page.
 */
export const getPaginationNodeAttributes = (
  editor: Editor,
  pageNum: number,
  defaultMarginConfig?: MarginConfig
): PaginationNodeAttributes => {
  const { state } = editor
  const pageNodeAttributes = getPageNodeAttributesByPageNum(editor, pageNum)
  const pageRegionNodeAttributes = getPageRegionNodeAttributes(state, pageNum, defaultMarginConfig)
  const bodyPixelDimensions = calculateBodyPixelDimensions(pageNodeAttributes, pageRegionNodeAttributes.body)

  return { pageNodeAttributes, pageRegionNodeAttributes, bodyPixelDimensions }
}
