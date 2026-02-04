import { SidebarToggle } from './sidebar-toggle'
import { SheetMenu } from './sheet-menu'
import { useStore } from '@/hooks/use-store'
import { useSidebar } from '@/hooks/use-sidebar'

const Header = () => {
  const sidebar = useStore(useSidebar, (x) => x)
  // const { user, canAccessAllDepartment } = useSelector(
  //   (state: RootState) => state.auth
  // )

  if (!sidebar) return null
  const { isOpen, toggleOpen } = sidebar
  // const showDepartmentSelector = user?.group?.id === 'admin' && canAccessAllDepartment

  return (
    <header className='sticky top-0 z-40 flex w-full bg-card border-b '>
      <div className='mx-4 flex h-16 w-full items-center justify-between'>
        <div className='flex items-center space-x-4 lg:space-x-4'>
          <SheetMenu />

          <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
        </div>

      </div>
    </header>
  )
}

export default Header
