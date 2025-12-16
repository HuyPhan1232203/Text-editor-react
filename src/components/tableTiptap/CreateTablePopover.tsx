import React, { useState } from 'react'

import { TABLE_DEFAULT_SELECTED_GRID_SIZE, TABLE_INIT_GRID_SIZE, TABLE_MAX_GRID_SIZE } from './constants'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { isMobile } from '@/utils/is-mobile'

const createArray = (length: number) =>
  Array.from({ length }).map((_, index) => index + 1)

interface IPropsCreateTablePopover {
  createTable: (payload: CreateTablePayload) => void
  children: React.ReactNode
}

export interface GridSize {
  rows: number
  cols: number
}

export interface CreateTablePayload extends GridSize {
  withHeaderRow: boolean
}

function CreateTablePopover (props: IPropsCreateTablePopover) {
  const [withHeaderRow, setWithHeaderRow] = useState<boolean>(true)
  const [tableGridSize, setTableGridSize] = useState<GridSize>({
    rows: isMobile() ? TABLE_MAX_GRID_SIZE : TABLE_INIT_GRID_SIZE,
    cols: isMobile() ? TABLE_MAX_GRID_SIZE : TABLE_INIT_GRID_SIZE
  })

  const [selectedTableGridSize, setSelectedTableGridSize] = useState<GridSize>({
    rows: TABLE_DEFAULT_SELECTED_GRID_SIZE,
    cols: TABLE_DEFAULT_SELECTED_GRID_SIZE
  })

  const [isOpen, setIsOpen] = useState(false)

  function selectTableGridSize (rows: number, cols: number): void {
    if (rows === tableGridSize.rows) {
      setTableGridSize((prev) => {
        return {
          ...prev,
          rows: Math.min(rows + 1, TABLE_MAX_GRID_SIZE)
        }
      })
    }

    if (cols === tableGridSize.cols) {
      setTableGridSize((prev) => {
        return {
          ...prev,
          cols: Math.min(cols + 1, TABLE_MAX_GRID_SIZE)
        }
      })
    }

    setSelectedTableGridSize({
      rows,
      cols
    })
  }

  function onMouseDown (rows: number, cols: number) {
    props.createTable({ rows, cols, withHeaderRow })
    setIsOpen(false)
    resetTableGridSize()
  }

  function resetTableGridSize (): void {
    setWithHeaderRow(true)

    setTableGridSize({
      rows: TABLE_INIT_GRID_SIZE,
      cols: TABLE_INIT_GRID_SIZE
    })

    setSelectedTableGridSize({
      rows: TABLE_DEFAULT_SELECTED_GRID_SIZE,
      cols: TABLE_DEFAULT_SELECTED_GRID_SIZE
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>

      <PopoverContent align='start' className='w-full p-3' side='bottom'>
        <div className='space-y-4'>
          {/* Table grid selector */}
          <div className='table-grid-size-editor p-0'>
            <div className='flex flex-col flex-wrap justify-between gap-1'>
              {createArray(tableGridSize?.rows)?.map((row: number) => {
                return (
                  <div className='flex gap-1' key={`r-${row}`}>
                    {createArray(tableGridSize?.cols)?.map((col: number) => {
                      const isSelected = col <= selectedTableGridSize.cols
                        && row <= selectedTableGridSize.rows

                      return (
                        <div
                          key={`c-${col}`}
                          onMouseDown={() => onMouseDown(row, col)}
                          onMouseOver={() => selectTableGridSize(row, col)}
                          className={`cursor-pointer rounded-sm border transition-colors ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className='box-border w-4 h-4 rounded-sm border border-solid p-0.5' />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className='mt-2 text-center text-sm text-zinc-600'>
              {selectedTableGridSize.rows} × {selectedTableGridSize.cols}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CreateTablePopover
