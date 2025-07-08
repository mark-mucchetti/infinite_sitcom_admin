import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useShows } from '@/hooks/useShows'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import CreateShowForm from '@/components/forms/CreateShowForm'
import { formatDate } from '@/utils/formatters'

export default function Shows() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { shows, loading, error, total, refetch } = useShows({
    page: 1,
    limit: 20,
    search: searchTerm || undefined
  })

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
          <p className="text-lg font-medium">Error loading shows</p>
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
            Shows
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0 ? `${total} show${total !== 1 ? 's' : ''} total` : 'Manage your TV shows'}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button 
            className="inline-flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Show
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <Input
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : shows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Year</TableHeaderCell>
                <TableHeaderCell>Format</TableHeaderCell>
                <TableHeaderCell>Setting</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.map((show) => (
                <TableRow key={show.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {show.name}
                  </TableCell>
                  <TableCell>{show.year}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {show.format}
                    </span>
                  </TableCell>
                  <TableCell>{show.geographic_setting}</TableCell>
                  <TableCell>{show.created_at ? formatDate(show.created_at) : `${show.year}`}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No shows found"
            description="Get started by creating your first TV show with AI generation."
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Show
              </Button>
            }
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Show"
        size="lg"
      >
        <CreateShowForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}