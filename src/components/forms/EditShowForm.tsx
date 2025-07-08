import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { showsApi } from '@/services/shows'
import { useUIStore } from '@/store/ui'
import { Show } from '@/types/api'

const editShowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  year: z.number().min(1950).max(2030).optional(),
  format: z.string().optional(),
  content_rating: z.string().optional(),
  class_setting: z.string().optional(),
  geographic_setting: z.string().optional(),
  theme: z.string().optional()
})

type EditShowFormData = z.infer<typeof editShowSchema>

interface EditShowFormProps {
  show: Show
  onSuccess: () => void
  onCancel: () => void
}

const formatOptions = [
  { value: 'workplace', label: 'Workplace' },
  { value: 'family', label: 'Family' },
  { value: 'friends_ensemble', label: 'Friends Ensemble' },
  { value: 'odd_couple', label: 'Odd Couple' },
  { value: 'high_concept', label: 'High Concept' }
]

const contentRatingOptions = [
  { value: 'family', label: 'Family' },
  { value: 'prime', label: 'Prime Time' },
  { value: 'adult_situations', label: 'Adult Situations' }
]

const classSettingOptions = [
  { value: 'working', label: 'Working Class' },
  { value: 'middle', label: 'Middle Class' },
  { value: 'upper_middle', label: 'Upper Middle Class' },
  { value: 'wealthy', label: 'Wealthy' },
  { value: 'mixed', label: 'Mixed' }
]

export default function EditShowForm({ show, onSuccess, onCancel }: EditShowFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const showToast = useUIStore(state => state.showToast)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<EditShowFormData>({
    resolver: zodResolver(editShowSchema)
  })

  // Populate form with current show data
  useEffect(() => {
    setValue('name', show.name)
    setValue('year', show.year)
    setValue('format', show.format)
    setValue('content_rating', show.content_rating)
    setValue('class_setting', show.class_setting)
    setValue('geographic_setting', show.geographic_setting)
    setValue('theme', show.theme)
  }, [show, setValue])

  const onSubmit = async (data: EditShowFormData) => {
    try {
      setIsSubmitting(true)
      await showsApi.update(show.id, data)
      
      showToast({
        type: 'success',
        title: 'Show Updated',
        message: 'Show details have been successfully updated.'
      })
      
      onSuccess()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Update Show',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Show Name
        </label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter show name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <Input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
            placeholder="1990"
          />
        </div>

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700">
            Format
          </label>
          <select
            id="format"
            {...register('format')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select format</option>
            {formatOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="content_rating" className="block text-sm font-medium text-gray-700">
            Content Rating
          </label>
          <select
            id="content_rating"
            {...register('content_rating')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select rating</option>
            {contentRatingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="class_setting" className="block text-sm font-medium text-gray-700">
            Class Setting
          </label>
          <select
            id="class_setting"
            {...register('class_setting')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select class</option>
            {classSettingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="geographic_setting" className="block text-sm font-medium text-gray-700">
          Geographic Setting
        </label>
        <Input
          id="geographic_setting"
          type="text"
          {...register('geographic_setting')}
          placeholder="e.g., Small town in Vermont"
        />
      </div>

      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
          Theme
        </label>
        <textarea
          id="theme"
          {...register('theme')}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Describe what the show is about..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Show'}
        </Button>
      </div>
    </form>
  )
}