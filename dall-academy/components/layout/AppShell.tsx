import Sidebar from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
  userName?: string
}

export default function AppShell({ children, userName }: AppShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <Sidebar userName={userName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
