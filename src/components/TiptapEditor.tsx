import { FontFamily, FontSize, LineHeight, TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextToolbar } from './TextToolbar'
import { Link } from '@tiptap/extension-link'
import { Highlight } from '@tiptap/extension-highlight'
import { ImageUploadNode } from './tiptap-node/image-upload-node'
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { Color } from '@tiptap/extension-color'
import { TableCellToolbar } from './tableTiptap/TableCellToolbar'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Button } from './ui/button'
import { PageSettingsDialog } from './PageSettingDialog'
import { mmToPx } from '@/utils/convertUnit'
import PaginationExtension, { BodyNode, PageNode } from '@/paging'

// Main Editor Component
export default function TiptapEditor () {
  const [pageSettings, setPageSettings] = useState({
    topMargin: 25.4,
    bottomMargin: 25.4,
    leftMargin: 25.4,
    rightMargin: 25.4,
    orientation: 'portrait' as 'landscape' | 'portrait'
  })

  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [tableBorderStates, setTableBorderStates] = useState<Record<number, boolean>>({})
  const extensions = useMemo(() => [
    TextStyle,
    StarterKit,
    Image,
    PaginationExtension.configure({
      defaultMarginConfig: {
        top: pageSettings.topMargin,
        bottom: pageSettings.bottomMargin,
        left: pageSettings.leftMargin,
        right: pageSettings.rightMargin
      },
      defaultPaperOrientation: pageSettings.orientation,
      pageAmendmentOptions: {
        enableFooter: true
      }
    }),
    PageNode,
    BodyNode,
    Color.configure({
      types: ['textStyle']
    }),
    Link.configure({
      openOnClick: false
    }),
    TableKit.configure({
      table: {
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table'
        }
      },
      tableRow: {
        HTMLAttributes: {
          class: 'tiptap-table-row'
        }
      },
      tableCell: {
        HTMLAttributes: {
          class: 'tiptap-table-cell'
        }
      },
      tableHeader: {
        HTMLAttributes: {
          class: 'tiptap-table-header'
        }
      }
    }),
    FontFamily.configure({
      types: ['textStyle']
    }),
    FontSize.configure({
      types: ['textStyle']
    }),
    LineHeight.configure({
      types: ['textStyle']
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left'
    }),
    Highlight.configure({
      multicolor: true
    }),
    ImageUploadNode.configure({
      accept: 'image/*',
      maxSize: MAX_FILE_SIZE,
      limit: 3,
      upload: handleImageUpload,
      onError: (error) => console.error('Upload failed:', error),
      onSuccess (url) {
        console.log('Upload successful! Image URL:', url)
      }
    })
  ], [pageSettings])
  const editor = useEditor({
    extensions,
    autofocus: 'end',
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none'
      }
    }
  })

  // Tối ưu: Dùng useCallback để memoize function
  const updateSwitchUI = useCallback((tableIndex: number, isHidden: boolean) => {
    const switchButton = document.querySelector(`[data-switch-index="${tableIndex}"]`) as HTMLElement | null
    const thumb = document.querySelector(`[data-thumb-index="${tableIndex}"]`) as HTMLElement | null

    if (switchButton && thumb) {
      switchButton.style.backgroundColor = isHidden ? '#d1d5db' : '#10b981'
      thumb.style.transform = isHidden ? 'translateX(20px)' : 'translateX(1px)'
    }
  }, [])

  // Tối ưu: useCallback + requestAnimationFrame thay vì setTimeout
  const handleToggleTableBorder = useCallback((tableIndex: number) => {
    setTableBorderStates(prev => {
      const newState = {
        ...prev,
        [tableIndex]: !prev[tableIndex]
      }

      // Tối ưu: dùng requestAnimationFrame thay vì setTimeout
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

  // Tối ưu: useCallback để memoize function
  const handleEditorUpdate = useCallback(() => {
    const tables = document.querySelectorAll('.tiptap table')

    tables.forEach((table, index) => {
      const tableElement = table as HTMLElement

      // gán index cho table (để debug/trace)
      if (!tableElement.dataset.tableIndex) {
        tableElement.dataset.tableIndex = index.toString()
      }

      // 1) đảm bảo mỗi table có wrapper riêng để đặt overlay (absolute)
      let wrapper = tableElement.closest('.table-wrap') as HTMLElement | null

      if (!wrapper) {
        wrapper = document.createElement('div')
        wrapper.className = 'table-wrap'

        const parent = tableElement.parentElement

        if (!parent) return

        parent.insertBefore(wrapper, tableElement)
        wrapper.appendChild(tableElement)
      }

      // 2) tìm control chỉ trong wrapper (tránh dính nhầm table khác)
      const existingControl = wrapper.querySelector(
        `[data-table-control="${index}"]`
      ) as HTMLElement | null

      if (!existingControl) {
        const controlsDiv = document.createElement('div')

        controlsDiv.className = 'table-controls'
        controlsDiv.setAttribute('data-table-control', index.toString())

        // Label
        const label = document.createElement('label')

        label.textContent = 'Hiển thị border:'

        // Switch container
        const switchContainer = document.createElement('div')

        switchContainer.className = 'switch-wrapper'

        // Switch button
        const switchButton = document.createElement('button')

        switchButton.setAttribute('data-switch-index', index.toString())
        switchButton.className = 'table-border-toggle'
        switchButton.type = 'button'

        // Thumb
        const thumb = document.createElement('span')

        thumb.setAttribute('data-thumb-index', index.toString())
        switchButton.appendChild(thumb)

        switchButton.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggleTableBorder(index)
        })

        controlsDiv.appendChild(label)
        switchContainer.appendChild(switchButton)
        controlsDiv.appendChild(switchContainer)

        // IMPORTANT: append vào wrapper để overlay (không insert sau table nữa)
        wrapper.appendChild(controlsDiv)
      }

      // 3) áp dụng state hiện tại cho table + cập nhật UI switch
      const isHidden = !!tableBorderStates[index]

      tableElement.classList.toggle('no-border', isHidden)
      updateSwitchUI(index, isHidden)
    })
  }, [tableBorderStates, handleToggleTableBorder, updateSwitchUI])

  // CHỈ sync khi user thay đổi pageSettings qua dialog
  // CHỈ sync khi user thay đổi pageSettings qua dialog
  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    editor
      .chain()
      .setDocumentPageMargins({
        top: pageSettings.topMargin,
        bottom: pageSettings.bottomMargin,
        left: pageSettings.leftMargin,
        right: pageSettings.rightMargin
      })
      .setDocumentPaperOrientation(pageSettings.orientation) // <== thêm dòng này
      .run()
  }, [editor, pageSettings])

  // Tối ưu: useEffect với cleanup để tránh memory leaks
  useEffect(() => {
    if (!editor) return

    const handleEditorReady = () => {
      handleEditorUpdate()
    }

    editor.on('create', handleEditorReady)
    editor.on('update', handleEditorUpdate)

    // Cleanup function
    return () => {
      editor.off('create', handleEditorReady)
      editor.off('update', handleEditorUpdate)
    }
  }, [editor, handleEditorUpdate])

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='flex flex-col h-screen bg-gray-200'>
        {/* Toolbar */}
        <div className='border-b border-gray-300 bg-white p-3 sticky top-0 z-10 shadow-sm'>
          <TextToolbar
            editor={editor}
            topMargin={mmToPx(pageSettings.topMargin)}
            bottomMargin={mmToPx(pageSettings.bottomMargin)}
            leftMargin={mmToPx(pageSettings.leftMargin)}
            rightMargin={mmToPx(pageSettings.rightMargin)}
            orientation={pageSettings.orientation}
          />
        </div>

        {/* Editor Content - Document View */}
        <div className='flex-1 overflow-auto p-8 flex justify-center'>
          <div
            className=''
            onClick={() => {
              if (!editor?.isFocused) {
                editor?.commands.focus('end')
              }
            }}
          >
            <EditorContent editor={editor} />
            <TableCellToolbar editor={editor} />
          </div>
        </div>

        {/* Footer Controls */}
        <div className='border-t border-gray-300 bg-white p-4 shadow-lg'>
          <div className='flex gap-3 flex-wrap items-center justify-between max-w-7xl mx-auto'>
            <div className='flex gap-3 items-center'>
              <PageSettingsDialog
                settings={pageSettings}
                onSettingsChange={setPageSettings}
              />
              <div className='text-xs text-gray-500'>
                Lề: T:{pageSettings.topMargin}mm |
                P:{pageSettings.rightMargin}mm |
                D:{pageSettings.bottomMargin}mm |
                T:{pageSettings.leftMargin}mm |
                Hướng:{pageSettings.orientation === 'portrait' ? 'Dọc' : 'Ngang'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
