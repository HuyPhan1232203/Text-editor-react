import { Outlet } from 'react-router-dom'
import { useStore } from './hooks/use-store'
import { useSidebar } from './hooks/use-sidebar'
import { Sidebar } from './components/home-panel/sidebar'
import { cn } from './lib/utils'
import Header from './components/home-panel/Header'

export default function App () {
  const sidebar = useStore(useSidebar, (x) => x)

  if (!sidebar) return null
  const { getOpenState, settings } = sidebar

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          'min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300',
          !settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72')
        )}
      >
        <Header />
        <div className='px-4 pb-8 pt-5 '>
          <Outlet />
        </div>
      </main>
    </>
  )
}
