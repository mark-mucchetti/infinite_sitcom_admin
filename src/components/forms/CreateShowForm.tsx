import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { showsApi } from '@/services/shows'
import { useUIStore } from '@/store/ui'

const createShowSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt must be less than 500 characters')
})

type CreateShowFormData = z.infer<typeof createShowSchema>

interface CreateShowFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateShowForm({ onSuccess, onCancel }: CreateShowFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const showToast = useUIStore(state => state.showToast)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateShowFormData>({
    resolver: zodResolver(createShowSchema)
  })

  const onSubmit = async (data: CreateShowFormData) => {
    try {
      setIsSubmitting(true)
      await showsApi.generateAI(data)
      
      showToast({
        type: 'success',
        title: 'Show Creation Started',
        message: 'Your show is being generated. This may take a minute.'
      })
      
      reset()
      onSuccess()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Create Show',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Show Description"
          placeholder="Describe the TV show you want to create (e.g., 'The Golden Girls' or 'a show about friends running a coffee shop')"
          {...register('prompt')}
          error={errors.prompt?.message}
          helperText="Be specific about the setting, characters, or existing show you want to recreate"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Examples:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• "The Golden Girls"</li>
          <li>• "A workplace comedy set in a paper company like The Office"</li>
          <li>• "Friends but set in a bookstore instead of coffee shop"</li>
          <li>• "A family sitcom like Family Ties but set in modern day"</li>
        </ul>
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
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Show...' : 'Create Show'}
        </Button>
      </div>
    </form>
  )
}