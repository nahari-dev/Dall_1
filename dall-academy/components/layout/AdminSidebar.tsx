'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', icon: '📊', label: 'Overview', exact: true },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/questions', icon: '📝', label: 'Questions' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { href: '/admin/revenue', icon: '💰', label: 'Revenue' },
  { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#4A8FA3' }}>
            <span className="text-white font-bold text-xs font-display">D</span>
          </div>
          <span className="text-white font-bold text-sm font-display">Dall Academy</span>
        </div>
        <div className="text-xs px-1" style={{ color: '#ff6b6b' }}>Admin Portal</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'sidebar-active text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-white transition-colors">
          ← Back to App
        </Link>
      </div>
    </aside>
  )
}
