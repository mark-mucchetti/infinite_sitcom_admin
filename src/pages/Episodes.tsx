import { useState } from 'react'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useEpisodes } from '@/hooks/useEpisodes'
import { useShows } from '@/hooks/useShows'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import CreateEpisodeForm from '@/components/forms/CreateEpisodeForm'
import { formatDate, formatEpisodeNumber } from '@/utils/formatters'

export default function Episodes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedShow, setSelectedShow] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { episodes, loading, error, total, refetch } = useEpisodes({
    page: 1,
    limit: 20,
    search: searchTerm || undefined,
    show_id: selectedShow || undefined,
    status: selectedStatus || undefined
  })

  const { shows: showOptions } = useShows({ page: 1, limit: 100 })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    refetch()
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading episodes</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Episodes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0 ? `${total} episode${total !== 1 ? 's' : ''} total` : 'Manage your episodes'}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button 
            className="inline-flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Episode
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search episodes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <select
            value={selectedShow}
            onChange={(e) => setSelectedShow(e.target.value)}
            className="input"
          >
            <option value="">All Shows</option>
            {showOptions.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <Button variant="secondary" className="inline-flex items-center justify-center">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : episodes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Episode</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Show</TableHeaderCell>
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
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {episode.logline}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {showOptions.find(s => s.id === episode.show_id)?.name || 'Unknown'}
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
          <EmptyState
            title="No episodes found"
            description="Create your first episode to get started with the AI generation process."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Episode
              </Button>
            }
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Episode"
        size="lg"
      >
        <CreateEpisodeForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}