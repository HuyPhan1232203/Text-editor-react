import { useEditor } from '@tiptap/react'
import { useEffect, useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { TextAlign } from '@tiptap/extension-text-align'
import { Link } from '@tiptap/extension-link'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { FontFamily, FontSize, LineHeight, TextStyle } from '@tiptap/extension-text-style'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { DEFAULT_PAGE_SETTINGS } from '../constants'
import { ImageUploadNode } from '@/components/tiptap/tiptap-node/image-upload-node'
import PaginationExtension, { BodyNode, PageNode } from '../../paging'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

export function useEditorConfig () {
  const ydoc = useMemo(() => new Y.Doc(), [])

  const provider = useMemo(() => {
    const p = new WebrtcProvider('ccccc', ydoc)

    // Debug: Số người đang online
    p.on('peers', (event) => {
      console.log('👥 Connected peers:', event.webrtcPeers.length)
      console.log('Peers:', event.webrtcPeers)
    })

    // Debug: Khi đồng bộ thành công
    p.on('synced', (event) => {
      console.log('✅ Synced:', event.synced)
    })

    return p
  }, [ydoc])

  useEffect(() => {
    return () => {
      provider?.destroy()
      ydoc?.destroy()
    }
  }, [provider, ydoc])
  const extensions = useMemo(() => [
    Collaboration.configure({
      document: ydoc
    }),
    CollaborationCaret.configure({
      provider,
      render: (user: any) => {
        const root = document.createElement('div')

        root.className = 'collaboration-caret'
        root.style.color = user.color ?? '#f97316'

        const line = document.createElement('div')

        line.className = 'caret-line'

        const tooltip = document.createElement('div')

        tooltip.className = 'caret-tooltip'
        tooltip.textContent = user.name ?? 'User'

        root.appendChild(line)
        root.appendChild(tooltip)

        return root
      }
    }),

    TextStyle,
    StarterKit.configure({
      undoRedo: false
    }),
    Image,
    PaginationExtension.configure({
      defaultMarginConfig: {
        top: DEFAULT_PAGE_SETTINGS.topMargin,
        bottom: DEFAULT_PAGE_SETTINGS.bottomMargin,
        left: DEFAULT_PAGE_SETTINGS.leftMargin,
        right: DEFAULT_PAGE_SETTINGS.rightMargin
      },
      defaultPaperOrientation: DEFAULT_PAGE_SETTINGS.orientation,
      pageAmendmentOptions: {
        enableFooter: true
      }
    }),
    PageNode,
    BodyNode,
    Color.configure({ types: ['textStyle'] }),
    Link.configure({ openOnClick: false }),
    TableKit.configure({
      table: {
        resizable: true,
        HTMLAttributes: { class: 'tiptap-table' }
      },
      tableRow: { HTMLAttributes: { class: 'tiptap-table-row' } },
      tableCell: { HTMLAttributes: { class: 'tiptap-table-cell' } },
      tableHeader: { HTMLAttributes: { class: 'tiptap-table-header' } }
    }),
    FontFamily.configure({ types: ['textStyle'] }),
    FontSize.configure({ types: ['textStyle'] }),
    LineHeight.configure({ types: ['textStyle'] }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left'
    }),
    Highlight.configure({ multicolor: true }),
    ImageUploadNode.configure({
      accept: 'image/*',
      maxSize: MAX_FILE_SIZE,
      limit: 3,
      upload: handleImageUpload,
      onError: (error) => console.error('Upload failed:', error),
      onSuccess: (url) => console.log('Upload successful! Image URL:', url)
    })
  ], [ydoc, provider])

  return useEditor({
    extensions,
    autofocus: 'end',
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none'
      }
    }
  })
}
