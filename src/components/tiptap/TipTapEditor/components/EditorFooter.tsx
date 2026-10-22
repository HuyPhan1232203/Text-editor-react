import { PageSettingsDialog } from '@/components/PageSettingDialog'
import type { PageSettings } from '../types'
import { memo } from 'react'
import { COPYRIGHT, REPO_URL } from '@/config/constants'

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
            Lề trên {pageSettings.topMargin}mm · dưới {pageSettings.bottomMargin}mm ·
            trái {pageSettings.leftMargin}mm · phải {pageSettings.rightMargin}mm ·
            {pageSettings.orientation === 'portrait' ? ' Khổ dọc' : ' Khổ ngang'}
          </div>
        </div>
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
  )
})
