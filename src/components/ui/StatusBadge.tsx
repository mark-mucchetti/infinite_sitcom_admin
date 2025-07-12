import { cn } from '@/utils/classNames'

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'finalized' | string
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Pending',
    classes: 'bg-gray-100 text-gray-800'
  },
  processing: {
    label: 'Processing',
    classes: 'bg-blue-100 text-blue-800'
  },
  completed: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-800'
  },
  finalized: {
    label: 'Completed',  // Show as "Completed" for legacy data
    classes: 'bg-green-100 text-green-800'
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-100 text-red-800'
  }
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    classes: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={cn(
      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
      config.classes,
      className
    )}>
      {config.label}
    </span>
  )
}