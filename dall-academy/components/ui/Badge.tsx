import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  color?: 'teal' | 'green' | 'red' | 'amber' | 'gray' | 'purple'
  size?: 'sm' | 'md'
}

const colors = {
  teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  gray: 'bg-white/10 text-gray-400 border-white/10',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

export default function Badge({ label, color = 'teal', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colors[color],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {label}
    </span>
  )
}
