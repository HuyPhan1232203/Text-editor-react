import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Settings } from 'lucide-react'

interface PageSettings {
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
}

interface PageSettingsDialogProps {
  settings: PageSettings
  onSettingsChange: (settings: PageSettings) => void
}

export function PageSettingsDialog ({ settings, onSettingsChange }: PageSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [open, setOpen] = useState(false) // ✅ Thêm state để control dialog

  const handleSave = () => {
    onSettingsChange(localSettings)
    setOpen(false) // ✅ Đóng dialog sau khi save
  }

  const handleCancel = () => {
    setLocalSettings(settings) // Reset về settings ban đầu
    setOpen(false) // ✅ Đóng dialog
  }

  // ✅ Sync localSettings khi dialog mở
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setLocalSettings(settings) // Load settings hiện tại khi mở
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}> {/* ✅ Control dialog state */}
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings className='w-4 h-4 mr-2' />
          Cài đặt trang
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-106.25'> {/* ✅ Fix typo: 106.25 → 425px */}
        <DialogHeader>
          <DialogTitle>Cài đặt trang A4</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='topMargin' className='text-right'>
              Lề trên (mm)
            </Label>
            <Input
              id='topMargin'
              type='number'
              value={localSettings.topMargin}
              onChange={(e) => setLocalSettings({ ...localSettings, topMargin: parseFloat(e.target.value) || 0 })}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='bottomMargin' className='text-right'>
              Lề dưới (mm)
            </Label>
            <Input
              id='bottomMargin'
              type='number'
              value={localSettings.bottomMargin}
              onChange={(e) => setLocalSettings({ ...localSettings, bottomMargin: parseFloat(e.target.value) || 0 })}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='leftMargin' className='text-right'>
              Lề trái (mm)
            </Label>
            <Input
              id='leftMargin'
              type='number'
              value={localSettings.leftMargin}
              onChange={(e) => setLocalSettings({ ...localSettings, leftMargin: parseFloat(e.target.value) || 0 })}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='rightMargin' className='text-right'>
              Lề phải (mm)
            </Label>
            <Input
              id='rightMargin'
              type='number'
              value={localSettings.rightMargin}
              onChange={(e) => setLocalSettings({ ...localSettings, rightMargin: parseFloat(e.target.value) || 0 })}
              className='col-span-3'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={handleCancel}> {/* ✅ Đổi từ reset sang cancel */}
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
