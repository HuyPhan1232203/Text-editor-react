import type { Editor } from '@tiptap/react'

export interface TextToolbarProps {
  editor: Editor
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
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
  isBlockquote: boolean
  isInTable: boolean
  isLink: boolean
  canUndo: boolean
  canRedo: boolean
}
