import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useShow } from '@/hooks/useShows'
import { useEpisodes } from '@/hooks/useEpisodes'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import CreateEpisodeForm from '@/components/forms/CreateEpisodeForm'
import { formatDate, formatEpisodeNumber } from '@/utils/formatters'

export default function ShowDetails() {
  const { id } = useParams<{ id: string }>()
  const [showCreateEpisodeModal, setShowCreateEpisodeModal] = useState(false)
  const { show, loading: showLoading, error: showError, refetch: refetchShow } = useShow(id!)
  const { episodes, loading: episodesLoading, error: episodesError, refetch: refetchEpisodes } = useEpisodes({
    show_id: id,
    page: 1,
    limit: 100
  })

  const handleCreateEpisodeSuccess = () => {
    setShowCreateEpisodeModal(false)
    refetchEpisodes()
  }

  if (showError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading show</p>
          <p className="text-sm">{showError}</p>
        </div>
        <Button onClick={refetchShow}>Try Again</Button>
      </div>
    )
  }

  if (showLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!show) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Show not found</p>
        <Link to="/shows">
          <Button className="mt-4">Back to Shows</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link to="/shows" className="mr-4">
            <Button variant="ghost" size="sm" className="inline-flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Shows
            </Button>
          </Link>
        </div>
        
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
              {show.name}
            </h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Year:</span>
                <span className="ml-1">{show.year || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Format:</span>
                <span className="ml-1">{show.format || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Rating:</span>
                <span className="ml-1">{show.content_rating || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
            <Button variant="secondary" className="inline-flex items-center">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Show
            </Button>
            <Button variant="danger" className="inline-flex items-center">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Show
            </Button>
          </div>
        </div>
      </div>

      {/* Show Details */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Show Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Class Setting</dt>
                  <dd className="text-sm text-gray-900">{show.class_setting || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Geographic Setting</dt>
                  <dd className="text-sm text-gray-900">{show.geographic_setting || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Theme</dt>
                  <dd className="text-sm text-gray-900">{show.theme || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{show.created_at ? formatDate(show.created_at) : 'Not available'}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Generation Status</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Episodes</dt>
                  <dd className="text-sm text-gray-900">{episodes.length} episodes</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Characters Generated</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      (show.characters_generated === true || show.characters_generated === 'true')
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(show.characters_generated === true || show.characters_generated === 'true') ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Show Bible Generated</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      (show.bible_generated === true || show.bible_generated === 'true')
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(show.bible_generated === true || show.bible_generated === 'true') ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {show.logline && (
            <div className="mt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Logline</h3>
              <p className="text-sm text-gray-700">{show.logline}</p>
            </div>
          )}
        </div>
      </div>

      {/* Episodes Section */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Episodes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {episodes.length > 0 ? `${episodes.length} episode${episodes.length !== 1 ? 's' : ''}` : 'No episodes yet'}
              </p>
            </div>
            <Button 
              className="inline-flex items-center"
              onClick={() => setShowCreateEpisodeModal(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Episode
            </Button>
          </div>

          {episodesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : episodesError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading episodes: {episodesError}</p>
            </div>
          ) : episodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Episode</TableHeaderCell>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Script</TableHeaderCell>
                  <TableHeaderCell>Audio</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {formatEpisodeNumber(episode.season_number, episode.episode_number)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{episode.title}</div>
                        {episode.logline && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {episode.logline}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={episode.status} />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        (episode.script_generated === true || episode.script_generated === 'true')
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(episode.script_generated === true || episode.script_generated === 'true') ? 'Generated' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        (episode.assets_generated === true || episode.assets_generated === 'true')
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(episode.assets_generated === true || episode.assets_generated === 'true') ? 'Generated' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>{episode.created_at ? formatDate(episode.created_at) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Generate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No episodes created yet</p>
              <Button onClick={() => setShowCreateEpisodeModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Episode
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateEpisodeModal}
        onClose={() => setShowCreateEpisodeModal(false)}
        title="Create New Episode"
        size="lg"
      >
        <CreateEpisodeForm
          onSuccess={handleCreateEpisodeSuccess}
          onCancel={() => setShowCreateEpisodeModal(false)}
          showId={id}
        />
      </Modal>
    </div>
  )
}