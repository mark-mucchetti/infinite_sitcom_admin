import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PlayIcon, DocumentIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useEpisodes } from '@/hooks/useEpisodes'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { episodesApi } from '@/services/episodes'
import { useUIStore } from '@/store/ui'

interface ScriptPhase {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  action: string
  endpoint: keyof typeof episodesApi
}

export default function ScriptGeneration() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  
  const [episode, setEpisode] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [scriptStatus, setScriptStatus] = useState<any>(null)
  const [phases, setPhases] = useState<ScriptPhase[]>([
    {
      id: 'beat-sheet',
      name: 'Beat Sheet Generation',
      description: 'Create scene breakdowns with character and location details',
      status: 'pending',
      action: 'Generate Beat Sheet',
      endpoint: 'generateBeatSheet'
    },
    {
      id: 'scenes',
      name: 'Scene Generation',
      description: 'Generate detailed dialogue with timing and performance data',
      status: 'pending',
      action: 'Generate All Scenes',
      endpoint: 'generateScenes'
    },
    {
      id: 'editorial',
      name: 'Editorial Pass',
      description: 'Comprehensive review and consistency fixes',
      status: 'pending',
      action: 'Run Editorial Pass',
      endpoint: 'editorialPass'
    },
    {
      id: 'teleplay',
      name: 'Teleplay Generation',
      description: 'Create period-accurate 1980s TV script PDF',
      status: 'pending',
      action: 'Generate Teleplay',
      endpoint: 'generateTeleplay'
    }
  ])

  useEffect(() => {
    if (id) {
      loadEpisode()
    }
  }, [id])

  const loadEpisode = async () => {
    try {
      setLoading(true)
      const response = await episodesApi.get(id!)
      setEpisode(response.data)
      
      // Load script status for detailed progress
      const statusResponse = await episodesApi.getScriptStatus(id!)
      setScriptStatus(statusResponse.data)
      
      // Update phase status based on script status
      updatePhaseStatus(statusResponse.data)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to load episode',
        message: error instanceof Error ? error.message : 'An error occurred'
      })
      console.error('Failed to load episode:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePhaseStatus = (statusData: any) => {
    setPhases(prev => prev.map(phase => {
      // Update based on actual script status
      if (statusData.phases) {
        switch (phase.id) {
          case 'beat-sheet':
            return { ...phase, status: statusData.phases.phase_1_beat_sheet?.completed ? 'completed' : 'pending' }
          case 'scenes':
            return { ...phase, status: statusData.phases.phase_2_scenes?.completed ? 'completed' : 'pending' }
          case 'editorial':
            return { ...phase, status: statusData.phases.phase_3_editorial?.completed ? 'completed' : 'pending' }
          case 'teleplay':
            return { ...phase, status: statusData.phases.phase_4_teleplay?.completed ? 'completed' : 'pending' }
          default:
            return phase
        }
      }
      return phase
    }))
  }

  const runPhase = async (phase: ScriptPhase) => {
    try {
      setActivePhase(phase.id)
      setPhases(prev => prev.map(p => 
        p.id === phase.id ? { ...p, status: 'in_progress' } : p
      ))

      showToast({
        type: 'info',
        title: `Starting ${phase.name}...`
      })
      
      // Call the appropriate API endpoint
      const apiMethod = episodesApi[phase.endpoint] as Function
      await apiMethod(id!)
      
      setPhases(prev => prev.map(p => 
        p.id === phase.id ? { ...p, status: 'completed' } : p
      ))
      
      showToast({
        type: 'success',
        title: `${phase.name} completed successfully!`
      })
      
      // Reload episode to get updated status
      loadEpisode()
      
    } catch (error) {
      setPhases(prev => prev.map(p => 
        p.id === phase.id ? { ...p, status: 'error' } : p
      ))
      
      showToast({
        type: 'error',
        title: `${phase.name} failed`,
        message: error instanceof Error ? error.message : 'An error occurred'
      })
      console.error(`${phase.name} failed:`, error)
    } finally {
      setActivePhase(null)
    }
  }

  const runFullWorkflow = async () => {
    try {
      setActivePhase('full-workflow')
      showToast({
        type: 'info',
        title: 'Starting full script generation workflow...'
      })
      
      // Start the generation (this will take 8-10 minutes)
      const generationPromise = episodesApi.generateScript(id!)
      
      // Poll for status every 30 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await episodesApi.get(id!)
          if (response.data.script_generated === 'true') {
            clearInterval(pollInterval)
            showToast({
              type: 'success',
              title: 'Script generation completed successfully!'
            })
            loadEpisode()
            setActivePhase(null)
          }
        } catch (error) {
          console.error('Error polling status:', error)
        }
      }, 30000)
      
      // Wait for generation to complete or fail
      await generationPromise
      clearInterval(pollInterval)
      
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Script generation failed',
        message: error instanceof Error ? error.message : 'An error occurred'
      })
      console.error('Script generation failed:', error)
      setActivePhase(null)
    }
  }

  const viewPhaseOutput = (phaseId: string) => {
    if (phaseId === 'beat-sheet') {
      // View beat sheet JSON data
      window.open(`/api/episodes/${id}/beat-sheet`, '_blank')
    } else if (phaseId === 'scenes') {
      // View scenes JSON data
      window.open(`/api/episodes/${id}/scenes`, '_blank')
    } else if (phaseId === 'editorial') {
      // View continuity notes
      window.open(`/api/episodes/${id}/continuity`, '_blank')
    } else if (phaseId === 'teleplay') {
      // View teleplay PDF
      window.open(`/api/episodes/${id}/teleplay`, '_blank')
    }
  }

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'in_progress':
        return '⏳'
      case 'error':
        return '❌'
      default:
        return '⭕'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!episode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Episode not found</p>
        <Button onClick={() => navigate('/episodes')} className="mt-4">
          Back to Episodes
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/episodes')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Episodes
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Script Generation
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              {episode.title} (S{episode.season_number}E{episode.episode_number})
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusBadge
              status={episode.script_generated === 'true' ? 'completed' : 'pending'}
              text={episode.script_generated === 'true' ? 'Script Complete' : 'Script Pending'}
            />
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Episode Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Logline</p>
            <p className="text-sm text-gray-900 mt-1">{episode.logline}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Writer</p>
            <p className="text-sm text-gray-900 mt-1">{episode.writer || 'Not assigned'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">A-Plot</p>
            <p className="text-sm text-gray-900 mt-1">{episode.a_plot}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runFullWorkflow}
            disabled={activePhase !== null}
            className="flex items-center"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {activePhase === 'full-workflow' ? 'Generating...' : 'Run Full Workflow'}
          </Button>
          
          {episode.script_generated === 'true' && (
            <>
              <Button
                variant="secondary"
                onClick={() => window.open(`/api/episodes/${id}/teleplay`, '_blank')}
                className="flex items-center"
              >
                <DocumentIcon className="h-4 w-4 mr-2" />
                View Teleplay PDF
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate(`/episodes/${id}/script-review`)}
                className="flex items-center"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Review Script
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Phase Workflow */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">4-Phase Script Generation</h3>
        
        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative">
              {/* Connection line to next phase */}
              {index < phases.length - 1 && (
                <div className="absolute left-4 top-12 h-6 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Phase indicator */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                  {getPhaseIcon(phase.status)}
                </div>
                
                {/* Phase content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {phase.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {phase.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {phase.status === 'in_progress' && (
                        <div className="flex items-center">
                          <LoadingSpinner size="small" />
                          <span className="ml-2 text-sm text-gray-600">Processing...</span>
                        </div>
                      )}
                      
                      {phase.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewPhaseOutput(phase.id)}
                        >
                          View
                        </Button>
                      )}
                      
                      <Button
                        variant={phase.status === 'completed' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => runPhase(phase)}
                        disabled={activePhase !== null}
                      >
                        {phase.status === 'completed' ? 'Regenerate' : phase.action}
                      </Button>
                    </div>
                  </div>
                  
                  {phase.status === 'in_progress' && (
                    <div className="mt-3">
                      <ProgressBar indeterminate />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}