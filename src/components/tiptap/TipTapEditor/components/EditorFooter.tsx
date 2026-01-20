import { PageSettingsDialog } from '@/components/PageSettingDialog'
import type { PageSettings } from '../types'
import { memo } from 'react'

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
            Lề: T:{pageSettings.topMargin}mm | P:{pageSettings.rightMargin}mm |
            D:{pageSettings.bottomMargin}mm | T:{pageSettings.leftMargin}mm |
            Hướng:{pageSettings.orientation === 'portrait' ? 'Dọc' : 'Ngang'}
          </div>
        </div>
      </div>
    </div>
  )
})
