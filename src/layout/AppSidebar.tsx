/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'

// Assume these icons are imported from an icon library
import { AppPath } from '../constants/Paths'
import { Role } from '../constants/Roles'
import { AppContext } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon
} from '../icons'

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
    subItems: [{ name: 'Ecommerce', path: AppPath.HOME, pro: false, allowedRoles: [Role.ADMIN] }],
    allowedRoles: [Role.ADMIN]
  },
  {
    icon: <CalenderIcon />,
    name: 'Calendar',
    path: AppPath.CALENDAR,
    allowedRoles: [Role.SCHEDULE_MANAGER, Role.BEAUTY_ADVISOR, Role.ADMIN]
  },
  {
    icon: <UserCircleIcon />,
    name: 'User Profile',
    path: AppPath.PROFILE,
    allowedRoles: [Role.ADMIN]
  },
  // {
  //   name: 'Forms',
  //   icon: <ListIcon />,
  //   subItems: [{ name: 'Form Elements', path: AppPath.FORM_ELEMENTS, pro: false, allowedRoles: [Role.ADMIN] }],
  //   allowedRoles: [Role.ADMIN]
  // },
  {
    name: 'Tables',
    icon: <TableIcon />,
    subItems: [
      { name: 'User', path: AppPath.BASIC_TABLES, pro: false, allowedRoles: [Role.ADMIN] },
      { name: 'Order', path: AppPath.BASIC_TABLES_ORDER, pro: false, allowedRoles: [Role.ADMIN, Role.PRODUCT_STAFF] },
      {
        name: 'Product',
        path: AppPath.BASIC_TABLES_PRODUCT,
        pro: false,
        allowedRoles: [Role.ADMIN]
      }
    ],
    allowedRoles: [Role.ADMIN, Role.PRODUCT_STAFF]
  },

  {
    name: 'Patients',
    icon: <UserCircleIcon />,
    path: AppPath.PATIENTS,
    allowedRoles: [Role.SKINCARE_SPECIALIST]
  },

  {
    name: 'Blank',
    icon: <DocsIcon />,
    path: AppPath.BLANK,
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

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: 'Charts',
    subItems: [
      {
        name: 'Line Chart',
        path: AppPath.LINE_CHART,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      },
      {
        name: 'Bar Chart',
        path: AppPath.BAR_CHART,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      }
    ],
    allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
  },
  {
    icon: <BoxCubeIcon />,
    name: 'UI Elements',
    subItems: [
      {
        name: 'Alerts',
        path: AppPath.ALERTS,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      },
      {
        name: 'Avatar',
        path: AppPath.AVATARS,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      },
      { name: 'Badge', path: '/badge', pro: false, allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF] },
      {
        name: 'Buttons',
        path: AppPath.BUTTONS,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      },
      {
        name: 'Images',
        path: AppPath.IMAGES,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      },
      {
        name: 'Videos',
        path: AppPath.VIDEOS,
        pro: false,
        allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
      }
    ],
    allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
  },
  {
    icon: <PlugInIcon />,
    name: 'Authentication',
    subItems: [
      { name: 'Sign In', path: AppPath.SIGN_IN, pro: false },
      { name: 'Sign Up', path: AppPath.SIGN_UP, pro: false }
    ],
    allowedRoles: [Role.ADMIN, Role.CONTENT_STAFF, Role.PRODUCT_STAFF]
  }
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
        <Link to='/'>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className='dark:hidden' src='/images/logo/SPSS.png' alt='Logo' width={50} height={40} />
              <img className='hidden dark:block' src='/images/logo/SPSS.png' alt='Logo' width={50} height={40} />
            </>
          ) : (
            <img src='/images/logo/SPSS.png' alt='Logo' width={32} height={32} />
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
