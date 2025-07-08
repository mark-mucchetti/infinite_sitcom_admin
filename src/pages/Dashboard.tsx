import { useShows } from '@/hooks/useShows'
import { useEpisodes } from '@/hooks/useEpisodes'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Dashboard() {
  const { loading: showsLoading, total: totalShows } = useShows({ page: 1, limit: 100 })
  const { episodes, loading: episodesLoading, total: totalEpisodes } = useEpisodes({ page: 1, limit: 1000 })

  const inProgressCount = episodes.filter(ep => ep.status === 'processing').length

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
              <button className="btn-primary">Create New Show</button>
              <button className="btn-secondary">Generate Episode</button>
              <button className="btn-secondary">View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}