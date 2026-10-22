import { PageSettingsDialog } from '@/components/PageSettingDialog'
import type { PageSettings } from '../types'
import { memo } from 'react'
import { COPYRIGHT, REPO_URL } from '@/config/constants'
import { language, setLanguage, t } from '@/i18n'

interface EditorFooterProps {
  pageSettings: PageSettings
  onSettingsChange: (settings: PageSettings) => void
}

export const EditorFooter = memo(function EditorFooter ({
  pageSettings,
  onSettingsChange
}: EditorFooterProps) {
  return (
    <div className='border-t border-gray-300 bg-white p-4 shadow-lg'>
      <div className='flex gap-3 flex-wrap items-center justify-between max-w-7xl mx-auto'>
        <div className='flex gap-3 items-center'>
          <PageSettingsDialog
            settings={pageSettings}
            onSettingsChange={onSettingsChange}
          />
          <div className='text-xs text-gray-500'>
            {t('page.summary', {
              top: pageSettings.topMargin,
              bottom: pageSettings.bottomMargin,
              left: pageSettings.leftMargin,
              right: pageSettings.rightMargin,
              orientation: pageSettings.orientation === 'portrait' ? t('page.portrait') : t('page.landscape')
            })}
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
            title={t('language.switchTitle')}
            className='text-xs font-medium text-gray-700 rounded border border-gray-300 px-2 py-1 hover:bg-gray-100'
          >
            {t('language.switch')}
          </button>
          <a
            href={REPO_URL}
            target='_blank'
            rel='noreferrer'
            className='text-xs text-gray-600 hover:text-gray-900'
          >
            {COPYRIGHT}
          </a>
        </div>
      </div>
    </div>
  )
})
