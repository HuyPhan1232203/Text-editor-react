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
import { Comment } from '@/components/tiptap/tiptap-extension/comment-extension'
import { t } from '@/i18n'
import { DocxDrop } from '@/utils/importDocx'
import { openableUrl } from '@/lib/link-url'
import { ImageWrapExtension } from '@/components/tiptap/tiptap-extension/image-wrap-extension'
import { ChecklistExtensions } from '@/components/tiptap/tiptap-extension/checklist-extension'
import { EmojiText } from '@/components/tiptap/tiptap-extension/emoji-text-extension'
import { BorderedTable } from '@/components/tiptap/tiptap-extension/table-border-extension'
import { StyledTableCell, StyledTableHeader } from '@/components/tiptap/tiptap-extension/table-cell-style-extension'
import type { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'
import { WELCOME_CONTENT } from '../welcomeContent'

import { caretMovedAt } from '@/lib/caret-activity'
import { colorFor, rememberRoom, ROOM_KEY, ROOM_NAME, savedUserName, userId } from '@/lib/share'

const LABEL_VISIBLE_MS = 3000

// Live cursor of another collaborator. Inline elements (span), so the caret sits at the
// text position instead of starting a new line
function renderCaret (user: { color?: string, name?: string }, clientId: number): HTMLElement {
  const root = document.createElement('span')

  root.className = 'collaboration-caret'
  // Lets the avatars find this cursor, and the name label flash while this person types
  root.dataset.clientId = String(clientId)
  // The name stays visible for a while after the cursor moved. Checked here too, since
  // ProseMirror may recreate the cursor after the class was set on the old one
  if ((caretMovedAt.get(clientId) ?? 0) + LABEL_VISIBLE_MS > Date.now()) root.classList.add('is-active')
  root.style.color = user.color ?? '#f97316'

  const tooltip = document.createElement('span')

  tooltip.className = 'caret-tooltip'
  tooltip.textContent = user.name ?? 'User'
  tooltip.style.backgroundColor = user.color ?? '#f97316'

  root.appendChild(tooltip)

  return root
}

// In a room with a key, messages from people holding a different key cannot be decrypted;
// y-webrtc then rejects with an OperationError that is expected and harmless
if (ROOM_KEY) {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof DOMException && event.reason.name === 'OperationError') event.preventDefault()
  })
}

export function useEditorConfig () {
  const ydoc = useMemo(() => new Y.Doc(), [])

  // y-webrtc (and its WebRTC dependencies) is only downloaded when a room is joined
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)

  useEffect(() => {
    const room = ROOM_NAME

    if (!room) return

    let joined: WebrtcProvider | null = null
    let cancelled = false

    import('y-webrtc').then(({ WebrtcProvider }) => {
      if (cancelled) return
      // The key from the link encrypts signaling, so only people with the full link can join
      joined = new WebrtcProvider(room, ydoc, { password: ROOM_KEY ?? undefined })
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
      Comment,
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
      DocxDrop,
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
      },
      // Ctrl/Cmd + click opens a link in a new tab (a plain click places the cursor, as in Docs)
      handleClick: (view, pos, event) => {
        if (!event.metaKey && !event.ctrlKey) return false

        const $pos = view.state.doc.resolve(pos)
        // At the start of a link the mark is on the character after the click position
        const link = [...$pos.marks(), ...($pos.nodeAfter?.marks ?? [])].find((mark) => mark.type.name === 'link')
        const url = openableUrl(link?.attrs.href as string | undefined)

        if (!url) return false
        window.open(url, '_blank', 'noopener,noreferrer')
        return true
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

    const name = savedUserName() || t('share.anonymous')

    provider.awareness.setLocalStateField('user', { id: userId(), name, color: colorFor(name) })
    editor.registerPlugin(yCursorPlugin(provider.awareness, {
      cursorBuilder: renderCaret,
      selectionBuilder: defaultSelectionBuilder
    }))

    return () => {
      if (!editor.isDestroyed) editor.unregisterPlugin(yCursorPluginKey)
    }
  }, [editor, provider])

  // Show a collaborator's name for a few seconds whenever their cursor moves, like Google Docs
  useEffect(() => {
    if (!editor || !provider) return

    const { awareness } = provider
    const timers = new Map<number, number>()
    const onChange = ({ added, updated }: { added: number[], updated: number[] }) => {
      for (const clientId of [...added, ...updated]) {
        if (clientId === awareness.clientID) continue

        caretMovedAt.set(clientId, Date.now())
        // The cursor widget is redrawn after this event, so look it up on the next frame
        requestAnimationFrame(() => {
          const caret = editor.view.dom.querySelector(`.collaboration-caret[data-client-id="${clientId}"]`)

          if (!caret) return
          caret.classList.add('is-active')
          window.clearTimeout(timers.get(clientId))
          timers.set(clientId, window.setTimeout(() => {
            editor.view.dom.querySelector(`.collaboration-caret[data-client-id="${clientId}"]`)?.classList.remove('is-active')
          }, LABEL_VISIBLE_MS))
        })
      }
    }

    awareness.on('change', onChange)
    return () => {
      awareness.off('change', onChange)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [editor, provider])

  // Remember this shared document, with its first line as the title, for the Share dialog
  useEffect(() => {
    if (!editor || !ROOM_NAME) return

    let timer = 0
    const save = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const title = editor.state.doc.firstChild?.textContent.trim().slice(0, 80)

        rememberRoom(title || undefined)
      }, 2000)
    }

    rememberRoom()
    editor.on('update', save)
    return () => {
      window.clearTimeout(timer)
      editor.off('update', save)
    }
  }, [editor])

  return { editor, ydoc, provider }
}
