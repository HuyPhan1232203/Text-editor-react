import { TableCell, TableHeader } from '@tiptap/extension-table'

/**
 * Cell background color and vertical alignment, stored on the cell node as inline styles
 * (so they are kept when pasting tables from Google Docs / Word and in exported HTML).
 * Set them with `setCellAttribute('backgroundColor' | 'verticalAlign', value)`.
 */
export type CellVerticalAlign = 'top' | 'middle' | 'bottom'

const cellStyleAttributes = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor ? { style: `background-color: ${attributes.backgroundColor}` } : {}
  },
  verticalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      const value = element.style.verticalAlign

      return value === 'top' || value === 'middle' || value === 'bottom' ? value : null
    },
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.verticalAlign ? { style: `vertical-align: ${attributes.verticalAlign}` } : {}
  }
}

export const StyledTableCell = TableCell.extend({
  addAttributes () {
    return { ...this.parent?.(), ...cellStyleAttributes }
  }
})

export const StyledTableHeader = TableHeader.extend({
  addAttributes () {
    return { ...this.parent?.(), ...cellStyleAttributes }
  }
})
