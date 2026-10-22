import { useEditor } from '@tiptap/react'
import { useEffect, useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import { TextAlign } from '@tiptap/extension-text-align'
import { Link } from '@tiptap/extension-link'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import {
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle
} from '@tiptap/extension-text-style'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji'
import { FileHandler } from '@tiptap/extension-file-handler'
import { handleImageUpload, insertImageFiles, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { ImageUploadNode } from '@/components/tiptap/tiptap-node/image-upload-node'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Pagination } from '@/components/tiptap/tiptap-extension/pagination-extension'
import { ImageWrapExtension } from '@/components/tiptap/tiptap-extension/image-wrap-extension'
import { ChecklistExtensions } from '@/components/tiptap/tiptap-extension/checklist-extension'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

// Collaboration is opt-in: open the app with ?room=<name> to share a document over WebRTC
const ROOM_NAME = new URLSearchParams(window.location.search).get('room')

export function useEditorConfig () {
  const ydoc = useMemo(() => new Y.Doc(), [])

  const provider = useMemo(
    () => (ROOM_NAME ? new WebrtcProvider(ROOM_NAME, ydoc) : null),
    [ydoc]
  )

  // Autosave: keep the document in IndexedDB so a reload does not lose it
  const persistence = useMemo(
    () => new IndexeddbPersistence(ROOM_NAME ? `room:${ROOM_NAME}` : 'document', ydoc),
    [ydoc]
  )

  useEffect(() => {
    return () => {
      provider?.destroy()
      persistence.destroy()
      ydoc?.destroy()
    }
  }, [provider, persistence, ydoc])
  const extensions = useMemo(
    () => [
      Collaboration.configure({
        document: ydoc
      }),
      ...(provider
        ? [
          CollaborationCaret.configure({
            provider,
            render: (user: { color: string, name?: string }) => {
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
          })
        ]
        : []),
      TextStyle,
      StarterKit.configure({
        undoRedo: false,
        // Link is configured separately below
        link: false
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: false
        }
      }),
      // Pasted/uploaded images are stored as data URLs; drag the corners to resize, wrap text around them
      ImageWrapExtension.configure({
        allowBase64: true,
        resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 40, minHeight: 40 }
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onPaste: (editor, files, htmlContent) => {
          // Copied web content with its own <img> tags is handled by the default HTML paste
          if (htmlContent && /<img\b/i.test(htmlContent)) return
          insertImageFiles(editor, files, editor.state.selection.anchor)
        },
        onDrop: (editor, files, pos) => {
          insertImageFiles(editor, files, pos)
        }
      }),
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true
      }),
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
      ...ChecklistExtensions,
      Pagination,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload
      })
    ],
    [ydoc, provider]
  )

  return useEditor({
    extensions,
    autofocus: 'start',
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none'
      }
    }
  })
}
