import {
  Users,
  FileText,
  Shield,
  Wrench,
  Archive,
  Lightbulb,
  LayoutGrid,
  type LucideIcon,
  FolderCheck
} from 'lucide-react'

interface Submenu {
  href: string
  label: string
  active?: boolean
}

interface Menu {
  href: string
  label: string
  icon: LucideIcon
  submenus?: Submenu[]
  active?: boolean
}

interface Group {
  groupLabel: string
  menus: Menu[]
}

export function getMenuList (pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/',
          label: 'Trang Chủ',
          icon: LayoutGrid,
          active: pathname === '/'
        },
        // Biểu mẫu và hạng mục
        {
          href: '',
          label: 'Biểu mẫu và hạng mục',
          icon: FileText,
          active:
            pathname.includes('/quan-ly-bieu-mau')
            || pathname.includes('/quan-ly-quy-trinh')
            || pathname.includes('/quan-ly-loai-hang-muc')
            || pathname.includes('/quan-ly-dau-muc')
            || pathname.includes('/quan-ly-hang-muc'),
          submenus: [
            {
              href: '/quan-ly-bieu-mau',
              label: 'Quản lý biểu mẫu',
              active: pathname.includes('/quan-ly-bieu-mau')
            },
            {
              href: '/quan-ly-quy-trinh',
              label: 'Quản lý quy trình biểu mẫu',
              active: pathname.includes('/quan-ly-quy-trinh')
            },
            {
              href: '/quan-ly-loai-hang-muc',
              label: 'Quản lý nhóm hạng mục',
              active: pathname.includes('/quan-ly-loai-hang-muc')
            },
            {
              href: '/quan-ly-dau-muc',
              label: 'Quản lý đầu mục',
              active: pathname.includes('/quan-ly-dau-muc')
            },
            {
              href: '/quan-ly-hang-muc',
              label: 'Quản lý hạng mục',
              active: pathname.includes('/quan-ly-hang-muc')
            }
          ]
        },
        // Quản lý hồ sơ đầu vào
        {
          href: '',
          label: 'Quản lý hồ sơ đầu vào',
          icon: FolderCheck,
          active:
            pathname.includes('/quan-ly-ho-so-phap-ly')
            || pathname.includes('/quan-ly-hop-dong')
            || pathname.includes('/quan-ly-cong-trinh')
            || pathname.includes('/quan-ly-danh-muc-hang-muc'),
          submenus: [
            {
              href: '/quan-ly-ho-so-phap-ly',
              label: 'Hồ sơ pháp lý',
              active: pathname.includes('/quan-ly-ho-so-phap-ly')
            },
            {
              href: '/quan-ly-hop-dong',
              label: 'Hợp đồng (xem bảng giá)',
              active: pathname.includes('/quan-ly-hop-dong')
            },
            {
              href: '/quan-ly-cong-trinh',
              label: 'Danh mục các công trình cầu',
              active: pathname.includes('/quan-ly-cong-trinh')
            },
            {
              href: '/quan-ly-danh-muc-hang-muc',
              label: 'Danh mục hạng mục bảng giá',
              active: pathname.includes('/quan-ly-danh-muc-hang-muc')
            }
          ]
        },
        // Kế hoạch đề xuất
        {
          href: '',
          label: 'Kế hoạch đề xuất',
          icon: Wrench,
          active:
            pathname.includes('/cong-tac-quan-ly')
            || pathname.includes('/cong-tac-cau-DVC')
            || pathname.includes('/quan-ly-ke-hoach-de-xuat')
            || pathname.includes('/quan-ly-bao-cao-tuan-tra'),
          submenus: [
            {
              href: '/cong-tac-quan-ly',
              label: 'Công tác Quản lý Cầu & ĐVC',
              active: pathname.includes('/cong-tac-quan-ly')
            },
            {
              href: '/cong-tac-cau-DVC',
              label: 'Công tác Vệ sinh Cầu & ĐVC',
              active: pathname.includes('/cong-tac-cau-DVC')
            },
            {
              href: '/quan-ly-ke-hoach-de-xuat',
              label: 'Công tác Bảo dưỡng Cầu & ĐVC',
              active: pathname.includes('/quan-ly-ke-hoach-de-xuat')
            }
          ]
        },
        // Khối lượng
        {
          href: '',
          label: 'Khối lượng',
          icon: Archive,
          active:
            pathname.includes('/khoi-luong-chi-tiet_de-xuat')
            || pathname.includes('/khoi-luong-chi-tiet_ve-sinh')
            || pathname.includes('/khoi-luong-chi-tiet_cong-viec')
            || pathname.includes('/khoi-luong-chi-tiet_theo-quy'),
          submenus: [
            {
              href: '/khoi-luong-chi-tiet_de-xuat',
              label: 'Tổng quát (1 = 2 + 3)',
              active: pathname.includes('/khoi-luong-chi-tiet_de-xuat')
            },
            {
              href: '/khoi-luong-chi-tiet_ve-sinh',
              label: 'Vệ sinh (2)',
              active: pathname.includes('/khoi-luong-chi-tiet_ve-sinh')
            },
            {
              href: '/khoi-luong-chi-tiet_cong-viec',
              label: 'Công việc (3)',
              active: pathname.includes('/khoi-luong-chi-tiet_cong-viec')
            },
            {
              href: '/khoi-luong-chi-tiet_theo-quy',
              label: 'Tổng hợp',
              active: pathname.includes('/khoi-luong-chi-tiet_theo-quy')
            }
          ]
        },
        // Hồ sơ quản lý chất lượng
        {
          href: '',
          label: 'Hồ sơ quản lý chất lượng',
          icon: Shield,
          active:
            pathname.includes('/quan-ly-ho-so-kcs')
            || pathname.includes('/quan-ly-cong-trinh-sau-thi-cong')
            || pathname.includes('/quan-ly-hinh-anh'),
          submenus: [
            {
              href: '/quan-ly-ho-so-kcs',
              label: 'Quản lý hồ sơ hoàn công (KCS)',
              active: pathname.includes('/quan-ly-ho-so-kcs')
            },
            {
              href: '/quan-ly-bao-cao-tuan-tra',
              label: 'Báo cáo tuần tra',
              active: pathname.includes('/quan-ly-bao-cao-tuan-tra')
            }
          ]
        },
        // Hệ thống
        {
          href: '',
          label: 'Hệ thống',
          icon: Users,
          active:
            pathname.includes('/quan-ly-nha-dau-tu')
            || pathname.includes('/quan-ly-nhan-su')
            || pathname.includes('/phuong'),
          submenus: [
            {
              href: '/quan-ly-goi-thau',
              label: 'Quản lý gói thầu',
              active: pathname.includes('/quan-ly-goi-thau')
            },
            {
              href: '/quan-ly-nha-dau-tu',
              label: 'Quản lý nhà đầu tư',
              active: pathname.includes('/quan-ly-nha-dau-tu')
            },
            {
              href: '/quan-ly-nhan-su',
              label: 'Nhân sự',
              active: pathname.includes('/quan-ly-nhan-su')
            },
            {
              href: '/quan-ly-can-bo',
              label: 'Cán bộ',
              active: pathname.includes('/quan-ly-can-bo')
            },
            {
              href: '/quan-ly-chuc-vu',
              label: 'Chức vụ',
              active: pathname.includes('/quan-ly-chuc-vu')
            },
            {
              href: '/quan-ly-nhom-nhan-su',
              label: 'Nhóm nhân sự',
              active: pathname.includes('/quan-ly-nhom-nhan-su')
            },
            {
              href: '/quan-ly-phong-ban',
              label: 'Phòng ban',
              active: pathname.includes('/quan-ly-phong-ban')
            },
            {
              href: '/phuong',
              label: 'Danh sách Phường',
              active: pathname === '/phuong'
            }
          ]
        },
        // Tiện ích
        {
          href: '',
          label: 'Tiện ích',
          icon: Lightbulb,
          active: pathname.includes('/xu-ly-anh'),
          submenus: [
            {
              href: '/xu-ly-anh',
              label: 'Xử lý ảnh',
              active: pathname.includes('/xu-ly-anh')
            }
          ]
        }
      ]
    }
  ]
}

export function getUserRoleFromUser (user: any): string {
  if (!user) return 'giamdocxinghiep'
  if (user.group?.id === 'admin') return 'admin'

  return (user.group?.id || 'giamdocxinghiep').replace(/\d+$/, '')
}

export function hasAnyRole (
  userRole: string | undefined | null,
  requiredRoles?: string[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true

  if (!userRole) return false

  return requiredRoles.includes(userRole)
}

/**
 * Lọc menu dựa trên role của user
 */
export function getFilteredMenuList (
  pathname: string,
  userRole: string = 'admin',
  userPermissions: string[] = []
): Group[] {
  return getMenuList(pathname)
}
