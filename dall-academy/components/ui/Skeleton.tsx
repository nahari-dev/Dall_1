import { cn } from '@/lib/utils'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        className
      )}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  )
}
