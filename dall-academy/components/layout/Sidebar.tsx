'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import LanguageToggle from '@/components/LanguageToggle'

const nav = [
  { href: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { href: '/guider', icon: GuiderIcon, label: 'AI Guider' },
  { href: '/qbank', icon: QBankIcon, label: 'Q-Bank' },
  { href: '/mock', icon: MockIcon, label: 'Mock Exam' },
  { href: '/progress', icon: ProgressIcon, label: 'Progress' },
  { href: '/calculator', icon: CalculatorIcon, label: 'Calculator' },
  { href: '/settings', icon: SettingsIcon, label: 'Settings' },
]

/* ── SVG icon components ── */

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function GuiderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C6.13 2 3 5.13 3 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 17v1a2 2 0 004 0v-1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function QBankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProgressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 17V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.93 3.93l1.41 1.41M14.66 14.66l1.41 1.41M3.93 16.07l1.41-1.41M14.66 5.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="5" width="8" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="10" cy="11.5" r="1" fill="currentColor" />
      <circle cx="13.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="15" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      <circle cx="13.5" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Sidebar component ── */

interface SidebarProps {
  userName?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ userName, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 flex-shrink-0',
          collapsed && !isMobile ? 'justify-center px-3 py-5' : 'px-5 py-5'
        )}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#4A8FA3' }}
        >
          <span className="text-white font-bold text-sm font-display">D</span>
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="text-white font-bold text-sm font-display leading-tight">
                Dall Academy
              </div>
            </div>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none flex-shrink-0"
              style={{ background: 'rgba(74,143,163,0.2)', color: '#7BB3C4' }}
            >
              SDLE
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-3 space-y-1 overflow-y-auto', collapsed && !isMobile ? 'px-2' : 'px-3')}>
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg text-sm transition-all relative group',
                collapsed && !isMobile
                  ? 'justify-center px-2 py-2.5'
                  : 'px-3 py-2.5',
                isActive
                  ? 'sidebar-active text-white font-medium'
                  : 'text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-white/5'
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {/* Tooltip for collapsed mode */}
              {collapsed && !isMobile && (
                <span className="absolute start-full ms-2 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50" style={{ background: '#1e2030' }}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && onToggleCollapse && (
        <div className="px-3 pb-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2 rounded-lg text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] hover:bg-white/5 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon
              className={cn(
                'w-4 h-4 transition-transform',
                collapsed ? 'rotate-180 rtl:rotate-0' : 'rtl:rotate-180'
              )}
            />
          </button>
        </div>
      )}

      {/* User */}
      <div
        className={cn('flex-shrink-0', collapsed && !isMobile ? 'px-2 py-4' : 'px-4 py-4')}
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className={cn('flex items-center gap-3 mb-3', collapsed && !isMobile && 'justify-center')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#4A8FA3' }}
          >
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">
                {userName ?? 'Student'}
              </div>
              <span
                className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5"
                style={{ background: 'rgba(74,143,163,0.15)', color: '#7BB3C4' }}
              >
                Free Trial
              </span>
            </div>
          )}
        </div>
        {(!collapsed || isMobile) && (
          <LanguageToggle className="text-[rgba(255,255,255,0.4)] hover:text-white border border-white/[0.08] mb-2" />
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-2 text-xs transition-colors',
            collapsed && !isMobile
              ? 'justify-center py-1 text-[rgba(255,255,255,0.25)] hover:text-white'
              : 'text-[rgba(255,255,255,0.25)] hover:text-white ps-1'
          )}
          title={collapsed && !isMobile ? 'Sign out' : undefined}
        >
          <SignOutIcon className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 start-4 z-50 md:hidden p-2 rounded-lg text-white"
        style={{ background: '#111320', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 h-screen w-[260px] flex flex-col transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0 rtl:-translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
        style={{ background: '#111320' }}
      >
        <button
          className="absolute top-4 end-4 p-1 text-[rgba(255,255,255,0.5)] hover:text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 transition-[width] duration-300',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
        style={{
          background: '#111320',
          borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {sidebarContent(false)}
      </aside>
    </>
  )
}
