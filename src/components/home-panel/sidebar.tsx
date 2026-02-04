import { Link } from 'react-router-dom'
import { Menu } from './menu'
import { useStore } from '@/hooks/use-store'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export function Sidebar () {
  const sidebar = useStore(useSidebar, (x) => x)

  if (!sidebar) return null
  const { getOpenState, setIsHover, settings } = sidebar

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 h-screen bg-white -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
        !getOpenState() ? 'w-[90px]' : 'w-72',
        settings.disabled && 'hidden'
      )}
    >
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className='relative h-full flex flex-col px-3 py-4 overflow-y-auto border-r dark:shadow-zinc-800 scrollbar-hidden'
      >
        <Button
          className={cn('transition-transform ease-in-out duration-300 mb-1')}
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
                'font-bold text-lg whitespace-nowrap text-blue-800 transition-[transform,opacity,display] ease-in-out duration-300',
                !getOpenState()
                  ? '-translate-x-96 opacity-0 hidden'
                  : 'translate-x-0 opacity-100'
              )}
            >
              CẦU PHÀ
            </h1>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  )
}
