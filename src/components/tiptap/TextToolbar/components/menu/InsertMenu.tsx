import { useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { ChevronDown, Code2, FileUp, Minus, Plus, Quote, Sigma, SquareSigma, Youtube } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { promptYoutube } from '@/components/tiptap/tiptap-extension/slash-command-extension'
import { DOCX_MIME, importDocx } from '@/utils/importDocx'
import { t } from '@/i18n'
import type { MessageKey } from '@/i18n'

interface InsertItem {
  label: MessageKey
  icon: LucideIcon
  run: (editor: Editor) => void
}

function promptMath (editor: Editor, block: boolean) {
  const latex = window.prompt(t(block ? 'toolbar.blockMathPrompt' : 'toolbar.inlineMathPrompt'))

  if (!latex) return
  if (block) editor.chain().focus().insertBlockMath({ latex }).run()
  else editor.chain().focus().insertInlineMath({ latex }).run()
}

const BLOCKS: InsertItem[] = [
  { label: 'slash.quote', icon: Quote, run: (editor) => editor.chain().focus().toggleBlockquote().run() },
  { label: 'slash.codeBlock', icon: Code2, run: (editor) => editor.chain().focus().toggleCodeBlock().run() },
  { label: 'slash.divider', icon: Minus, run: (editor) => editor.chain().focus().setHorizontalRule().run() }
]

const MEDIA: InsertItem[] = [
  { label: 'toolbar.blockMath', icon: SquareSigma, run: (editor) => promptMath(editor, true) },
  { label: 'toolbar.inlineMath', icon: Sigma, run: (editor) => promptMath(editor, false) },
  { label: 'toolbar.youtube', icon: Youtube, run: (editor) => promptYoutube(editor) }
]

/** "Insert ▾": blocks and media that do not need their own toolbar button, and opening a .docx. */
export function InsertMenu ({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null)

  const openDocx = async (file: File | undefined) => {
    if (!file) return
    try {
      await importDocx(editor, file)
    } catch (error) {
      window.alert(t('docx.importFailed', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const item = ({ label, icon: Icon, run }: InsertItem) => (
    <DropdownMenuItem key={label} onSelect={() => run(editor)}>
      <Icon className='h-4 w-4 text-[#3D434B]' aria-hidden='true' />
      {t(label)}
    </DropdownMenuItem>
  )

  return (
    <>
      <input
        ref={fileRef}
        type='file'
        accept={`.docx,${DOCX_MIME}`}
        className='hidden'
        onChange={(event) => openDocx(event.target.files?.[0])}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='flex h-[34px] items-center gap-1.5 rounded-md bg-[#F1F3F5] pl-2.5 pr-2 text-[13px] font-medium text-[#1B1D21] hover:bg-[#E8EAED]'
          >
            <Plus size={15} strokeWidth={2} aria-hidden='true' />
            {t('toolbar.insert')}
            <ChevronDown size={12} strokeWidth={2} className='text-[#5F6670]' aria-hidden='true' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='min-w-52'>
          {BLOCKS.map(item)}
          <DropdownMenuSeparator />
          {MEDIA.map(item)}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <FileUp className='h-4 w-4 text-[#3D434B]' aria-hidden='true' />
            {t('docx.import')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
