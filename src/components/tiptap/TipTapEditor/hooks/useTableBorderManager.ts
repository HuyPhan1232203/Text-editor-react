import { useState, useCallback, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import type { TableBorderStates } from '../types'

export function useTableBorderManager (editor: Editor | null) {
  const [tableBorderStates, setTableBorderStates] = useState<TableBorderStates>({})

  const updateSwitchUI = useCallback((tableIndex: number, isHidden: boolean) => {
    const switchButton = document.querySelector(`[data-switch-index="${tableIndex}"]`) as HTMLElement | null
    const thumb = document.querySelector(`[data-thumb-index="${tableIndex}"]`) as HTMLElement | null

    if (switchButton && thumb) {
      switchButton.style.backgroundColor = isHidden ? '#d1d5db' : '#10b981'
      thumb.style.transform = isHidden ? 'translateX(20px)' : 'translateX(1px)'
    }
  }, [])

  const handleToggleTableBorder = useCallback((tableIndex: number) => {
    setTableBorderStates(prev => {
      const newState = { ...prev, [tableIndex]: !prev[tableIndex] }

      requestAnimationFrame(() => {
        const tables = document.querySelectorAll('.tiptap table')
        const table = tables[tableIndex] as HTMLElement | undefined

        if (table) {
          table.classList.toggle('no-border', newState[tableIndex])
          updateSwitchUI(tableIndex, newState[tableIndex])
        }
      })

      return newState
    })
  }, [updateSwitchUI])

  const handleEditorUpdate = useCallback(() => {
    const tables = document.querySelectorAll('.tiptap table')

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
  }, [tableBorderStates, handleToggleTableBorder, updateSwitchUI])

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

function createTableControls (
  index: number,
  onToggle: (index: number) => void
): HTMLElement {
  const controlsDiv = document.createElement('div')

  controlsDiv.className = 'table-controls'
  controlsDiv.setAttribute('data-table-control', index.toString())

  const label = document.createElement('label')

  label.textContent = 'Hiển thị border:'

  const switchContainer = document.createElement('div')

  switchContainer.className = 'switch-wrapper'

  const switchButton = document.createElement('button')

  switchButton.setAttribute('data-switch-index', index.toString())
  switchButton.className = 'table-border-toggle'
  switchButton.type = 'button'

  const thumb = document.createElement('span')

  thumb.setAttribute('data-thumb-index', index.toString())
  switchButton.appendChild(thumb)

  switchButton.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(index)
  })

  controlsDiv.appendChild(label)
  switchContainer.appendChild(switchButton)
  controlsDiv.appendChild(switchContainer)

  return controlsDiv
}
