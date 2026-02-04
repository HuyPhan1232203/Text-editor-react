import { MenuIcon } from 'lucide-react'

import { Menu } from './menu'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '../ui/sheet'
import { cn } from '@/lib/utils'

export function SheetMenu () {
  return (
    <Sheet>
      <SheetTrigger className='lg:hidden' asChild>
        <Button className='h-8' variant='outline' size='icon'>
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:w-72 px-3 h-full flex flex-col' side='left'>
        <SheetHeader>
          <Button
            className='flex justify-center items-center pb-2 pt-1'
            variant='link'
            asChild
          >
            <Link to='/' className='flex items-center gap-2'>
              <div className='flex items-center size-10'>
                <img
                  src='/images/logo/logoOut.svg'
                  width={50}
                  height={50}
                  className='object-fill'
                />
              </div>
              <h1
                className={cn(
                  'font-bold text-lg whitespace-nowrap text-blue-800 transition-[transform,opacity,display] ease-in-out duration-300'
                )}
              >
                TA-I OFFICE
              </h1>
            </Link>
          </Button>
        </SheetHeader>
        <div className='relative h-full flex flex-col  overflow-y-auto  dark:shadow-zinc-800 scrollbar-hidden'>
          <Menu isOpen />
        </div>
      </SheetContent>
    </Sheet>
  )
}
