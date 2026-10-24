import type { Editor } from '@tiptap/react'

export interface TextToolbarProps {
  editor: Editor
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
  isBulletList: boolean
  isOrderedList: boolean
  isTaskList: boolean
  isBlockquote: boolean
  isInTable: boolean
  isLink: boolean
  hasSelection: boolean
  canUndo: boolean
  canRedo: boolean
}
