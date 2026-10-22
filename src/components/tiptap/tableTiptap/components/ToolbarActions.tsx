import { ToolbarGroup } from '@/components/tiptap/tiptap-ui-primitive/toolbar'
import type { Editor } from '@tiptap/core'
import { TooltipButton } from './TooltipButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { CellVerticalAlign } from '@/components/tiptap/tiptap-extension/table-cell-style-extension'
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Ban,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  PaintBucket,
  PanelTop,
  Rows3,
  TableCellsMerge,
  TableCellsSplit,
  Trash2
} from 'lucide-react'
import { t } from '@/i18n'

interface ToolbarActionProps {
  editor: Editor
  executeWithSelection: (command: () => void) => void
}

const MergeSplitActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  const canMergeCells = editor.can().mergeCells()
  const canSplitCell = editor.can().splitCell()

  return (
    <ToolbarGroup>
      <TooltipButton
        icon={TableCellsMerge}
        tooltip={canMergeCells ? t('table.merge') : t('table.mergeHint')}
        onClick={() => executeWithSelection(() => editor.chain().focus().mergeCells().run())}
        disabled={!canMergeCells}
      />

      <TooltipButton
        icon={TableCellsSplit}
        tooltip={canSplitCell ? t('table.split') : t('table.splitHint')}
        onClick={() => executeWithSelection(() => editor.chain().focus().splitCell().run())}
        disabled={!canSplitCell}
      />
    </ToolbarGroup>
  )
}

const RowActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={BetweenHorizontalStart}
        tooltip={t('table.rowAbove')}
        onClick={() => executeWithSelection(() => editor.chain().focus().addRowBefore().run())}
      />

      <TooltipButton
        icon={BetweenHorizontalEnd}
        tooltip={t('table.rowBelow')}
        onClick={() => executeWithSelection(() => editor.chain().focus().addRowAfter().run())}
      />

      <TooltipButton
        icon={Rows3}
        tooltip={t('table.deleteRow')}
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteRow().run())}
        className='text-red-600'
      />
    </ToolbarGroup>
  )
}

const ColumnActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={BetweenVerticalStart}
        tooltip={t('table.columnLeft')}
        onClick={() => executeWithSelection(() => editor.chain().focus().addColumnBefore().run())}
      />

      <TooltipButton
        icon={BetweenVerticalEnd}
        tooltip={t('table.columnRight')}
        onClick={() => executeWithSelection(() => editor.chain().focus().addColumnAfter().run())}
      />

      <TooltipButton
        icon={Columns3}
        tooltip={t('table.deleteColumn')}
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteColumn().run())}
        className='text-red-600'
      />
    </ToolbarGroup>
  )
}

const CellTypeActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={PanelTop}
        tooltip={t('table.toggleHeader')}
        onClick={() => executeWithSelection(() => editor.chain().focus().toggleHeaderCell().run())}
      />
    </ToolbarGroup>
  )
}

// Light cell backgrounds, similar to the Google Docs palette
const CELL_COLORS = [
  '#f3f4f6', '#e5e7eb', '#fee2e2', '#ffedd5', '#fef9c3',
  '#dcfce7', '#cffafe', '#dbeafe', '#ede9fe', '#fce7f3'
]

const VERTICAL_ALIGNS: { value: CellVerticalAlign, icon: typeof PaintBucket, tooltip: string }[] = [
  { value: 'top', icon: AlignVerticalJustifyStart, tooltip: t('table.alignTop') },
  { value: 'middle', icon: AlignVerticalJustifyCenter, tooltip: t('table.alignMiddle') },
  { value: 'bottom', icon: AlignVerticalJustifyEnd, tooltip: t('table.alignBottom') }
]

const CellStyleActions = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  const setCell = (name: 'backgroundColor' | 'verticalAlign', value: string | null) =>
    executeWithSelection(() => editor.chain().focus().setCellAttribute(name, value).run())

  return (
    <ToolbarGroup>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            aria-label={t('table.background')}
            title={t('table.background')}
            onMouseDown={(e) => e.preventDefault()}
          >
            <PaintBucket className='w-4 h-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-2'
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className='grid grid-cols-5 gap-1.5'>
            {CELL_COLORS.map((color) => (
              <button
                key={color}
                type='button'
                aria-label={t('table.backgroundColor', { color })}
                title={color}
                className='w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform'
                style={{ backgroundColor: color }}
                onClick={() => setCell('backgroundColor', color)}
              />
            ))}
          </div>
          <button
            type='button'
            className='mt-2 flex w-full items-center justify-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
            onClick={() => setCell('backgroundColor', null)}
          >
            <Ban className='w-3.5 h-3.5' /> {t('table.noBackground')}
          </button>
        </PopoverContent>
      </Popover>

      {VERTICAL_ALIGNS.map(({ value, icon, tooltip }) => (
        <TooltipButton
          key={value}
          icon={icon}
          tooltip={tooltip}
          onClick={() => setCell('verticalAlign', value)}
        />
      ))}
    </ToolbarGroup>
  )
}

const DeleteTableAction = ({ editor, executeWithSelection }: ToolbarActionProps) => {
  return (
    <ToolbarGroup>
      <TooltipButton
        icon={Trash2}
        tooltip={t('table.delete')}
        onClick={() => executeWithSelection(() => editor.chain().focus().deleteTable().run())}
        className='text-red-600 hover:text-red-700 hover:bg-red-50'
      />
    </ToolbarGroup>
  )
}

export {
  MergeSplitActions,
  RowActions,
  ColumnActions,
  CellTypeActions,
  CellStyleActions,
  DeleteTableAction
}
