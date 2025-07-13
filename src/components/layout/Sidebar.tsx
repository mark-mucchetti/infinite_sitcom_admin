import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  TvIcon,
  FilmIcon,
  UserGroupIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Shows', href: '/shows', icon: TvIcon },
  { name: 'Episodes', href: '/episodes', icon: FilmIcon },
  { name: 'Characters', href: '/characters', icon: UserGroupIcon },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <div className="flex items-center">
          <TvIcon className="h-8 w-8 text-white" />
          <span className="ml-2 text-white text-xl font-bold">WPVI Admin</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive && 'bg-gray-900 text-white'
                )
              }
            >
              <item.icon
                className="text-gray-400 mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}