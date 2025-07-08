import { ReactNode } from 'react'
import { cn } from '@/utils/classNames'

interface TableProps {
  children: ReactNode
  className?: string
}

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

interface TableBodyProps {
  children: ReactNode
  className?: string
}

interface TableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

interface TableCellProps {
  children: ReactNode
  className?: string
  header?: boolean
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className={cn('min-w-full divide-y divide-gray-300', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-200 bg-white', className)}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr 
      className={cn(
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className, header = false }: TableCellProps) {
  const baseClasses = 'px-6 py-4 text-sm'
  const headerClasses = 'font-medium text-gray-900 text-left'
  const cellClasses = 'text-gray-500'

  return (
    <td className={cn(
      baseClasses,
      header ? headerClasses : cellClasses,
      className
    )}>
      {children}
    </td>
  )
}

export function TableHeaderCell({ children, className }: TableCellProps) {
  return (
    <th className={cn(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      className
    )}>
      {children}
    </th>
  )
}