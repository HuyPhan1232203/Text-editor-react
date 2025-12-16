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

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='max-w-4xl mx-auto my-8 p-4 relative'>
        <div className='border border-gray-200 rounded-lg shadow-lg bg-white'>
          <div className='border-b border-gray-200 bg-gray-50 p-3 sticky top-0 z-10'>
            <TextToolbar editor={editor} />
          </div>

          <div className='relative'>
            <EditorContent editor={editor} />

            <TableCellToolbar editor={editor} />
          </div>

          <LinkPopover
            editor={editor}
            hideWhenUnavailable
            autoOpenOnLinkActive
            onSetLink={() => console.log('Link đã được set!')}
            onOpenChange={(isOpen) => console.log('Popover:', isOpen ? 'opened' : 'closed')}
          />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
