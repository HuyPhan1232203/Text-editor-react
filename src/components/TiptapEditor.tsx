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
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import { Color } from '@tiptap/extension-color'
import { LinkPopover } from './tiptap-ui/link-popover'
import { TableCellToolbar } from './tableTiptap/TableCellToolbar'
import { useState } from 'react'
import { Button } from './ui/button'
import { FileJson } from 'lucide-react'
import { PageSettingsDialog } from './PageSettingDialog'
import { convertTiptapToDocModel } from '@/helper/tiptap-to-docx'

// Configure extensions
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
    types: ['heading', 'paragraph'], // Áp dụng cho heading và paragraph
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left'
  }),

  Highlight.configure({
    multicolor: true
  }),
  // Link.configure({ openOnClick: false }),
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

  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [generatedJson, setGeneratedJson] = useState<string>('')
  const editor = useEditor({
    extensions,
    content: `
      <h2>Tiptap Editor với Table</h2>
      <p>Click vào icon <strong>Table</strong> trên toolbar để tạo table.</p>
      <p>Khi cursor ở trong table, icon <strong>Settings</strong> sẽ xuất hiện để truy cập các chức năng table.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-[400px]'
      }
    }
  })

  if (!editor) {
    return null
  }
  const handleExportDocModel = () => {
    // Lấy Tiptap JSON
    const tiptapJSON = editor.getJSON()

    // Convert sang DocModel format
    const docModelJSON = convertTiptapToDocModel(tiptapJSON, {
      topMargin: pageSettings.topMargin,
      bottomMargin: pageSettings.bottomMargin,
      leftMargin: pageSettings.leftMargin,
      rightMargin: pageSettings.rightMargin
    })

    // Format JSON đẹp
    const jsonString = JSON.stringify(docModelJSON, null, 2)

    // Hiển thị preview
    setGeneratedJson(jsonString)
    setShowJsonPreview(true)

    // Download file
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `document-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    console.log('DocModel JSON:', docModelJSON)
  }

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(generatedJson)
    alert('Đã copy JSON vào clipboard!')
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='max-w-5xl mx-auto my-8 p-4'>
        <div className='border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white'>
          {/* Toolbar */}
          <div className='border-b border-gray-200 bg-gray-50 p-3 sticky top-0 z-10'>
            <TextToolbar editor={editor} />
          </div>

          {/* Editor Content */}
          <div className='relative bg-gray-100 p-8'>
            <div
              className='mx-auto bg-white shadow-lg'
              style={{
                width: '794px',
                minHeight: '1123px',
                padding: '96px'  // 1 inch margins
              }}
            >
              <EditorContent editor={editor} />
              <TableCellToolbar editor={editor} />
            </div>
          </div>

          {/* Link Popover */}
          <LinkPopover editor={editor} />

          {/* Export Controls */}
          <div className='border-t border-gray-200 bg-gray-50 p-3'>
            <div className='flex gap-2 flex-wrap items-center'>
              <PageSettingsDialog
                settings={pageSettings}
                onSettingsChange={setPageSettings}
              />

              <div className='flex-1' />

              <Button
                onClick={handleExportDocModel}
                variant='default'
                size='sm'
              >
                <FileJson className='w-4 h-4 mr-2' />
                Export JSON cho Backend
              </Button>
            </div>
          </div>

          {/* ✅ JSON Preview */}
          {showJsonPreview && (
            <div className='border-t border-gray-200 p-4 bg-gray-50'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-lg font-semibold'>JSON Output (DocModel format):</h3>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleCopyJson}
                    variant='outline'
                    size='sm'
                  >
                    Copy JSON
                  </Button>
                  <Button
                    onClick={() => setShowJsonPreview(false)}
                    variant='ghost'
                    size='sm'
                  >
                    Ẩn
                  </Button>
                </div>
              </div>
              <pre className='bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm max-h-96 overflow-y-auto'>
                {generatedJson}
              </pre>
            </div>
          )}
        </div>
      </div>
    </EditorContext.Provider>
  )
}
