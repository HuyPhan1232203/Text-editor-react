import { useState, useCallback, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import type { TableBorderStates } from '../types'

export function useTableBorderManager (editor: Editor | null) {
  const [tableBorderStates, setTableBorderStates] = useState<TableBorderStates>({})

  const updateSwitchUI = useCallback((tableIndex: number, isHidden: boolean) => {
    // Scoped to this editor: page thumbnails contain cloned controls with the same attributes
    const root = editor?.view.dom
    const button = root?.querySelector(`[data-switch-index="${tableIndex}"]`) as HTMLElement | null

    if (button) {
      const label = isHidden ? 'Hiện viền bảng' : 'Ẩn viền bảng'

      button.classList.toggle('is-hidden', isHidden)
      button.setAttribute('aria-pressed', String(isHidden))
      button.setAttribute('aria-label', label)
      button.title = label
    }
  }, [editor])

  const handleToggleTableBorder = useCallback((tableIndex: number) => {
    setTableBorderStates(prev => {
      const newState = { ...prev, [tableIndex]: !prev[tableIndex] }

      requestAnimationFrame(() => {
        const tables = editor?.view.dom.querySelectorAll('table') ?? []
        const table = tables[tableIndex] as HTMLElement | undefined

        if (table) {
          table.classList.toggle('no-border', newState[tableIndex])
          updateSwitchUI(tableIndex, newState[tableIndex])
        }
      })

      return newState
    })
  }, [editor, updateSwitchUI])

  const handleEditorUpdate = useCallback(() => {
    const tables = editor?.view.dom.querySelectorAll('table') ?? []

    tables.forEach((table, index) => {
      const tableElement = table as HTMLElement

      if (!tableElement.dataset.tableIndex) {
        tableElement.dataset.tableIndex = index.toString()
      }

      let wrapper = tableElement.closest('.table-wrap') as HTMLElement | null

      if (!wrapper) {
        wrapper = document.createElement('div')
        wrapper.className = 'table-wrap'

        const parent = tableElement.parentElement

        if (!parent) return

        parent.insertBefore(wrapper, tableElement)
        wrapper.appendChild(tableElement)
      }

      const existingControl = wrapper.querySelector(
        `[data-table-control="${index}"]`
      ) as HTMLElement | null

      if (!existingControl) {
        const controlsDiv = createTableControls(index, handleToggleTableBorder)

        wrapper.appendChild(controlsDiv)
      }

      const isHidden = !!tableBorderStates[index]

      tableElement.classList.toggle('no-border', isHidden)
      updateSwitchUI(index, isHidden)
    })
  }, [editor, tableBorderStates, handleToggleTableBorder, updateSwitchUI])

  useEffect(() => {
    if (!editor) return

    editor.on('create', handleEditorUpdate)
    editor.on('update', handleEditorUpdate)

    return () => {
      editor.off('create', handleEditorUpdate)
      editor.off('update', handleEditorUpdate)
    }
  }, [editor, handleEditorUpdate])

  return { tableBorderStates, handleToggleTableBorder }
}

// Border icons (lucide "grid" / dashed outline)
const BORDER_ON_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>'
const BORDER_OFF_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" aria-hidden="true">'
  + '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>'

/**
 * A small icon button in the page margin, left of the table, so it never covers a cell.
 * It shows while the pointer is over the table or the cursor is inside it.
 */
function createTableControls (
  index: number,
  onToggle: (index: number) => void
): HTMLElement {
  const controlsDiv = document.createElement('div')

  controlsDiv.className = 'table-controls'
  controlsDiv.contentEditable = 'false'
  controlsDiv.setAttribute('data-table-control', index.toString())

  const button = document.createElement('button')

  button.setAttribute('data-switch-index', index.toString())
  button.className = 'table-border-toggle'
  button.type = 'button'
  button.title = 'Ẩn viền bảng'
  button.setAttribute('aria-label', 'Ẩn viền bảng')
  button.setAttribute('aria-pressed', 'false')
  button.innerHTML = `<span class="icon-on">${BORDER_ON_ICON}</span><span class="icon-off">${BORDER_OFF_ICON}</span>`

  // Keep the editor selection when clicking the button
  button.addEventListener('mousedown', (e) => e.preventDefault())
  button.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(index)
  })

  controlsDiv.appendChild(button)

  return controlsDiv
}
