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
import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { FileCode } from 'lucide-react'
import { PageSettingsDialog } from './PageSettingDialog'
import { mmToPx } from '@/utils/convertUnit'

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
    topMargin: 25.4,    // 1 inch = 25.4mm
    bottomMargin: 25.4,
    leftMargin: 25.4,
    rightMargin: 25.4
  })

  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string>('')

  const editor = useEditor({
    extensions,
    autofocus: 'end',
    content: ``,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none'
      }
    }
  })

  const editorPadding = useMemo(() => {
    const mmToPx = (mm: number) => (mm / 25.4) * 96

    return {
      top: mmToPx(pageSettings.topMargin),
      right: mmToPx(pageSettings.rightMargin),
      bottom: mmToPx(pageSettings.bottomMargin),
      left: mmToPx(pageSettings.leftMargin)
    }
  }, [pageSettings])

  if (!editor) {
    return null
  }

  const handleExportHtml = () => {
    // ✅ Sử dụng getHTML() thay vì getJSON()
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
  }

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generatedHtml)
    alert('Đã copy HTML vào clipboard!')
  }

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
        <div className='flex-1 overflow-auto p-8 flex justify-center'>
          <div
            className='bg-white shadow-xl relative document-page'
            style={{
              width: '794px',
              minHeight: '1123px',
              padding: `${editorPadding.top}px ${editorPadding.right}px ${editorPadding.bottom}px ${editorPadding.left}px`
            }}
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
