import { useShows } from '@/hooks/useShows'
import { useEpisodes } from '@/hooks/useEpisodes'
import { Link } from 'react-router-dom'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { PlusIcon, DocumentTextIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { loading: showsLoading, total: totalShows } = useShows({ page: 1, limit: 100 })
  const { episodes, loading: episodesLoading, total: totalEpisodes } = useEpisodes({ page: 1, limit: 1000 })

  // Count episodes that are partially complete (have script but no audio)
  const inProgressCount = episodes.filter(ep => 
    (ep.script_generated === true || ep.script_generated === 'true') &&
    (ep.assets_generated !== true && ep.assets_generated !== 'true')
  ).length

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">S</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Shows</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {showsLoading ? <LoadingSpinner size="sm" /> : totalShows}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">E</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Episodes</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {episodesLoading ? <LoadingSpinner size="sm" /> : totalEpisodes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {episodesLoading ? <LoadingSpinner size="sm" /> : inProgressCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started with common tasks
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/shows">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Manage Shows
                </Button>
              </Link>
              <Link to="/episodes">
                <Button variant="secondary" className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Manage Episodes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Episodes */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Episodes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Latest episodes and their generation status
            </p>
            
            <div className="mt-4">
              {episodesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : episodes.length > 0 ? (
                <div className="space-y-3">
                  {episodes.slice(0, 3).map((episode) => (
                    <div key={episode.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{episode.title}</h4>
                        <p className="text-xs text-gray-500">
                          S{episode.season_number}E{episode.episode_number} • {episode.logline?.substring(0, 60)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Script Status */}
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className={`text-xs ${
                            episode.script_generated === 'true' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {episode.script_generated === 'true' ? 'Script' : 'No Script'}
                          </span>
                        </div>
                        
                        {/* Audio Status */}
                        <div className="flex items-center">
                          <SpeakerWaveIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className={`text-xs ${
                            episode.assets_generated === 'true' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {episode.assets_generated === 'true' ? 'Audio' : 'No Audio'}
                          </span>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex space-x-1">
                          <Link to={`/episodes/${episode.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No episodes found. Create your first episode to get started!</p>
                </div>
              )}
              
              {episodes.length > 3 && (
                <div className="mt-4 text-center">
                  <Link to="/episodes">
                    <Button variant="secondary">View All Episodes</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}