/**
 * Header and footer text, shared by every page. Stored in the Yjs document (map "pageChrome"),
 * so it is saved with the document in IndexedDB and synced to collaborators in a room.
 */
import type { Editor } from '@tiptap/core'
import type * as Y from 'yjs'
import { COPYRIGHT } from '@/config/constants'
import { t } from '@/i18n'

export interface PageChrome {
  header: string
  footer: string
}

export function chromeMap (ydoc: Y.Doc): Y.Map<string> {
  return ydoc.getMap<string>('pageChrome')
}

export function readChrome (ydoc: Y.Doc): PageChrome {
  const map = chromeMap(ydoc)

  return { header: map.get('header') ?? '', footer: map.get('footer') ?? '' }
}

// The Yjs document of an editor using the Collaboration extension
export function editorYdoc (editor: Editor): Y.Doc | null {
  const collaboration = editor.extensionManager.extensions.find((extension) => extension.name === 'collaboration')

  return (collaboration?.options as { document?: Y.Doc } | undefined)?.document ?? null
}

/** Header and footer for exports; an empty footer falls back to the copyright line. */
export function exportChrome (editor: Editor): PageChrome {
  const ydoc = editorYdoc(editor)
  const chrome = ydoc ? readChrome(ydoc) : { header: '', footer: '' }

  return { header: chrome.header, footer: chrome.footer || COPYRIGHT }
}

/** "Page {n} of {total}" in the current language, with the two numbers filled in. */
export function pageLabel (page: string | number, total: string | number): string {
  return t('status.page', { n: page, total })
}
