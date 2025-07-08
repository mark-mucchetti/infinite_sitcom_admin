import { Link } from 'react-router-dom'
import { useEpisodes } from '@/hooks/useEpisodes'
import { DocumentTextIcon, PlayIcon, EyeIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { formatEpisodeNumber } from '@/utils/formatters'

export default function Scripts() {
  const { episodes, loading } = useEpisodes({ page: 1, limit: 100 })

  const scriptsWithGeneration = episodes.filter(ep => 
    ep.script_generated === true || ep.script_generated === 'true'
  )

  const scriptsPending = episodes.filter(ep => 
    ep.script_generated === false || ep.script_generated === 'false'
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Script Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage script generation and review completed scripts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scripts Generated</dt>
                  <dd className="text-lg font-medium text-gray-900">{scriptsWithGeneration.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Generation</dt>
                  <dd className="text-lg font-medium text-gray-900">{scriptsPending.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Episodes</dt>
                  <dd className="text-lg font-medium text-gray-900">{episodes.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Scripts */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Generated Scripts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Scripts that have been generated and are ready for review
            </p>
            
            {scriptsWithGeneration.length > 0 ? (
              <div className="mt-6 space-y-4">
                {scriptsWithGeneration.map((episode) => (
                  <div key={episode.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {formatEpisodeNumber(episode.season_number, episode.episode_number)} - {episode.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{episode.logline}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link to={`/episodes/${episode.id}/script-review`}>
                        <Button variant="secondary" size="sm">
                          Review Script
                        </Button>
                      </Link>
                      
                      <Link to={`/episodes/${episode.id}/script-generation`}>
                        <Button variant="ghost" size="sm">
                          Regenerate
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scripts generated</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by generating scripts for your episodes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Scripts */}
      {scriptsPending.length > 0 && (
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Script Generation</h3>
              <p className="mt-1 text-sm text-gray-500">
                Episodes that need script generation
              </p>
              
              <div className="mt-6 space-y-4">
                {scriptsPending.map((episode) => (
                  <div key={episode.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {formatEpisodeNumber(episode.season_number, episode.episode_number)} - {episode.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{episode.logline}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link to={`/episodes/${episode.id}/script-generation`}>
                        <Button size="sm">
                          Generate Script
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}