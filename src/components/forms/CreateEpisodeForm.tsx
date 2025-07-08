import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import { episodesApi } from '@/services/episodes'
import { useShows } from '@/hooks/useShows'
import { useProgressStore } from '@/store/ui'

const createEpisodeSchema = z.object({
  show_id: z.string().min(1, 'Show is required'),
  season_number: z.number().min(1, 'Season number must be at least 1'),
  episode_number: z.number().min(1, 'Episode number must be at least 1'),
  title: z.string().min(1, 'Title is required'),
  logline: z.string().min(1, 'Logline is required'),
  a_plot: z.string().min(1, 'A Plot is required'),
  b_plot: z.string().min(1, 'B Plot is required'),
  c_plot: z.string().optional(),
  theme: z.string().min(1, 'Theme is required'),
})

type CreateEpisodeFormData = z.infer<typeof createEpisodeSchema>

interface CreateEpisodeFormProps {
  onSuccess: () => void
  onCancel: () => void
  showId?: string
}

export default function CreateEpisodeForm({ onSuccess, onCancel, showId }: CreateEpisodeFormProps) {
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
  } = useForm<CreateEpisodeFormData>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      show_id: showId || '',
      season_number: 1,
      episode_number: 1,
      title: '',
      logline: '',
      a_plot: '',
      b_plot: '',
      c_plot: '',
      theme: ''
    }
  })

  const selectedShowId = watch('show_id')

  const onSubmit = async (data: CreateEpisodeFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      setGenerating(true)
      setProgress({ phase: 'Creating Episode', progress: 0, status: 'in_progress' })

      // Create episode via API
      await episodesApi.create(data)

      setProgress({ phase: 'Episode Created', progress: 100, status: 'completed' })
      
      setTimeout(() => {
        setGenerating(false)
        reset()
        onSuccess()
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create episode')
      setProgress({ phase: 'Creation Failed', progress: 0, status: 'failed' })
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
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Season Number *
          </label>
          <Input
            type="number"
            min="1"
            {...register('season_number', { valueAsNumber: true })}
            error={errors.season_number?.message}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Episode Number *
          </label>
          <Input
            type="number"
            min="1"
            {...register('episode_number', { valueAsNumber: true })}
            error={errors.episode_number?.message}
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <Input
            {...register('title')}
            placeholder="Enter episode title"
            error={errors.title?.message}
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logline *
          </label>
          <textarea
            {...register('logline')}
            rows={3}
            className="input w-full"
            placeholder="Brief summary of the episode"
            disabled={isSubmitting}
          />
          {errors.logline && (
            <p className="mt-1 text-sm text-red-600">{errors.logline.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            A Plot (Main Plot) *
          </label>
          <textarea
            {...register('a_plot')}
            rows={4}
            className="input w-full"
            placeholder="Main storyline of the episode"
            disabled={isSubmitting}
          />
          {errors.a_plot && (
            <p className="mt-1 text-sm text-red-600">{errors.a_plot.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            B Plot (Secondary Plot) *
          </label>
          <textarea
            {...register('b_plot')}
            rows={4}
            className="input w-full"
            placeholder="Secondary storyline of the episode"
            disabled={isSubmitting}
          />
          {errors.b_plot && (
            <p className="mt-1 text-sm text-red-600">{errors.b_plot.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            C Plot (Optional)
          </label>
          <textarea
            {...register('c_plot')}
            rows={3}
            className="input w-full"
            placeholder="Optional tertiary storyline"
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme *
          </label>
          <Input
            {...register('theme')}
            placeholder="Central theme or message of the episode"
            error={errors.theme?.message}
            disabled={isSubmitting}
          />
        </div>
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
              Creating Episode...
            </>
          ) : (
            'Create Episode'
          )}
        </Button>
      </div>
    </form>
  )
}