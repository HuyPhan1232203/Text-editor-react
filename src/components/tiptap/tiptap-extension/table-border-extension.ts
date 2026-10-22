import { Table, TableView } from '@tiptap/extension-table'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { t } from '@/i18n'

/**
 * Table with a "hide borders" setting stored on the table node, so it is autosaved,
 * synced to collaborators and kept in the exported HTML (as the `no-border` class).
 *
 * The toggle is an icon button rendered by the table's node view in the left page margin,
 * outside the table, so it never covers a cell.
 *
 * Tables also keep a left indent: Google Docs indents a table by wrapping it in
 * <div style="margin-left: 36pt">, which would otherwise be lost on paste.
 */

// A positive CSS length from a margin-left value, e.g. "36pt"
function indentOf (element: HTMLElement | null): string | null {
  const value = element?.style.marginLeft ?? ''

  return parseFloat(value) > 0 ? value : null
}

// Border icons (lucide "grid" / dashed outline)
const BORDER_ON_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>'
const BORDER_OFF_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" aria-hidden="true">'
  + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>'

class BorderToggleTableView extends TableView {
  private button: HTMLButtonElement
  private view: EditorView

  constructor (node: PMNode, cellMinWidth: number, view: EditorView) {
    super(node, cellMinWidth)
    this.view = view

    const controls = document.createElement('div')

    controls.className = 'table-controls'
    controls.contentEditable = 'false'
    controls.setAttribute('data-table-control', '')

    this.button = document.createElement('button')
    this.button.type = 'button'
    this.button.className = 'table-border-toggle'
    this.button.innerHTML = `<span class="icon-on">${BORDER_ON_ICON}</span><span class="icon-off">${BORDER_OFF_ICON}</span>`
    // Keep the editor selection when clicking the button
    this.button.addEventListener('mousedown', (event) => event.preventDefault())
    this.button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.toggleBorders()
    })

    controls.appendChild(this.button)
    this.dom.appendChild(controls)
    this.sync(node)
  }

  update (node: PMNode): boolean {
    if (!super.update(node)) return false
    this.sync(node)
    return true
  }

  private sync (node: PMNode) {
    const hidden = node.attrs.hideBorders === true
    const label = hidden ? t('table.showBorders') : t('table.hideBorders')

    this.table.classList.toggle('no-border', hidden)
    this.dom.style.marginLeft = node.attrs.indent ?? ''
    this.button.classList.toggle('is-hidden', hidden)
    this.button.setAttribute('aria-pressed', String(hidden))
    this.button.setAttribute('aria-label', label)
    this.button.title = label
  }

  private toggleBorders () {
    const { state } = this.view
    // The start of the table's content resolves inside the table node
    const $inside = state.doc.resolve(this.view.posAtDOM(this.contentDOM, 0))

    for (let depth = $inside.depth; depth > 0; depth--) {
      const node = $inside.node(depth)

      if (node.type.name === 'table') {
        this.view.dispatch(state.tr.setNodeAttribute($inside.before(depth), 'hideBorders', !node.attrs.hideBorders))
        return
      }
    }
  }
}

export const BorderedTable = Table.extend({
  addAttributes () {
    return {
      ...this.parent?.(),
      hideBorders: {
        default: false,
        parseHTML: (element) => element.classList.contains('no-border'),
        renderHTML: (attributes) => (attributes.hideBorders ? { class: 'no-border' } : {})
      },
      indent: {
        default: null,
        parseHTML: (element) => indentOf(element)
          ?? (element.parentElement?.tagName === 'DIV' ? indentOf(element.parentElement) : null),
        renderHTML: (attributes) => (attributes.indent
          ? { style: `margin-left: ${attributes.indent}; width: calc(100% - ${attributes.indent})` }
          : {})
      }
    }
  }
}).configure({ View: BorderToggleTableView })
