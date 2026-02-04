import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, Dot, Plus } from 'lucide-react'

import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '../ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

type Submenu = {
  href: string
  label: string
  active?: boolean
}

interface CollapseMenuButtonProps {
  icon: LucideIcon
  label: string
  active: boolean
  submenus: Submenu[]
  isOpen: boolean | undefined
  searchTerm: string
}

export function CollapseMenuButton ({
  icon: Icon,
  label,
  submenus,
  isOpen,
  searchTerm
}: CollapseMenuButtonProps) {
  const location = useLocation()
  const pathname = location.pathname

  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined ? submenu.href === pathname : submenu.active
  )
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    !!(isSubmenuActive || (searchTerm && submenus.length > 0)) // Explicitly convert to boolean
  )

  function highlightText (text: string, searchTerm: string) {
    if (!searchTerm.trim()) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part)
        ? (
          <mark key={index} className='bg-yellow-200 text-black px-[0.2px] rounded'>
            {part}
          </mark>
        )
        : (
          part
        )
    )
  }

  return isOpen
    ? (
      <Collapsible
        open={isCollapsed}
        onOpenChange={setIsCollapsed}
        className='w-full'
      >
        <CollapsibleTrigger
          className='[&[data-state=open]>div>div>svg]:rotate-180 mb-2'
          asChild
        >
          <Button
            variant={isSubmenuActive ? 'secondary' : 'ghost'}
            className='w-full justify-start h-10'
          >
            <div className='w-full items-center flex justify-between'>
              <div className='flex items-center'>
                <span className='mr-4'>
                  <Icon size={18} />
                </span>
                <p
                  className={cn(
                    'max-w-[160px] truncate',
                    isOpen
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-96 opacity-0'
                  )}
                >
                  {label}
                </p>
              </div>
              <div
                className={cn(
                  'whitespace-nowrap',
                  isOpen
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-96 opacity-0'
                )}
              >
                <ChevronDown
                  size={18}
                  className='transition-transform duration-200'
                />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
          {submenus.map(({ href, label, active }, index) => (
            <Button
              key={index}
              variant={active ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start h-10 mb-1 ',
                active && 'bg-secondary font-semibold border-l-4 border-primary'
              )}
              asChild
            >
              <Link to={href}>
                <span className=''>
                  {active
                    ? (
                      <Plus
                        size={18}
                        className='text-primary transition-all duration-300'
                      />
                    )
                    : (
                      <Dot size={18} />
                    )}
                </span>
                <p
                  className={cn(
                    'max-w-[190px]  whitespace-normal break-words',
                    active && 'font-semibold text-primary',
                    isOpen
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-96 opacity-0'
                  )}
                >
                  {highlightText(label, searchTerm)}
                </p>
              </Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
    : (
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSubmenuActive ? 'secondary' : 'ghost'}
                  className='w-full justify-start h-10 mb-1'
                >
                  <div
                    className={`w-full items-center flex  ${
                      isOpen ? ' justify-center' : 'justify-center'
                    }`}
                  >
                    <div className='flex items-center'>
                      <span className={cn(isOpen === false ? '' : 'mr-4')}>
                        <Icon size={18} />
                      </span>
                      {isOpen && (
                        <p
                          className={cn(
                            'max-w-[160px] truncate',
                            isOpen
                              ? 'translate-x-0 opacity-100'
                              : '-translate-x-96 opacity-0'
                          )}
                        >
                          {label}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side='right' align='start' alignOffset={2}>
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side='right' sideOffset={25} align='start'>
          <DropdownMenuLabel className='max-w-[190px] truncate'>
            {label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {submenus.map(({ href, label, active }, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link
                className={`cursor-pointer ${active && 'bg-secondary'}`}
                to={href}
              >
                <p className='max-w-[180px] truncate'>{label}</p>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuArrow className='fill-border' />
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
