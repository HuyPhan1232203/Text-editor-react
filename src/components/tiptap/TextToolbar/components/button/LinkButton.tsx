import { LinkIcon } from 'lucide-react'
import type { ToolbarSectionProps, EditorToolbarState } from '../../types'
import { ToolbarButton } from '@/components/ToolbarButton'
import { t } from '@/i18n'

interface LinkButtonProps extends ToolbarSectionProps {
  state: EditorToolbarState
}

export function LinkButton ({ editor, state }: LinkButtonProps) {
  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <ToolbarButton
      onClick={handleLinkClick}
      isActive={state.isLink}
      icon={LinkIcon}
      label='Link'
      tooltip={t('toolbar.link')}
    />
  )
}
