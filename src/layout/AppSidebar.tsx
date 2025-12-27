/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'

// Assume these icons are imported from an icon library
import { AppPath } from '../constants/Paths'
import { Role, roleRedirectPath } from '../constants/Roles'
import { AppContext } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { CalenderIcon, ChevronDownIcon, DocsIcon, GridIcon, HorizontaLDots, TableIcon } from '../icons'
import { FileText } from 'lucide-react'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; allowedRoles?: Role[] }[]
  allowedRoles?: Role[]
}

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    subItems: [
      { name: 'Ecommerce', path: AppPath.HOME, pro: false, allowedRoles: [Role.ADMIN, Role.STORE_STAFF] },
      {
        name: 'Appoiments',
        path: AppPath.DASHBOARD_APPOINTMENTS,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.BEAUTY_ADVISOR]
      }
    ],
    allowedRoles: [Role.ADMIN, Role.BEAUTY_ADVISOR, Role.STORE_STAFF]
  },
  {
    icon: <CalenderIcon />,
    name: 'Calendar',
    path: AppPath.CALENDAR,
    allowedRoles: [Role.SCHEDULE_MANAGER, Role.BEAUTY_ADVISOR, Role.ADMIN]
  },

  {
    name: 'Tables',
    icon: <TableIcon />,
    subItems: [
      { name: 'User', path: AppPath.BASIC_TABLES, pro: false, allowedRoles: [Role.ADMIN] },

      { name: 'Order', path: AppPath.BASIC_TABLES_ORDER, pro: false, allowedRoles: [Role.ADMIN, Role.STORE_STAFF] },
      {
        name: 'Product',
        path: AppPath.BASIC_TABLES_PRODUCT,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.STORE_STAFF]
      },
      {
        name: 'Service',
        path: AppPath.BASIC_TABLES_SERVICE,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.SCHEDULE_MANAGER]
      },
      {
        name: 'Registration',

        path: AppPath.BASIC_TABLES_REGISTRATION,
        allowedRoles: [Role.BEAUTY_ADVISOR, Role.ADMIN, Role.SCHEDULE_MANAGER]
      },
      {
        name: 'Room',

        path: AppPath.BASIC_TABLES_ROOM,
        allowedRoles: [Role.ADMIN, Role.SCHEDULE_MANAGER]
      },

      {
        name: 'Brand',

        path: AppPath.BASIC_TABLES_BRAND,
        allowedRoles: [Role.ADMIN, Role.STORE_STAFF]
      },

      {
        name: 'Countries',

        path: AppPath.BASIC_TABLES_COUNTRIES,
        allowedRoles: [Role.ADMIN]
      },

      {
        name: 'Voucher',

        path: AppPath.BASIC_TABLES_VOUCHER,
        allowedRoles: [Role.ADMIN]
      },

      {
        name: 'Category',

        path: AppPath.BASIC_TABLES_CATEGORY,
        allowedRoles: [Role.ADMIN, Role.STORE_STAFF]
      },

      {
        name: 'SkinCondition',

        path: AppPath.BASIC_TABLES_SKINCONDITION,
        allowedRoles: [Role.ADMIN]
      },

      {
        name: 'SkinType',

        path: AppPath.BASIC_TABLES_SKINTYPE,
        allowedRoles: [Role.ADMIN]
      },

      {
        name: 'Variation',

        path: AppPath.BASIC_TABLES_VARIATION,
        allowedRoles: [Role.ADMIN, Role.STORE_STAFF]
      },
      {
        name: 'Transaction',

        path: AppPath.BASIC_TABLES_TRANSACTION,
        allowedRoles: [Role.ADMIN]
      },
      {
        name: 'Slot',

        path: AppPath.BASIC_TABLES_SLOT,
        allowedRoles: [Role.SCHEDULE_MANAGER, Role.ADMIN]
      },

      {
        name: 'Template',

        path: AppPath.BASIC_TABLES_TEMPLATE,
        allowedRoles: [Role.SCHEDULE_MANAGER, Role.ADMIN]
      },

      {
        name: 'Schedule',

        path: AppPath.BASIC_TABLES_SHEDULES,
        allowedRoles: [Role.SCHEDULE_MANAGER, Role.ADMIN, Role.BEAUTY_ADVISOR]
      },

      {
        name: 'Holidays',

        path: AppPath.BASIC_TABLES_HOLIDAY,
        allowedRoles: [Role.SCHEDULE_MANAGER, Role.ADMIN]
      }
    ]
    // allowedRoles: [Role.ADMIN]
  },

  {
    name: 'Blogs',
    icon: <DocsIcon />,
    path: AppPath.BLOGS,
    allowedRoles: [Role.ADMIN]
  },

  {
    name: 'Quizs',
    icon: <FileText />,
    path: AppPath.QUIZZS,
    allowedRoles: [Role.ADMIN]
  }

  // {
  //   name: 'Pages',
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: 'Blank Page', path: AppPath.BLANK, pro: false, allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF] },
  //     { name: '404 Error', path: AppPath.NOT_FOUND, pro: false, allowedRoles: [Role.ADMIN] }
  //   ],
  //   allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF]
  // }
]

