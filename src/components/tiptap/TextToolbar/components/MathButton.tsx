import { ToolbarButton } from '@/components/ToolbarButton'
import { Plus, Sigma } from 'lucide-react'
import type { ToolbarSectionProps } from '../types'

export function MathButtons ({ editor }: ToolbarSectionProps) {
  const handleInlineMath = () => {
    const latex = prompt('Nhập công thức LaTeX inline (ví dụ: x^2 + y^2 = z^2):')

    if (latex) {
      editor.chain().focus().insertInlineMath({ latex }).run()
    }
  }

  const handleBlockMath = () => {
    const latex = prompt('Nhập công thức LaTeX block (ví dụ: \\frac{a}{b}):')

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
        tooltip='Chèn công thức toán học inline'
      />
      <ToolbarButton
        onClick={handleBlockMath}
        isActive={false}
        disabled={false}
        icon={Plus}
        label='Block Math'
        tooltip='Chèn công thức toán học block'
      />
    </>
  )
}
