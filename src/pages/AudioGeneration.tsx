import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PlayIcon, SpeakerWaveIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { useEpisodes } from '@/hooks/useEpisodes'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { episodesApi } from '@/services/episodes'
import { useUIStore } from '@/store/ui'

interface AudioPhase {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  action: string
  endpoint: keyof typeof episodesApi
}

export default function AudioGeneration() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  
  const [episode, setEpisode] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [audioStatus, setAudioStatus] = useState<any>(null)
  const [phases, setPhases] = useState<AudioPhase[]>([
    {
      id: 'manifest',
      name: 'Audio Manifest',
      description: 'Voice mapping and sound effects catalog',
      status: 'pending',
      action: 'Generate Manifest',
      endpoint: 'generateAudioManifest'
    },
    {
      id: 'files',
      name: 'Audio File Generation',
      description: 'Generate character dialogue and sound effects',
      status: 'pending',
      action: 'Generate Audio Files',
      endpoint: 'generateAudioFiles'
    },
    {
      id: 'assembly',
      name: 'Episode Assembly',
      description: 'Assemble final MP3 with timing and effects',
      status: 'pending',
      action: 'Assemble Episode',
      endpoint: 'assembleEpisode'
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
      
      // Load detailed audio status
      try {
        const statusResponse = await episodesApi.getAudioStatus(id!)
        setAudioStatus(statusResponse.data)
        updatePhaseStatus(response.data, statusResponse.data)
      } catch (error) {
        // Audio status endpoint might not be available for episodes without audio
        updatePhaseStatus(response.data)
      }
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

  const updatePhaseStatus = (episodeData: any, audioStatusData?: any) => {
    setPhases(prev => prev.map(phase => {
      if (audioStatusData?.phases) {
        // Use detailed audio status if available
        switch (phase.id) {
          case 'manifest':
            return { ...phase, status: audioStatusData.phases.phase_1_manifest?.completed ? 'completed' : 'pending' }
          case 'files':
            return { ...phase, status: audioStatusData.phases.phase_2_files?.completed ? 'completed' : 'pending' }
          case 'assembly':
            return { ...phase, status: audioStatusData.phases.phase_3_assembly?.completed ? 'completed' : 'pending' }
          default:
            return phase
        }
      } else {
        // Fallback to simple completion check
        if (episodeData.assets_generated === 'true') {
          return { ...phase, status: 'completed' }
        }
        return phase
      }
    }))
  }

  const runPhase = async (phase: AudioPhase) => {
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
      const phasePromise = apiMethod(id!)
      
      // Poll for status every 10 seconds for individual phases (faster than full workflow)
      const pollInterval = setInterval(async () => {
        try {
          const episodeResponse = await episodesApi.get(id!)
          let phaseComplete = false
          
          try {
            // Get detailed audio status
            const statusResponse = await episodesApi.getAudioStatus(id!)
            const audioStatusData = statusResponse.data
            
            // Check specific phase completion
            if (phase.id === 'manifest' && audioStatusData.phases?.phase_1_manifest?.completed) {
              phaseComplete = true
            } else if (phase.id === 'files' && audioStatusData.phases?.phase_2_files?.completed) {
              phaseComplete = true
            } else if (phase.id === 'assembly' && audioStatusData.phases?.phase_3_assembly?.completed) {
              phaseComplete = true
            }
            
            // Update audio status for progress display
            setAudioStatus(audioStatusData)
          } catch (statusError) {
            // Fallback to simple episode status if audio status endpoint fails
            if (episodeResponse.data.assets_generated === 'true') {
              phaseComplete = true
            }
          }
          
          if (phaseComplete) {
            clearInterval(pollInterval)
            setPhases(prev => prev.map(p => 
              p.id === phase.id ? { ...p, status: 'completed' } : p
            ))
            showToast({
              type: 'success',
              title: `${phase.name} completed successfully!`
            })
            loadEpisode()
            setActivePhase(null)
          }
        } catch (error) {
          console.error('Error polling phase status:', error)
        }
      }, 10000)
      
      // Wait for phase to complete or fail
      await phasePromise
      clearInterval(pollInterval)
      
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
      setActivePhase(null)
    }
  }

  const runFullWorkflow = async () => {
    try {
      setActivePhase('full-workflow')
      showToast({
        type: 'info',
        title: 'Starting full audio generation workflow...'
      })
      
      // Start the generation (this will take 5-10 minutes)
      const generationPromise = episodesApi.generateAudio(id!)
      
      // Poll for status every 30 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await episodesApi.get(id!)
          if (response.data.assets_generated === 'true') {
            clearInterval(pollInterval)
            showToast({
              type: 'success',
              title: 'Audio generation completed successfully!'
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
        title: 'Audio generation failed',
        message: error instanceof Error ? error.message : 'An error occurred'
      })
      console.error('Audio generation failed:', error)
      setActivePhase(null)
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
        return '🔊'
    }
  }

  const renderProgressDetails = (phaseId: string) => {
    if (!audioStatus?.phases) return null

    const phaseData = audioStatus.phases[`phase_${phaseId === 'manifest' ? '1_manifest' : phaseId === 'files' ? '2_files' : '3_assembly'}`]
    if (!phaseData) return null

    return (
      <div className="mt-2 text-xs text-gray-600">
        {phaseId === 'manifest' && phaseData.voice_mappings && (
          <p>Voice mappings: {Object.keys(phaseData.voice_mappings).length} characters</p>
        )}
        {phaseId === 'files' && (
          <div>
            {phaseData.dialogue_files && <p>Dialogue files: {phaseData.dialogue_files.generated || 0} generated</p>}
            {phaseData.sfx_files && <p>SFX files: {phaseData.sfx_files.generated || 0} generated</p>}
            {phaseData.total_files && <p>Total: {phaseData.generated || 0} / {phaseData.total_files} files</p>}
          </div>
        )}
        {phaseId === 'assembly' && phaseData.duration_seconds && (
          <p>Episode duration: {Math.round(phaseData.duration_seconds / 60)} minutes</p>
        )}
      </div>
    )
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

  if (episode.script_generated !== 'true') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Script must be generated before audio production</p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/episodes')} variant="secondary">
            Back to Episodes
          </Button>
          <Button onClick={() => navigate(`/episodes/${id}/script-generation`)}>
            Generate Script
          </Button>
        </div>
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
              Audio Production
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              {episode.title} (S{episode.season_number}E{episode.episode_number})
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusBadge
              status={episode.assets_generated === 'true' ? 'completed' : 'pending'}
              text={episode.assets_generated === 'true' ? 'Audio Complete' : 'Audio Pending'}
            />
          </div>
        </div>
      </div>

      {/* Prerequisites Check */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prerequisites</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm mr-3 ${
              episode.script_generated === 'true' ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {episode.script_generated === 'true' ? '✓' : '○'}
            </div>
            <span className="text-sm text-gray-700">
              Script Generated ({episode.script_generated === 'true' ? 'Complete' : 'Required'})
            </span>
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
            {activePhase === 'full-workflow' ? 'Generating...' : 'Run Full Audio Workflow'}
          </Button>
          
          {episode.assets_generated === 'true' && (
            <>
              <Button
                variant="secondary"
                onClick={() => window.open(`/api/episodes/${id}/audio/final`, '_blank')}
                className="flex items-center"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                Play Final MP3
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate(`/episodes/${id}/audio-review`)}
                className="flex items-center"
              >
                <MusicalNoteIcon className="h-4 w-4 mr-2" />
                Review Audio
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Audio Quality Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Voice Generation</p>
            <p className="text-gray-600">ElevenLabs TTS with continuity tracking</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Sound Effects</p>
            <p className="text-gray-600">AI-generated SFX and audience reactions</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Audio Quality</p>
            <p className="text-gray-600">22kHz MP3, optimized for streaming</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Processing</p>
            <p className="text-gray-600">Parallel generation with timing assembly</p>
          </div>
        </div>
      </div>

      {/* Phase Workflow */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">3-Phase Audio Production</h3>
        
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
                      {audioStatus && renderProgressDetails(phase.id)}
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