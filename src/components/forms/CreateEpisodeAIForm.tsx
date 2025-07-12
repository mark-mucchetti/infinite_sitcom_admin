import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SparklesIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import { episodesApi } from '@/services/episodes'
import { useShows } from '@/hooks/useShows'
import { useProgressStore } from '@/store/ui'

const createEpisodeAISchema = z.object({
  show_id: z.string().min(1, 'Show is required'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt must be less than 500 characters'),
})

type CreateEpisodeAIFormData = z.infer<typeof createEpisodeAISchema>

interface CreateEpisodeAIFormProps {
  onSuccess: () => void
  onCancel: () => void
  showId?: string
}

export default function CreateEpisodeAIForm({ onSuccess, onCancel, showId }: CreateEpisodeAIFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { shows } = useShows({ page: 1, limit: 100 })
  const { progress, isGenerating, setProgress, setGenerating } = useProgressStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateEpisodeAIFormData>({
    resolver: zodResolver(createEpisodeAISchema),
    defaultValues: {
      show_id: showId || '',
      prompt: ''
    }
  })

  const selectedShowId = watch('show_id')

  const onSubmit = async (data: CreateEpisodeAIFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      setGenerating(true)
      setProgress({ phase: 'Starting AI Generation', progress: 0, status: 'in_progress' })

      // Create episode via AI generation
      await episodesApi.generateAI({
        show_id: data.show_id,
        prompt: data.prompt
      })

      setProgress({ phase: 'Episode Generated Successfully', progress: 100, status: 'completed' })
      
      setTimeout(() => {
        setGenerating(false)
        reset()
        onSuccess()
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate episode')
      setProgress({ phase: 'Generation Failed', progress: 0, status: 'failed' })
      setTimeout(() => setGenerating(false), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      reset()
      onCancel()
    }
  }

  const selectedShow = shows.find(s => s.id === selectedShowId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {isGenerating && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">{progress.phase}</div>
              <ProgressBar 
                progress={progress.progress} 
                className="mt-2"
                variant={progress.status === 'failed' ? 'error' : 'default'}
              />
              <p className="text-xs text-blue-700 mt-1">
                This may take several minutes as the AI generates the episode content...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Episode Generation</h3>
        </div>
        <p className="text-sm text-gray-600">
          Provide a brief prompt describing the episode you want to create. The AI will generate a complete episode 
          including title, logline, plots, and theme based on your show's established characters and setting.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Show *
        </label>
        <select
          {...register('show_id')}
          className="input w-full"
          disabled={isSubmitting || !!showId}
        >
          <option value="">Select a show</option>
          {shows.map((show) => (
            <option key={show.id} value={show.id}>
              {show.name}
            </option>
          ))}
        </select>
        {errors.show_id && (
          <p className="mt-1 text-sm text-red-600">{errors.show_id.message}</p>
        )}
        {selectedShow && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Format:</span> {selectedShow.format} | 
              <span className="font-medium"> Setting:</span> {selectedShow.geographic_setting}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Episode Prompt *
        </label>
        <textarea
          {...register('prompt')}
          rows={4}
          className="input w-full"
          placeholder="Example: Create an episode where the main character has to deal with their visiting parents while managing a work crisis..."
          disabled={isSubmitting}
        />
        {errors.prompt && (
          <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Tip: Be specific about the situation or conflict you want to explore, but let the AI handle the details.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedShowId}
          className="inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating Episode...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Episode
            </>
          )}
        </Button>
      </div>
    </form>
  )
}