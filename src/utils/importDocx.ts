/**
 * Word (.docx) import with mammoth, loaded on demand. The document becomes HTML that the
 * editor parses like a paste: headings, lists, tables, links, bold / italic / underline /
 * strike, sub / superscript and images (embedded as data URLs) are kept.
 */
import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ySyncPluginKey, yUndoPluginKey } from '@tiptap/y-tiptap'
import { t } from '@/i18n'
import { chromeMap, editorYdoc } from '@/lib/page-chrome'

export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function isDocxFile (file: File): boolean {
  return file.type === DOCX_MIME || /\.docx$/i.test(file.name)
}

// Word styles mammoth does not map by default
const STYLE_MAP = [
  'u => u',
  'strike => s',
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Quote'] => blockquote > p:fresh",
  "p[style-name='Intense Quote'] => blockquote > p:fresh"
]

export async function docxToHtml (file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, { styleMap: STYLE_MAP })

  return result.value
}

// Another document's header and footer do not belong to the opened one. They are cleared as a
// change the undo manager tracks, so the same Ctrl+Z that restores the content restores them too.
function clearChrome (editor: Editor) {
  const ydoc = editorYdoc(editor)
  const undoManager = yUndoPluginKey.getState(editor.state)?.undoManager

  if (!ydoc) return

  const map = chromeMap(ydoc)

  if (!map.size) return
  undoManager?.addToScope(map)
  ydoc.transact(() => map.clear(), ySyncPluginKey)
}

/** Replaces the document with the .docx (one undo step), or inserts it at `position`. */
export async function importDocx (editor: Editor, file: File, position?: number): Promise<void> {
  const html = await docxToHtml(file)

  if (editor.isDestroyed) return
  if (position === undefined) {
    editor.chain().focus('start').setContent(html, { emitUpdate: true }).run()
    clearChrome(editor)
  } else {
    editor.chain().focus().insertContentAt(position, html).run()
  }
}

/**
 * Dropping a Word document onto the page inserts it where it lands. Files are recognized by
 * extension too, since some systems give .docx files an empty or generic MIME type.
 */
export const DocxDrop = Extension.create({
  name: 'docxDrop',

  addProseMirrorPlugins () {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey('docxDrop'),
        props: {
          handleDrop: (view, event) => {
            const file = Array.from(event.dataTransfer?.files ?? []).find(isDocxFile)

            if (!file) return false
            event.preventDefault()

            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? editor.state.selection.from

            importDocx(editor, file, pos).catch((error: unknown) => {
              const message = error instanceof Error ? error.message : 'Unknown error'

              window.alert(t('docx.importFailed', { error: message }))
            })
            return true
          }
        }
      })
    ]
  }
})
