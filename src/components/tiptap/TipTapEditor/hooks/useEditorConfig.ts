import { useEditor } from '@tiptap/react'
import { useEffect, useMemo, useState } from 'react'
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
import { defaultSelectionBuilder, yCursorPlugin, yCursorPluginKey, yUndoPluginKey } from '@tiptap/y-tiptap'
import { FileHandler } from '@tiptap/extension-file-handler'
import { handleImageUpload, insertImageFiles, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { ImageUploadNode } from '@/components/tiptap/tiptap-node/image-upload-node'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Pagination } from 'tiptap-a4-pagination'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Typography } from '@tiptap/extension-typography'
import { Youtube } from '@tiptap/extension-youtube'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import { lazyLowlight, loadLowlight } from '@/lib/lowlight-lazy'
import { SlashCommand } from '@/components/tiptap/tiptap-extension/slash-command-extension'
import { SearchReplace } from '@/components/tiptap/tiptap-extension/search-replace-extension'
import { t } from '@/i18n'
import { ImageWrapExtension } from '@/components/tiptap/tiptap-extension/image-wrap-extension'
import { ChecklistExtensions } from '@/components/tiptap/tiptap-extension/checklist-extension'
import { EmojiText } from '@/components/tiptap/tiptap-extension/emoji-text-extension'
import { BorderedTable } from '@/components/tiptap/tiptap-extension/table-border-extension'
import { StyledTableCell, StyledTableHeader } from '@/components/tiptap/tiptap-extension/table-cell-style-extension'
import type { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'
import { WELCOME_CONTENT } from '../welcomeContent'

// Collaboration is opt-in: open the app with ?room=<name> to share a document over WebRTC
const ROOM_NAME = new URLSearchParams(window.location.search).get('room')

// Live cursor of another collaborator
function renderCaret (user: { color?: string, name?: string }): HTMLElement {
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

export function useEditorConfig () {
  const ydoc = useMemo(() => new Y.Doc(), [])

  // y-webrtc (and its WebRTC dependencies) is only downloaded when a room is joined
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)

  useEffect(() => {
    if (!ROOM_NAME) return

    let joined: WebrtcProvider | null = null
    let cancelled = false

    import('y-webrtc').then(({ WebrtcProvider }) => {
      if (cancelled) return
      joined = new WebrtcProvider(ROOM_NAME, ydoc)
      setProvider(joined)
    })

    return () => {
      cancelled = true
      joined?.destroy()
    }
  }, [ydoc])

  // Autosave: keep the document in IndexedDB so a reload does not lose it
  const persistence = useMemo(
    () => new IndexeddbPersistence(ROOM_NAME ? `room:${ROOM_NAME}` : 'document', ydoc),
    [ydoc]
  )

  useEffect(() => {
    return () => {
      persistence.destroy()
      ydoc.destroy()
    }
  }, [persistence, ydoc])
  const extensions = useMemo(
    () => [
      Collaboration.configure({
        document: ydoc
      }),
      TextStyle,
      StarterKit.configure({
        undoRedo: false,
        // Link is configured separately below
        link: false,
        // Replaced by CodeBlockLowlight (syntax highlighting)
        codeBlock: false
      }),
      // Grammars are loaded lazily, see loadLowlight below
      CodeBlockLowlight.configure({ lowlight: lazyLowlight }),
      Subscript,
      Superscript,
      // Smart quotes, dashes, arrows and symbols while typing: -- → —, (c) → ©
      Typography,
      Youtube.configure({ nocookie: true, width: 560, height: 315 }),
      Placeholder.configure({ placeholder: t('editor.placeholder') }),
      CharacterCount,
      SlashCommand,
      SearchReplace,
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
      // Emojis are plain text characters (no image fallback); :shortcode: still works
      EmojiText,
      Color.configure({ types: ['textStyle'] }),
      Link.configure({ openOnClick: false }),
      // The table itself comes from BorderedTable (hide-borders setting + toggle button)
      BorderedTable.configure({
        resizable: true,
        HTMLAttributes: { class: 'tiptap-table' }
      }),
      // Cells with background color and vertical alignment
      StyledTableCell.configure({ HTMLAttributes: { class: 'tiptap-table-cell' } }),
      StyledTableHeader.configure({ HTMLAttributes: { class: 'tiptap-table-header' } }),
      TableKit.configure({
        table: false,
        tableCell: false,
        tableHeader: false,
        tableRow: { HTMLAttributes: { class: 'tiptap-table-row' } }
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
    [ydoc]
  )

  const editor = useEditor({
    extensions,
    autofocus: 'start',
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none'
      }
    }
  })

  // Syntax highlighting grammars, once the page is idle
  useEffect(() => {
    if (!editor) return

    const id = window.setTimeout(() => { loadLowlight(editor) }, 1500)

    return () => window.clearTimeout(id)
  }, [editor])

  // First visit: once the saved document has loaded and turns out empty, show the welcome tour.
  // Only once per browser (clearing the document later keeps it empty), and never in a shared room.
  useEffect(() => {
    if (!editor || ROOM_NAME) return

    const WELCOMED_KEY = 'text-editor-react:welcomed'
    const showWelcome = () => {
      try {
        if (editor.isDestroyed || localStorage.getItem(WELCOMED_KEY)) return
        localStorage.setItem(WELCOMED_KEY, '1')
      } catch {
        return
      }
      if (!editor.isEmpty) return
      editor.commands.setContent(WELCOME_CONTENT)
      // The tour is the starting point, not an edit: the first Ctrl+Z should not wipe it
      yUndoPluginKey.getState(editor.state)?.undoManager.clear()
    }

    if (persistence.synced) showWelcome()
    else persistence.once('synced', showWelcome)
  }, [editor, persistence])

  // When the room provider arrives, add live cursors to the existing editor instead of
  // recreating it, so the document and the undo history stay intact
  useEffect(() => {
    if (!editor || !provider) return

    provider.awareness.setLocalStateField('user', { name: 'User', color: '#f97316' })
    editor.registerPlugin(yCursorPlugin(provider.awareness, {
      cursorBuilder: renderCaret,
      selectionBuilder: defaultSelectionBuilder
    }))

    return () => {
      if (!editor.isDestroyed) editor.unregisterPlugin(yCursorPluginKey)
    }
  }, [editor, provider])

  return editor
}
