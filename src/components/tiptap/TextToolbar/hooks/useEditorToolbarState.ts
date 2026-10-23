import { useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import type { EditorToolbarState } from '../types'

export function useEditorToolbarState (editor: Editor): EditorToolbarState {
  return useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isUnderline: ctx.editor.isActive('underline'),
      canUnderline: ctx.editor.can().chain().toggleUnderline().run(),
      isItalic: ctx.editor.isActive('italic'),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isStrike: ctx.editor.isActive('strike'),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isCode: ctx.editor.isActive('code'),
      canCode: ctx.editor.can().chain().toggleCode().run(),
      isSubscript: ctx.editor.isActive('subscript'),
      isSuperscript: ctx.editor.isActive('superscript'),
      isCodeBlock: ctx.editor.isActive('codeBlock'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      isInTable: ctx.editor.isActive('table'),
      isLink: ctx.editor.isActive('link'),
      hasSelection: !ctx.editor.state.selection.empty,
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run()
    })
  })
}
