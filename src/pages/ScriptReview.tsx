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
  const [continuity, setContinuity] = useState<any>(null)
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
      
      // Load actual script content
      try {
        // Load beat sheet data
        const beatSheetResponse = await fetch(`/api/episodes/${id}/beat-sheet`)
        if (beatSheetResponse.ok) {
          const beatSheetData = await beatSheetResponse.json()
          setBeatSheet(beatSheetData)
        }
      } catch (error) {
        console.log('Beat sheet not available:', error)
      }
      
      try {
        // Load scene data
        const scenesResponse = await fetch(`/api/episodes/${id}/scenes`)
        if (scenesResponse.ok) {
          const scenesData = await scenesResponse.json()
          setScenes(scenesData.scenes)
        }
      } catch (error) {
        console.log('Scenes not available:', error)
      }
      
      try {
        // Load continuity data
        const continuityResponse = await fetch(`/api/episodes/${id}/continuity`)
        if (continuityResponse.ok) {
          const continuityData = await continuityResponse.json()
          setContinuity(continuityData)
        }
      } catch (error) {
        console.log('Continuity not available:', error)
      }
      
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to load script data',
        message: error instanceof Error ? error.message : 'An error occurred'
      })
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

  if (!episode || (episode.script_generated !== true && episode.script_generated !== 'true')) {
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
              View Teleplay PDF
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
                {beatSheet.characters?.map((character: any, index: number) => (
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
                {beatSheet.locations?.map((location: any, index: number) => (
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
              {beatSheet.scenes?.map((scene: any) => (
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
                    <p><strong>Characters:</strong> {scene.characters?.join(', ')}</p>
                    
                    {scene.plot_advancement && Object.entries(scene.plot_advancement).map(([plot, advancement]) => (
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
              Generated scene files available
            </p>
            
            {/* Scene selector */}
            {scenes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {scenes.map((scene) => (
                  scene.scene_number && scene.location && (
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
                  )
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6">
            {scenes.length > 0 ? (
              (() => {
                const currentScene = scenes.find(scene => scene.scene_number === selectedScene)
                if (!currentScene) return <div>Scene not found</div>
                
                return (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Scene {currentScene.scene_number}: {currentScene.location}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {currentScene.runtime_minutes} min
                      </span>
                    </div>
                  
                    <div className="space-y-3">
                      {currentScene.lines?.map((line: any, index: number) => (
                        <div key={index} className="text-sm">
                          {line.character === 'SFX' ? (
                            <div className="italic text-gray-500">
                              [SFX: {line.dialogue}]
                            </div>
                          ) : line.character === 'audience' ? (
                            <div className="italic text-blue-600">
                              [AUDIENCE: {line.delivery}]
                            </div>
                          ) : line.character === 'CHARACTER_ENTER' || line.character === 'CHARACTER_EXIT' ? (
                            <div className="italic text-green-600">
                              [{line.dialogue} {line.delivery}]
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-gray-900">{line.character}:</span>
                              <span className="ml-2">{line.dialogue}</span>
                              {line.delivery && (
                                <span className="ml-2 text-gray-500 italic">({line.delivery})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="text-center text-gray-500">
                <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No scene files generated yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'continuity' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Continuity Notes</h3>
          
          {continuity ? (
            <div className="space-y-8">
              {/* Episode-Level Continuity */}
              {continuity.episode_continuity && continuity.episode_continuity.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Episode-Level Continuity</h4>
                  <div className="space-y-4">
                    {continuity.episode_continuity.map((note: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-900">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Scene-Level Continuity */}
              {continuity.scene_continuity && continuity.scene_continuity.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Scene-Level Continuity</h4>
                  <div className="space-y-6">
                    {continuity.scene_continuity.map((sceneData: any, sceneIndex: number) => (
                      <div key={sceneIndex} className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">
                          Scene {sceneData.scene_number}: {sceneData.location}
                        </h5>
                        <div className="space-y-2">
                          {sceneData.continuity_notes && sceneData.continuity_notes.map((note: any, noteIndex: number) => (
                            <div key={noteIndex} className="border-l-4 border-green-500 pl-4">
                              <p className="text-sm text-gray-700">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No continuity data */}
              {(!continuity.episode_continuity || continuity.episode_continuity.length === 0) && 
               (!continuity.scene_continuity || continuity.scene_continuity.length === 0) && (
                <div className="text-center text-gray-500">
                  <p>No continuity notes available for this episode.</p>
                  <p className="text-sm mt-2">Continuity notes are generated during Phase 2 (scenes) and Phase 3 (editorial pass).</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No continuity data available for this episode.</p>
              <p className="text-sm mt-2">Continuity notes are generated during the script generation process.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}