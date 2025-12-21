import type { PageSettings } from './types'

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  topMargin: 25.4,
  bottomMargin: 25.4,
  leftMargin: 25.4,
  rightMargin: 25.4,
  orientation: 'portrait'
}

export const EDITOR_CLASSES = {
  content: 'tiptap-editor-content focus:outline-none',
  container: 'flex flex-col h-screen bg-gray-200',
  toolbar: 'border-b border-gray-300 bg-white p-3 sticky top-0 z-10 shadow-sm'
} as const
