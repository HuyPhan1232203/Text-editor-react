import { t } from '@/i18n'

export const HIGHLIGHT_COLORS = [
  { color: '#fef08a', tooltip: t('toolbar.highlightYellow') },
  { color: '#bbf7d0', tooltip: t('toolbar.highlightGreen') },
  { color: '#bfdbfe', tooltip: t('toolbar.highlightBlue') },
  { color: '#fbcfe8', tooltip: t('toolbar.highlightPink') },
  { color: '#fed7aa', tooltip: t('toolbar.highlightOrange') }
] as const

export const TEXT_ALIGNMENTS = [
  { align: 'left', tooltip: t('toolbar.alignLeft') },
  { align: 'center', tooltip: t('toolbar.alignCenter') },
  { align: 'right', tooltip: t('toolbar.alignRight') },
  { align: 'justify', tooltip: t('toolbar.alignJustify') }
] as const
