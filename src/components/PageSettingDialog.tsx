import { useMemo, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select' // shadcn Select [web:2]
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group' // shadcn Radio [web:13]
import { Slider } from '@/components/ui/slider' // shadcn Slider [web:14]
import { Input } from '@/components/ui/input'

interface PageSettings {
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
}

interface PageSettingsDialogProps {
  settings: PageSettings
  onSettingsChange: (settings: PageSettings) => void
}

type MarginPresetKey = 'default' | 'narrow' | 'normal' | 'wide'

const PRESETS: Record<MarginPresetKey, { label: string, mm: number }> = {
  default: { label: 'Mặc định', mm: 25.4 },
  narrow: { label: 'Hẹp', mm: 12.7 },
  normal: { label: 'Vừa', mm: 15 },
  wide: { label: 'Rộng', mm: 31.8 }
}

function applyAllMargins (settings: PageSettings, mm: number): PageSettings {
  return { ...settings, topMargin: mm, bottomMargin: mm, leftMargin: mm, rightMargin: mm }
}

export function PageSettingsDialog ({ settings, onSettingsChange }: PageSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<PageSettings>(settings)
  const [preset, setPreset] = useState<MarginPresetKey>('default')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const commonMargin = useMemo(() => {
    // nếu 4 lề bằng nhau thì show đúng số đó, không thì lấy trung bình cho UX
    const { topMargin, bottomMargin, leftMargin, rightMargin } = localSettings
    const allEqual = topMargin === bottomMargin && topMargin === leftMargin && topMargin === rightMargin

    return allEqual ? topMargin : Math.round((topMargin + bottomMargin + leftMargin + rightMargin) / 4)
  }, [localSettings])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setLocalSettings(settings)
      setPreset('default')
      setShowAdvanced(false)
    }
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalSettings(settings)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings className='w-4 h-4 mr-2' />
          Cài đặt trang
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Cài đặt trang A4</DialogTitle>
        </DialogHeader>

        <div className='grid gap-5 py-2'>
          {/* Orientation */}
          <div className='grid gap-2'>
            <Label>Hướng trang</Label>
            <RadioGroup
              value={localSettings.orientation}
              onValueChange={(v) =>
                setLocalSettings((s) => ({ ...s, orientation: v as PageSettings['orientation'] }))}
              className='flex gap-6'
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='portrait' id='portrait' />
                <Label htmlFor='portrait'>Dọc</Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='landscape' id='landscape' />
                <Label htmlFor='landscape'>Ngang</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preset margins */}
          <div className='grid gap-2'>
            <Label>Lề (chọn nhanh)</Label>
            <Select
              value={preset}
              onValueChange={(v) => {
                const key = v as MarginPresetKey

                setPreset(key)
                setLocalSettings((s) => applyAllMargins(s, PRESETS[key].mm))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn preset lề' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRESETS).map(([k, p]) => (
                  <SelectItem key={k} value={k}>
                    {p.label} ({p.mm}mm)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick tweak */}
          <div className='grid gap-2'>
            <div className='flex items-center justify-between'>
              <Label>Tinh chỉnh nhanh (lề chung): {commonMargin}mm</Label>
              <Button variant='ghost' size='sm' onClick={() => setShowAdvanced((x) => !x)}>
                {showAdvanced ? 'Ẩn chi tiết' : 'Tùy chỉnh chi tiết'}
              </Button>
            </div>

            <Slider
              value={[commonMargin]}
              min={0}
              max={40}
              step={1}
              onValueChange={([v]) => setLocalSettings((s) => applyAllMargins(s, v))}
            />
          </div>

          {/* Advanced (optional) */}
          {showAdvanced && (
            <div className='grid gap-3 rounded-md border p-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='grid gap-1'>
                  <Label htmlFor='topMargin'>Lề trên (mm)</Label>
                  <Input
                    id='topMargin'
                    type='number'
                    value={localSettings.topMargin}
                    onChange={(e) =>
                      setLocalSettings((s) => ({ ...s, topMargin: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className='grid gap-1'>
                  <Label htmlFor='bottomMargin'>Lề dưới (mm)</Label>
                  <Input
                    id='bottomMargin'
                    type='number'
                    value={localSettings.bottomMargin}
                    onChange={(e) =>
                      setLocalSettings((s) => ({ ...s, bottomMargin: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className='grid gap-1'>
                  <Label htmlFor='leftMargin'>Lề trái (mm)</Label>
                  <Input
                    id='leftMargin'
                    type='number'
                    value={localSettings.leftMargin}
                    onChange={(e) =>
                      setLocalSettings((s) => ({ ...s, leftMargin: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className='grid gap-1'>
                  <Label htmlFor='rightMargin'>Lề phải (mm)</Label>
                  <Input
                    id='rightMargin'
                    type='number'
                    value={localSettings.rightMargin}
                    onChange={(e) =>
                      setLocalSettings((s) => ({ ...s, rightMargin: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setLocalSettings(applyAllMargins(localSettings, PRESETS.default.mm))}
            >
              Đặt lại mặc định
            </Button>
            <Button variant='outline' onClick={handleCancel}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
