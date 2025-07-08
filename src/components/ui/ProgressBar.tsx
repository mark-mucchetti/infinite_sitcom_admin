import { cn } from '@/utils/classNames'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  className
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', colors[color])}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}