const AppSidebar: React.FC = () => {
  const { profile } = useContext(AppContext)

  const userRole = (profile?.role as Role) || Role.ADMIN
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const location = useLocation()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others'
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  const filterByRole = (items: NavItem[]): NavItem[] =>
    items
      .filter((item) => !item.allowedRoles || item.allowedRoles.includes(userRole))
      .map((item) => ({
        ...item,
        subItems: item.subItems?.filter((sub) => !sub.allowedRoles || sub.allowedRoles.includes(userRole))
      }))

  // Lấy đường dẫn dựa trên role, nếu chưa login thì mặc định về trang chủ hoặc login
  const homePath = profile ? roleRedirectPath(profile.role) : '/'

  // useEffect(() => {
  //   let submenuMatched = false
  //   ;['main', 'others'].forEach((menuType) => {
  //     const items = menuType === 'main' ? navItems : othersItems
  //     items.forEach((nav, index) => {
  //       if (nav.subItems) {
  //         nav.subItems.forEach((subItem) => {
  //           if (isActive(subItem.path)) {
  //             setOpenSubmenu({
  //               type: menuType as 'main' | 'others',
  //               index
  //             })
  //             submenuMatched = true
  //           }
  //         })
  //       }
  //     })
  //   })

  //   if (!submenuMatched) {
  //     setOpenSubmenu(null)
  //   }
  // }, [location, isActive])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
    <ul className='flex flex-col gap-4'>
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className='menu-item-text'>{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? 'rotate-180 text-brand-500' : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'}`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className='menu-item-text'>{nav.name}</span>}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className='overflow-hidden transition-all duration-300'
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px'
              }}
            >
              <ul className='mt-2 space-y-1 ml-9'>
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className='flex items-center gap-1 ml-auto'>
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link to={homePath} className='flex items-center gap-3'>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className='flex items-center gap-3'>
                {/* Logo Group */}
                <div className='flex items-center justify-center h-8 w-auto'>
                  <img
                    className='h-full w-auto block dark:hidden object-contain'
                    src='/images/logo/SPSS.png'
                    alt='Logo'
                  />
                  <img
                    className='h-full w-auto hidden dark:block object-contain'
                    src='/images/logo/SPSS.png'
                    alt='Logo'
                  />
                </div>

                {/* Website Name - Chỉ hiện khi Sidebar mở hoặc trên Mobile */}
                <span className='text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap'>
                  Glowly
                </span>
              </div>
            </>
          ) : (
            /* Khi Sidebar thu gọn: Chỉ hiện Logo nhỏ */
            <div className='flex items-center justify-center h-8 w-8'>
              <img src='/images/logo/SPSS.png' alt='Logo' className='h-full w-full object-contain' />
            </div>
          )}
        </Link>
      </div>
      <div className='flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
        <nav className='mb-6'>
          <div className='flex flex-col gap-4'>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? 'Menu' : <HorizontaLDots className='size-6' />}
              </h2>
              {renderMenuItems(filterByRole(navItems), 'main')}
            </div>
            {/* <div className=''>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? 'Others' : <HorizontaLDots />}
              </h2>
              {renderMenuItems(filterByRole(othersItems), 'others')}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  )
}

export default AppSidebar
