import { ToolbarButton } from '@/components/ToolbarButton'
import { Plus, Sigma } from 'lucide-react'
import type { ToolbarSectionProps } from '../../types'
import { t } from '@/i18n'

export function MathButtons ({ editor }: ToolbarSectionProps) {
  const handleInlineMath = () => {
    const latex = prompt(t('toolbar.inlineMathPrompt'))

    if (latex) {
      editor.chain().focus().insertInlineMath({ latex }).run()
    }
  }

  const handleBlockMath = () => {
    const latex = prompt(t('toolbar.blockMathPrompt'))

    if (latex) {
      editor.chain().focus().insertBlockMath({ latex }).run()
    }
  }

  return (
    <>
      <ToolbarButton
        onClick={handleInlineMath}
        isActive={false}
        disabled={false}
        icon={Sigma}
        label='Inline Math'
        tooltip={t('toolbar.inlineMath')}
      />
      <ToolbarButton
        onClick={handleBlockMath}
        isActive={false}
        disabled={false}
        icon={Plus}
        label='Block Math'
        tooltip={t('toolbar.blockMath')}
      />
    </>
  )
}
