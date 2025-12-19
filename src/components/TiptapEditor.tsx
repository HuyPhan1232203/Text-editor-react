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
import { useState, useCallback, useEffect } from 'react'
import { Button } from './ui/button'
import { FileCode } from 'lucide-react'
import { PageSettingsDialog } from './PageSettingDialog'
import { mmToPx } from '@/utils/convertUnit'
import { PaginationPlus } from 'tiptap-pagination-plus'

const extensions = [
  TextStyle,
  StarterKit,
  Image,
  Color.configure({
    types: ['textStyle']
  }),
  Link.configure({
    openOnClick: false
  }),
  PaginationPlus.configure({
    pageHeight: 1150,
    pageWidth: 794,
    pageGap: 16,
    pageGapBorderSize: 1,
    pageGapBorderColor: '#d1d5db',
    pageBreakBackground: '#f3f4f6',
    footerRight: '',
    footerLeft: '',
    headerLeft: '',
    headerRight: '',
    marginTop: 96,
    marginBottom: 96,
    marginLeft: 96,
    marginRight: 96,
    contentMarginTop: 10,
    contentMarginBottom: 10
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
]

// Main Editor Component
export default function TiptapEditor () {
  const [pageSettings, setPageSettings] = useState({
    topMargin: 25.4,
    bottomMargin: 25.4,
    leftMargin: 25.4,
    rightMargin: 25.4
  })

  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string>('')
  const [tableBorderStates, setTableBorderStates] = useState<Record<number, boolean>>({})

  const editor = useEditor({
    extensions,
    autofocus: 'end',
    content: "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  \n    <style>\n      body {\n        font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;\n        font-size: 11pt;\n        line-height: 1.5;\n        color: #000;\n        margin: 0;\n        padding: 0;\n        background-color: transparent;\n      }\n      \n      p {\n        color: #000;\n        margin: 0;\n        line-height: 1.5;\n        font-size: 11pt;\n      }\n      \n      h1, h2, h3, h4, h5, h6 {\n        line-height: 1.3;\n        font-weight: 700;\n        margin: 12pt 0 6pt 0;\n        color: #000;\n        font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;\n      }\n      \n      h1 { font-size: 26pt; }\n      h2 { font-size: 19pt; }\n      h3 { font-size: 14pt; }\n      h4 { font-size: 13pt; }\n      h5 { font-size: 12pt; }\n      h6 { font-size: 11pt; }\n      \n      ul, ol {\n        padding-left: 36pt;\n        margin: 6pt 0;\n        color: #000;\n      }\n      \n      ul { list-style-type: disc; }\n      ol { list-style-type: decimal; }\n      \n      ul ul { \n        list-style-type: circle;\n        margin-top: 3pt;\n        margin-bottom: 3pt;\n      }\n      ul ul ul { list-style-type: square; }\n      \n      ol ol { \n        list-style-type: lower-alpha;\n        margin-top: 3pt;\n        margin-bottom: 3pt;\n      }\n      ol ol ol { list-style-type: lower-roman; }\n      \n      ul > li > ol,\n      ol > li > ul {\n        margin-top: 0.5rem;\n      }\n      \n      li {\n        margin: 3pt 0;\n        padding-left: 6pt;\n      }\n      \n      li > p {\n        margin: 0;\n        line-height: 1.5;\n      }\n      \n      code {\n        background-color: #f2f2f2;\n        color: #000;\n        padding: 2px 4px;\n        border-radius: 2px;\n        font-size: 10pt;\n        font-family: 'Courier New', monospace;\n      }\n      \n      pre {\n        background-color: #f2f2f2;\n        border: 1px solid #d0d0d0;\n        padding: 8px;\n        border-radius: 2px;\n        overflow-x: auto;\n        margin: 12pt 0;\n      }\n      \n      pre code {\n        background-color: transparent;\n        padding: 0;\n      }\n      \n      blockquote {\n        border-left: 4pt solid #808080;\n        padding-left: 12pt;\n        margin: 12pt 0;\n        color: #404040;\n        font-style: italic;\n      }\n      \n      a {\n        color: #0563c1;\n        text-decoration: underline;\n        cursor: pointer;\n      }\n      \n      a:hover {\n        color: #054399;\n      }\n      \n      table {\n        border-collapse: collapse;\n        table-layout: fixed;\n        width: 100%;\n        overflow: hidden;\n      }\n      \n      table td,\n      table th {\n        min-width: 1em;\n        border: 1px solid #e5e7eb;\n        padding-right: 5pt;\n        padding-left: 5pt;\n        vertical-align: top;\n        box-sizing: border-box;\n        position: relative;\n        color: #1f2937;\n        background-color: #fff;\n        word-wrap: break-word;\n        word-break: break-word;\n        overflow-wrap: break-word;\n        hyphens: auto;\n      }\n      \n      table.no-border td,\n      table.no-border th {\n        border: none !important;\n        border-bottom: 1px solid transparent !important;\n      }\n      \n      strong, b { font-weight: 700; }\n      em, i { font-style: italic; }\n      u { text-decoration: underline; }\n      s, del { text-decoration: line-through; }\n      \n      hr {\n        border: none;\n        border-top: 0.5pt solid #000;\n        margin: 12pt 0;\n        height: 0;\n      }\n      \n      img {\n        max-width: 100%;\n        height: auto;\n        margin: 6pt 0;\n      }\n      \n      @media print {\n        body {\n          -webkit-print-color-adjust: exact;\n          print-color-adjust: exact;\n        }\n        \n        h1, h2, h3, h4, h5, h6 {\n          page-break-after: avoid;\n        }\n        \n        p {\n          orphans: 3;\n          widows: 3;\n        }\n        \n        img, table {\n          page-break-inside: avoid;\n        }\n      }\n    </style>\n  \n</head>\n<body>\n  <h1 style=\"text-align: left;\"><strong>Example | Tiptap Pagination</strong></h1><h3 style=\"text-align: left;\"><strong>Basic Setup</strong></h3><pre><code>import { Editor } from '@tiptap/core';</code></pre><p style=\"text-align: left;\"><code>import StarterKit from '@tiptap/starter-kit';</code></p><p style=\"text-align: left;\"><code>import { PaginationPlus, PAGE_SIZES } from 'tiptap-pagination-plus';</code></p><p style=\"text-align: left;\"><code>import { PaginationTable } from 'tiptap-table-plus';</code></p><p style=\"text-align: left;\"><code>const {</code></p><p style=\"text-align: left;\"><code>TablePlus, TableRowPlus, TableCellPlus, TableHeaderPlus</code></p><p style=\"text-align: left;\"><code>} = PaginationTable;</code></p><p style=\"text-align: left;\"><code>const editor = new Editor({</code></p><p style=\"text-align: left;\"><code>extensions: [</code></p><p style=\"text-align: left;\"><code>StarterKit,</code></p><p style=\"text-align: left;\"><code>TablePlus,</code></p><p style=\"text-align: left;\"><code>TableRowPlus,</code></p><p style=\"text-align: left;\"><code>TableCellPlus,</code></p><p style=\"text-align: left;\"><code>TableHeaderPlus,</code></p><p style=\"text-align: left;\"><code>PaginationPlus.configure({</code></p><p style=\"text-align: left;\"><code>pageHeight: 842,</code></p><p style=\"text-align: left;\"><code>pageWidth: 789,</code></p><p style=\"text-align: left;\"><code>pageGap: 20,</code></p><p style=\"text-align: left;\"><code>pageGapBorderSize: 1,</code></p><p style=\"text-align: left;\"><code>pageGapBorderColor: \"#e5e5e5\",</code></p><p style=\"text-align: left;\"><code>pageBreakBackground: \"#F7F7F8\",</code></p><p style=\"text-align: left;\"><code>pageHeaderHeight: 25,</code></p><p style=\"text-align: left;\"><code>pageFooterHeight: 25,</code></p><p style=\"text-align: left;\"><code>footerRight: \"Made with ❤️ by Romik\",</code></p><p style=\"text-align: left;\"><code>footerLeft: \"Page {page}\",</code></p><p style=\"text-align: left;\"><code>headerLeft: \"Header Left\",</code></p><p style=\"text-align: left;\"><code>headerRight: \"Header Right\",</code></p><p style=\"text-align: left;\"><code>marginTop: 30,</code></p><p style=\"text-align: left;\"></p><p style=\"text-align: left;\"></p><p style=\"text-align: left;\"></p><p style=\"text-align: left;\"></p><p style=\"text-align: left;\"></p><p style=\"text-align: left;\"><code>marginBottom: 50,</code></p><p style=\"text-align: left;\"><code>marginLeft: 70,</code></p><p style=\"text-align: left;\"><code>marginRight: 70,</code></p><p style=\"text-align: left;\"><code>contentMarginTop: 30,</code></p><p style=\"text-align: left;\"><code>contentMarginBottom: 30,</code></p><p style=\"text-align: left;\"><code>}),</code></p><p style=\"text-align: left;\"><code>],</code></p><p style=\"text-align: left;\"><code>})</code></p><h3 style=\"text-align: left;\"><strong>Using Commands</strong></h3><pre><code>// Example: Using predefined page sizes</code></pre><p style=\"text-align: left;\"><code>editor.chain().focus().updatePageSize(PAGE_SIZES.A4).run()</code></p><p style=\"text-align: left;\"><code>// Example: Dynamic updates</code></p><p style=\"text-align: left;\"><code>editor.chain().focus()</code></p><p style=\"text-align: left;\"><code>.updatePageHeight(1000)</code></p><p style=\"text-align: left;\"><code>.updatePageWidth(600)</code></p><p style=\"text-align: left;\"><code>.updateMargins({ top: 30, bottom: 30, left: 60, right: 60 })</code></p><p style=\"text-align: left;\"><code>.updateHeaderContent('Document Title', 'Page {page}')</code></p><p style=\"text-align: left;\"><code>.updateFooterContent('Confidential', 'Page {page} of {total}')</code></p><p style=\"text-align: left;\"><code>.run()</code></p><p style=\"text-align: left;\"><code>// Update page background color</code></p><p style=\"text-align: left;\"><code>editor.chain().focus().updatePageBreakBackground('#f0f0f0').run()</code></p><hr><p style=\"text-align: left;\"><strong>Links:</strong></p><ul><li><p style=\"text-align: left;\"><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://www.npmjs.com/package/tiptap-pagination-plus\">NPM</a></p></li><li><p style=\"text-align: left;\"><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://github.com/RomikMakavana/tiptap-pagination-plus\">GitHub</a></p></li></ul><p style=\"text-align: left;\"></p>\n</body>\n</html>",
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

      // Set data attribute
      if (!tableElement.dataset.tableIndex) {
        tableElement.dataset.tableIndex = index.toString()
      }

      // Kiểm tra xem control đã được thêm chưa
      const existingControl = tableElement.parentElement?.querySelector(`[data-table-control="${index}"]`)

      if (!existingControl) {
        const controlsDiv = document.createElement('div')

        controlsDiv.className = 'table-controls'
        controlsDiv.setAttribute('data-table-control', index.toString())
        controlsDiv.style.display = 'flex'
        controlsDiv.style.alignItems = 'center'
        controlsDiv.style.gap = '12px'
        controlsDiv.style.marginTop = '12px'
        controlsDiv.style.marginBottom = '20px'
        controlsDiv.style.padding = '12px'
        controlsDiv.style.backgroundColor = '#f8f9fa'
        controlsDiv.style.borderRadius = '6px'
        controlsDiv.style.border = '1px solid #e5e7eb'

        // Label
        const label = document.createElement('label')

        label.style.fontSize = '13px'
        label.style.fontWeight = '500'
        label.style.color = '#374151'
        label.style.margin = '0'
        label.style.cursor = 'pointer'
        label.textContent = 'Hiển thị border:'

        // Switch container
        const switchContainer = document.createElement('div')

        switchContainer.className = 'switch-wrapper'
        switchContainer.style.display = 'inline-flex'

        // Switch button
        const switchButton = document.createElement('button')

        switchButton.setAttribute('data-switch-index', index.toString())
        switchButton.className = 'table-border-toggle'
        switchButton.type = 'button'
        switchButton.style.backgroundColor = tableBorderStates[index] ? '#d1d5db' : '#10b981'
        switchButton.style.border = 'none'
        switchButton.style.cursor = 'pointer'
        switchButton.style.transition = 'background-color 200ms'
        switchButton.style.borderRadius = '9999px'
        switchButton.style.width = '44px'
        switchButton.style.height = '24px'
        switchButton.style.display = 'inline-flex'
        switchButton.style.alignItems = 'center'
        switchButton.style.padding = '0'
        switchButton.style.position = 'relative'

        switchButton.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggleTableBorder(index)
        })

        // Thumb
        const thumb = document.createElement('span')

        thumb.setAttribute('data-thumb-index', index.toString())
        thumb.style.display = 'inline-block'
        thumb.style.height = '20px'
        thumb.style.width = '20px'
        thumb.style.borderRadius = '9999px'
        thumb.style.backgroundColor = 'white'
        thumb.style.transition = 'transform 200ms ease'
        thumb.style.transform = tableBorderStates[index] ? 'translateX(20px)' : 'translateX(1px)'
        thumb.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        thumb.style.position = 'absolute'
        thumb.style.left = '2px'

        switchButton.appendChild(thumb)

        controlsDiv.appendChild(label)
        switchContainer.appendChild(switchButton)
        controlsDiv.appendChild(switchContainer)

        tableElement.parentElement?.insertBefore(controlsDiv, tableElement.nextSibling)

        // Áp dụng state hiện tại cho table
        if (tableBorderStates[index]) {
          tableElement.classList.add('no-border')
        } else {
          tableElement.classList.remove('no-border')
        }
      }
    })
  }, [tableBorderStates, handleToggleTableBorder])

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

  // Tối ưu: useCallback cho export handlers
  const handleExportHtml = useCallback(() => {
    if (!editor) return

    const htmlContent = editor.getHTML()

    setGeneratedHtml(htmlContent)
    setShowHtmlPreview(true)

    // Download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `document-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)

    console.log('HTML Content:', htmlContent)
  }, [editor])

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml)
      alert('Đã copy HTML vào clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Không thể copy HTML!')
    }
  }, [generatedHtml])

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
          />
        </div>

        {/* Editor Content - Document View */}
        <div className='flex-1 overflow-auto p-8 bg-gray-100 flex justify-center'>
          <div className='w-full max-w-4xl'>
            <div
              className='relative'
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
                T:{pageSettings.leftMargin}mm
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleExportHtml}
                variant='default'
                size='sm'
              >
                <FileCode className='w-4 h-4 mr-2' />
                Export HTML
              </Button>
            </div>
          </div>
        </div>

        {/* HTML Preview Modal */}
        {showHtmlPreview && (
          <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto'>
              <div className='flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white'>
                <h3 className='text-lg font-semibold'>HTML Output</h3>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleCopyHtml}
                    variant='outline'
                    size='sm'
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => setShowHtmlPreview(false)}
                    variant='ghost'
                    size='sm'
                  >
                    Close
                  </Button>
                </div>
              </div>
              <pre className='bg-gray-50 p-4 overflow-auto text-sm font-mono text-gray-800'>
                {generatedHtml}
              </pre>
            </div>
          </div>
        )}
      </div>
    </EditorContext.Provider>
  )
}
