import { Ellipsis, LogOut, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState, useMemo } from 'react'

import { CollapseMenuButton } from './collapse-menu-button'
import { getFilteredMenuList } from './menu-list'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
// import { logout } from '@redux/features/authSlice'

interface MenuProps {
  isOpen: boolean | undefined
}

export function Menu ({ isOpen }: MenuProps) {
  const location = useLocation()
  // const dispatch = useDispatch<AppDispatch>()

  const pathname = location.pathname
  const [searchTerm, setSearchTerm] = useState('')
  // const { user } = useSelector((state: RootState) => state.auth)

  // const userRole = getUserRoleFromUser(user)
  // const permissions = useMemo(
  //   () => (user?.permissions || []).map((p) => p.id),
  //   [user?.permissions]
  // )

  const menuList = useMemo(() => {
    return getFilteredMenuList(pathname)
  }, [pathname])

  const filteredMenuList = useMemo(() => {
    if (!searchTerm.trim()) return menuList

    return menuList
      .map(({ groupLabel, menus }) => ({
        groupLabel,
        menus: menus.filter((menu) => {
          const matchesLabel = menu.label
            .toLowerCase()
            .includes(searchTerm.toLowerCase())

          const matchesSubmenus = menu.submenus?.some((submenu) =>
            submenu.label.toLowerCase().includes(searchTerm.toLowerCase())
          )

          return matchesLabel || matchesSubmenus
        })
      }))
      .filter((group) => group.menus.length > 0)
  }, [menuList, searchTerm])

  return (
    <ScrollArea className='[&>div>div[style]]:!block '>
      <nav className='mt-4 h-full w-full'>
        {/* Search Input */}
        {isOpen && (
          <div className='px-2 mb-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm menu...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 h-9'
              />
            </div>
          </div>
        )}

        <ul className='flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-68px)] items-start space-y-1'>
          {filteredMenuList.map(({ groupLabel, menus }, index) => (
            <li
              className={cn('w-full mx-auto', groupLabel ? 'pt-5' : '')}
              key={index}
            >
              {(isOpen && groupLabel) || isOpen === undefined
                ? (
                  <p className='text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate'>
                    {groupLabel}
                  </p>
                )
                : !isOpen && isOpen !== undefined && groupLabel
                  ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger className='w-full'>
                          <div className='w-full flex justify-center items-center'>
                            <Ellipsis className='h-5 w-5' />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                          <p>{groupLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                  : (
                    <p className='pb-2' />
                  )}
              {menus.map(({ href, label, icon: Icon, active, submenus }, idx) =>
                !submenus || submenus.length === 0
                  ? (
                    <div className='w-full' key={idx}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? 'secondary' : 'ghost'}
                              className={`w-full  h-10 mb-1 ${
                                isOpen === false
                                  ? 'justify-center'
                                  : 'justify-start'
                              }`}
                              asChild
                            >
                              <Link to={href}>
                                <span
                                  className={cn(isOpen === false ? '' : 'mr-4')}
                                >
                                  {Icon ? <Icon size={18} /> : null}
                                </span>
                                {isOpen === false
                                  ? null
                                  : (
                                    <p
                                      className={cn(
                                        'max-w-[200px] truncate',
                                        'translate-x-0 opacity-100' // Simplified since isOpen can't be false here
                                      )}
                                    >
                                      {label}
                                    </p>
                                  )}
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side='right'>{label}</TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                  : (
                    <div className='w-full' key={idx}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active || false}
                        submenus={submenus}
                        isOpen={isOpen}
                        searchTerm={searchTerm}
                      />
                    </div>
                  )
              )}
            </li>
          ))}

          {/* No results message */}
          {searchTerm && filteredMenuList.length === 0 && isOpen && (
            <li className='w-full'>
              <div className='px-4 py-8 text-center text-muted-foreground'>
                <p>Không tìm thấy kết quả</p>
                <p className='text-sm'>Thử tìm kiếm với từ khóa khác</p>
              </div>
            </li>
          )}

          {/* No access message */}
          {!searchTerm && filteredMenuList.length === 0 && isOpen && (
            <li className='w-full'>
              <div className='px-4 py-8 text-center text-muted-foreground'>
                <p>Không có quyền truy cập</p>
                <p className='text-sm'>Liên hệ admin để được cấp quyền</p>
              </div>
            </li>
          )}

          {/* Logout Button */}
          <li className='w-full grow flex items-end'>
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    // onClick={handleLogout}
                    variant='outline'
                    className='w-full justify-center h-10 mt-5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                  >
                    <span className={cn(isOpen === false ? '' : 'mr-4')}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        'whitespace-nowrap',
                        isOpen === false ? 'opacity-0 hidden' : 'opacity-100'
                      )}
                    >
                      Đăng xuất
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side='right'>Đăng xuất</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  )
}
