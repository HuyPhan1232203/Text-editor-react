import { PageSettingsDialog } from '@/components/PageSettingDialog'
import type { PageSettings } from '../types'
import { memo } from 'react'
import { COPYRIGHT, REPO_URL } from '@/config/constants'
import { language, setLanguage, t } from '@/i18n'
import type { Language } from '@/i18n'
import type { Editor } from '@tiptap/react'
import { StatusBar } from './StatusBar'
import { ZoomControl } from './ZoomControl'
import type { Zoom } from '../hooks/useZoom'

interface EditorFooterProps {
  editor: Editor
  pageSettings: PageSettings
  onSettingsChange: (settings: PageSettings) => void
  zoom: Zoom
  scale: number
  onZoomChange: (zoom: Zoom) => void
}

const LANGUAGES: { value: Language, label: string, name: string }[] = [
  { value: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { value: 'en', label: 'EN', name: 'English' }
]

// "A4 · Portrait · Margins 25.4 mm" (one value when all four margins are equal)
function pageSummary ({ orientation, topMargin, bottomMargin, leftMargin, rightMargin }: PageSettings): string {
  const margins = [topMargin, rightMargin, bottomMargin, leftMargin]
  const value = margins.every((margin) => margin === topMargin) ? String(topMargin) : margins.join(' / ')

  return t('page.summaryShort', {
    orientation: orientation === 'portrait' ? t('page.portrait') : t('page.landscape'),
    margins: value
  })
}

/** Status bar: page setup, document counts, zoom and language. */
export const EditorFooter = memo(function EditorFooter ({
  editor,
  pageSettings,
  onSettingsChange,
  zoom,
  scale,
  onZoomChange
}: EditorFooterProps) {
  return (
    <footer className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#E3E5E8] bg-white px-4 py-1.5 text-xs text-[#5F6670]'>
      <div className='flex flex-wrap items-center gap-3'>
        <PageSettingsDialog settings={pageSettings} onSettingsChange={onSettingsChange} />
        <span>{pageSummary(pageSettings)}</span>
      </div>
      <StatusBar editor={editor} pageSettings={pageSettings} />
      <div className='flex flex-wrap items-center gap-3'>
        <ZoomControl zoom={zoom} scale={scale} onZoomChange={onZoomChange} />
        <div role='group' aria-label={t('language.label')} className='flex rounded-md bg-[#EEF0F2] p-0.5'>
          {LANGUAGES.map((item) => (
            <button
              key={item.value}
              type='button'
              aria-pressed={language === item.value}
              title={item.name}
              onClick={() => { if (language !== item.value) setLanguage(item.value) }}
              className={`h-6 rounded px-2 text-xs ${
                language === item.value ? 'bg-white font-medium text-[#1B1D21] shadow-sm' : 'text-[#5F6670] hover:text-[#1B1D21]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a href={REPO_URL} target='_blank' rel='noreferrer' className='text-[#5F6670] hover:text-[#1B1D21]'>
          {COPYRIGHT}
        </a>
      </div>
    </footer>
  )
})
