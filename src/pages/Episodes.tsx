import { useState } from 'react'
import { PlusIcon, FunnelIcon, SparklesIcon, PencilIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
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
import CreateEpisodeAIForm from '@/components/forms/CreateEpisodeAIForm'
import { formatDate, formatEpisodeNumber } from '@/utils/formatters'
import { episodesApi } from '@/services/episodes'
import { useUIStore } from '@/store/ui'

export default function Episodes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedShow, setSelectedShow] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showManualCreateModal, setShowManualCreateModal] = useState(false)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null)
  const [auditData, setAuditData] = useState<any>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const { episodes, loading, error, total, refetch, setParams } = useEpisodes({
    page: 1,
    limit: 20,
    search: searchTerm || undefined,
    show_id: selectedShow || undefined,
    status: selectedStatus || undefined
  })

  const { shows: showOptions } = useShows({ page: 1, limit: 100 })
  const { showToast } = useUIStore()

  const handleAudit = async (episode: any) => {
    setSelectedEpisode(episode)
    setIsAuditing(true)
    setShowAuditModal(true)
    
    try {
      const response = await episodesApi.audit(episode.id)
      setAuditData(response)
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Audit Failed',
        message: error.message || 'Failed to audit episode'
      })
      setShowAuditModal(false)
    } finally {
      setIsAuditing(false)
    }
  }

  const handleFinalize = async () => {
    if (!selectedEpisode) return
    
    setIsFinalizing(true)
    try {
      const response = await episodesApi.finalize(selectedEpisode.id)
      showToast({
        type: 'success',
        title: 'Episode Finalized',
        message: response.data?.message || 'Episode has been finalized successfully'
      })
      setShowAuditModal(false)
      refetch()
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Finalization Failed',
        message: error.message || 'Failed to finalize episode'
      })
    } finally {
      setIsFinalizing(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setParams({
      page: 1,
      limit: 20,
      search: value || undefined,
      show_id: selectedShow || undefined,
      status: selectedStatus || undefined
    })
  }

  const handleShowFilter = (showId: string) => {
    setSelectedShow(showId)
    setParams({
      page: 1,
      limit: 20,
      search: searchTerm || undefined,
      show_id: showId || undefined,
      status: selectedStatus || undefined
    })
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setParams({
      page: 1,
      limit: 20,
      search: searchTerm || undefined,
      show_id: selectedShow || undefined,
      status: status || undefined
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedShow('')
    setSelectedStatus('')
    setParams({
      page: 1,
      limit: 20,
      search: undefined,
      show_id: undefined,
      status: undefined
    })
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    setShowManualCreateModal(false)
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
            {(searchTerm || selectedShow || selectedStatus) && (
              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Filtered
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-2">
          <Button 
            variant="secondary"
            className="inline-flex items-center"
            onClick={() => setShowManualCreateModal(true)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Manual Create
          </Button>
          <Button 
            className="inline-flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI Create
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
            onChange={(e) => handleShowFilter(e.target.value)}
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
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="finalized">Finalized</option>
            <option value="failed">Failed</option>
          </select>

          <Button 
            variant="secondary" 
            className="inline-flex items-center justify-center"
            onClick={handleClearFilters}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Clear Filters
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
                    <div className="flex space-x-1">
                      <Link to={`/episodes/${episode.id}/script-generation`}>
                        <Button variant="ghost" size="sm">
                          Script
                        </Button>
                      </Link>
                      {(episode.script_generated === true || episode.script_generated === 'true') && (
                        <>
                          <Link to={`/episodes/${episode.id}/script-review`}>
                            <Button variant="ghost" size="sm">
                              Review
                            </Button>
                          </Link>
                          <Link to={`/episodes/${episode.id}/audio-generation`}>
                            <Button variant="ghost" size="sm">
                              Audio
                            </Button>
                          </Link>
                        </>
                      )}
                      {episode.status === 'completed' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAudit(episode)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                        </Button>
                      )}
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
                <SparklesIcon className="h-4 w-4 mr-2" />
                Create Your First Episode with AI
              </Button>
            }
          />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="AI Episode Generation"
        size="lg"
      >
        <CreateEpisodeAIForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showManualCreateModal}
        onClose={() => setShowManualCreateModal(false)}
        title="Create Episode Manually"
        size="lg"
      >
        <CreateEpisodeForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowManualCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title={`Episode Audit: ${selectedEpisode?.title || ''}`}
        size="xl"
      >
        <div className="space-y-4">
          {isAuditing ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : auditData ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Episode Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Title:</span> {auditData.title}
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span> <StatusBadge status={auditData.database_status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Script Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database Flag:</span>
                      <span className={auditData.script_status?.database_flag ? 'text-green-600' : 'text-red-600'}>
                        {auditData.script_status?.database_flag ? '✓ True' : '✗ False'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Beat Sheet:</span>
                      <span className={auditData.script_status?.beat_sheet_exists ? 'text-green-600' : 'text-red-600'}>
                        {auditData.script_status?.beat_sheet_exists ? '✓ Exists' : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Scenes:</span>
                      <span className={auditData.script_status?.scenes_exist ? 'text-green-600' : 'text-red-600'}>
                        {auditData.script_status?.scenes_exist ? `✓ ${auditData.script_status?.scene_count || 0} scenes` : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Editorial Pass:</span>
                      <span className={auditData.script_status?.edits_exist ? 'text-green-600' : 'text-red-600'}>
                        {auditData.script_status?.edits_exist ? '✓ Complete' : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Teleplay PDF:</span>
                      <span className={auditData.script_status?.teleplay_exists ? 'text-green-600' : 'text-red-600'}>
                        {auditData.script_status?.teleplay_exists ? '✓ Generated' : '✗ Missing'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Script Complete:</span>
                      <span className={auditData.script_complete ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {auditData.script_complete ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Audio Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database Flag:</span>
                      <span className={auditData.audio_status?.database_flag ? 'text-green-600' : 'text-red-600'}>
                        {auditData.audio_status?.database_flag ? '✓ True' : '✗ False'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Audio Manifest:</span>
                      <span className={auditData.audio_status?.manifest_exists ? 'text-green-600' : 'text-red-600'}>
                        {auditData.audio_status?.manifest_exists ? '✓ Exists' : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Dialogue Files:</span>
                      <span className={auditData.audio_status?.dialogue_count > 0 ? 'text-green-600' : 'text-red-600'}>
                        {auditData.audio_status?.dialogue_count > 0 ? `✓ ${auditData.audio_status?.dialogue_count} files` : '✗ None'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">SFX Files:</span>
                      <span className={auditData.audio_status?.sfx_count > 0 ? 'text-green-600' : 'text-red-600'}>
                        {auditData.audio_status?.sfx_count > 0 ? `✓ ${auditData.audio_status?.sfx_count} files` : '✗ None'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Final MP3:</span>
                      <span className={auditData.audio_status?.final_mp3_exists ? 'text-green-600' : 'text-red-600'}>
                        {auditData.audio_status?.final_mp3_exists ? '✓ Generated' : '✗ Missing'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Audio Complete:</span>
                      <span className={auditData.audio_complete ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {auditData.audio_complete ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {auditData.inconsistencies && auditData.inconsistencies.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Inconsistencies Found</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    {auditData.inconsistencies.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Ready for Finalization?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {auditData.script_complete && auditData.audio_complete && !auditData.needs_repair
                        ? 'This episode is complete and ready to be finalized.'
                        : auditData.needs_repair
                        ? 'This episode has inconsistencies that should be resolved before finalization.'
                        : 'This episode is not complete. Generate missing components before finalizing.'}
                    </p>
                  </div>
                  <div className={auditData.script_complete && auditData.audio_complete ? 'text-green-600' : 'text-gray-400'}>
                    <CheckCircleIcon className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="secondary" onClick={() => setShowAuditModal(false)}>
                  Close
                </Button>
                {auditData.script_complete && auditData.audio_complete && auditData.database_status !== 'finalized' && (
                  <Button 
                    variant="primary"
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                    className="inline-flex items-center"
                  >
                    {isFinalizing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    Finalize Episode
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}