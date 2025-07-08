import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentIcon, PlayIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { episodesApi } from '@/services/episodes'
import { useUIStore } from '@/store/ui'

interface SceneData {
  scene_number: number
  location: string
  runtime_minutes: number
  lines: Array<{
    line_id: string
    character: string
    dialogue: string
    delivery: string
    motivation: string
    timing_offset: number
    duration: number
  }>
}

interface BeatSheetData {
  episode_title: string
  season_episode: string
  characters: Array<{
    name: string
    type: string
    role_in_episode: string
  }>
  locations: Array<{
    name: string
    description: string
  }>
  scenes: Array<{
    scene_number: number
    location: string
    characters: string[]
    plot_advancement: Record<string, string>
    runtime_minutes: number
  }>
}

export default function ScriptReview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  
  const [episode, setEpisode] = useState<any>(null)
  const [beatSheet, setBeatSheet] = useState<BeatSheetData | null>(null)
  const [scenes, setScenes] = useState<SceneData[]>([])
  const [selectedScene, setSelectedScene] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'beat-sheet' | 'scenes' | 'continuity'>('beat-sheet')

  useEffect(() => {
    if (id) {
      loadScriptData()
    }
  }, [id])

  const loadScriptData = async () => {
    try {
      setLoading(true)
      
      // Load episode data
      const episodeResponse = await episodesApi.get(id!)
      setEpisode(episodeResponse.data)
      
      // In a real implementation, you'd have endpoints to fetch:
      // - Beat sheet data: GET /episodes/:id/beat-sheet
      // - Scene data: GET /episodes/:id/scenes
      // - Continuity notes: GET /episodes/:id/continuity
      
      // For now, we'll show placeholder data
      setBeatSheet({
        episode_title: episodeResponse.data.title,
        season_episode: `S${episodeResponse.data.season_number}E${episodeResponse.data.episode_number}`,
        characters: [
          { name: "Maya", type: "main", role_in_episode: "Coffee shop owner dealing with difficult customer" },
          { name: "Marcus", type: "regular", role_in_episode: "Employee advocating for boundaries" },
          { name: "Riley", type: "regular", role_in_episode: "Employee suggesting accommodation" }
        ],
        locations: [
          { name: "Coffee Shop Main Floor", description: "Busy morning rush atmosphere" },
          { name: "Coffee Shop Back Office", description: "Private space for staff discussions" }
        ],
        scenes: [
          {
            scene_number: 1,
            location: "Coffee Shop Main Floor",
            characters: ["Maya", "Marcus", "Riley"],
            plot_advancement: {
              a_plot: "Introduces the demanding customer situation",
              b_plot: "Shows staff dynamic and different approaches"
            },
            runtime_minutes: 3.5
          }
        ]
      })
      
    } catch (error) {
      showToast('Failed to load script data', 'error')
      console.error('Failed to load script data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDialogue = (line: any) => {
    if (line.character === 'SFX') {
      return `[${line.dialogue}]`
    }
    if (line.character === 'audience') {
      return `[AUDIENCE: ${line.delivery}]`
    }
    if (line.character === 'CHARACTER_ENTER' || line.character === 'CHARACTER_EXIT') {
      return `[${line.dialogue} ${line.delivery}]`
    }
    return line.dialogue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!episode || episode.script_generated !== 'true') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          {!episode ? 'Episode not found' : 'Script not yet generated for this episode'}
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/episodes')} variant="secondary">
            Back to Episodes
          </Button>
          {episode && (
            <Button onClick={() => navigate(`/episodes/${id}/script-generation`)}>
              Generate Script
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Script Review</h1>
            <p className="text-lg text-gray-600 mt-1">
              {episode.title} (S{episode.season_number}E{episode.episode_number})
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => window.open(`/api/episodes/${id}/teleplay`, '_blank')}
              className="flex items-center"
            >
              <DocumentIcon className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={() => navigate(`/episodes/${id}/script-generation`)}
              className="flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Script Generation
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'beat-sheet', name: 'Beat Sheet', count: beatSheet?.scenes.length },
            { id: 'scenes', name: 'Scenes', count: scenes.length || beatSheet?.scenes.length },
            { id: 'continuity', name: 'Continuity Notes', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'beat-sheet' && beatSheet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Characters & Locations */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Characters</h3>
              <div className="space-y-3">
                {beatSheet.characters.map((character, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{character.name}</h4>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {character.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{character.role_in_episode}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Locations</h3>
              <div className="space-y-3">
                {beatSheet.locations.map((location, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-gray-900">{location.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scene Breakdown */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scene Breakdown</h3>
            <div className="space-y-4">
              {beatSheet.scenes.map((scene) => (
                <div key={scene.scene_number} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Scene {scene.scene_number}: {scene.location}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {scene.runtime_minutes} min
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Characters:</strong> {scene.characters.join(', ')}</p>
                    
                    {Object.entries(scene.plot_advancement).map(([plot, advancement]) => (
                      <p key={plot}>
                        <strong>{plot.toUpperCase()}:</strong> {advancement}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenes' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Scene Viewer</h3>
            <p className="text-sm text-gray-600 mt-1">
              Detailed dialogue with timing and performance notes
            </p>
            
            {/* Scene selector */}
            {beatSheet && (
              <div className="mt-4 flex flex-wrap gap-2">
                {beatSheet.scenes.map((scene) => (
                  <button
                    key={scene.scene_number}
                    onClick={() => setSelectedScene(scene.scene_number)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      selectedScene === scene.scene_number
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Scene {scene.scene_number}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="text-center text-gray-500">
              <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Scene data would be loaded from the backend</p>
              <p className="text-sm mt-2">
                API endpoint: <code>GET /episodes/{id}/scenes/{scene.scene_number}</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'continuity' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Continuity Notes</h3>
          <div className="text-center text-gray-500">
            <p>Continuity tracking would show:</p>
            <ul className="text-sm mt-4 space-y-1 text-left max-w-md mx-auto">
              <li>• Scene-level continuity notes (3 per scene)</li>
              <li>• Episode-level continuity notes (3 major developments)</li>
              <li>• Cross-episode continuity tracking</li>
              <li>• Character development notes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}