import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'

export interface TextToolbarProps {
  editor: Editor
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
  // Zoom box, shown after undo / redo like Google Docs
  zoomControl?: ReactNode
}

export interface ToolbarSectionProps {
  editor: Editor
}

export interface EditorToolbarState {
  isBold: boolean
  canBold: boolean
  isUnderline: boolean
  canUnderline: boolean
  isItalic: boolean
  canItalic: boolean
  isStrike: boolean
  canStrike: boolean
  isCode: boolean
  canCode: boolean
  isSubscript: boolean
  isSuperscript: boolean
  isCodeBlock: boolean
  isBlockquote: boolean
  isInTable: boolean
  isLink: boolean
  hasSelection: boolean
  canUndo: boolean
  canRedo: boolean
}
