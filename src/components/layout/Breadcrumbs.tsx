import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

interface BreadcrumbItem {
  name: string
  href: string
  current: boolean
}

const routeMap: Record<string, string> = {
  '/': 'Dashboard',
  '/shows': 'Shows',
  '/episodes': 'Episodes',
  '/characters': 'Characters',
  '/scripts': 'Scripts',
  '/audio': 'Audio',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Dashboard', href: '/', current: pathnames.length === 0 }
  ]

  pathnames.forEach((pathname, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`
    const isLast = index === pathnames.length - 1
    
    breadcrumbs.push({
      name: routeMap[href] || pathname.charAt(0).toUpperCase() + pathname.slice(1),
      href,
      current: isLast
    })
  })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {breadcrumbs.slice(1).map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
              <Link
                to={page.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={page.current ? 'page' : undefined}
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}