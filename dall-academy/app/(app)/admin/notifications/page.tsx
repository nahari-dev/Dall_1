'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  read: boolean
  sentAt: string
  userId: string | null
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [form, setForm] = useState({ title: '', body: '', type: 'info', userId: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .catch(() => null)
  }, [])

  async function sendNotification() {
    if (!form.title || !form.body) {
      toast.error('Title and body are required')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify', ...form }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Notification sent!')
      setForm({ title: '', body: '', type: 'info', userId: '' })
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>

        <div className="glass-card p-6">
          <h2 className="font-bold text-white mb-4">Send Notification</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                className="input-dark"
                placeholder="Notification title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea
                className="input-dark"
                rows={3}
                placeholder="Notification body…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select className="input-dark" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Send To</label>
                <input
                  className="input-dark"
                  placeholder="User ID (blank = all)"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              </div>
            </div>
            <button onClick={sendNotification} className="btn-primary" disabled={sending}>
              {sending ? 'Sending…' : 'Send Notification'}
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-bold text-white mb-4">Recent Notifications</h2>
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">No notifications sent yet</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="font-medium text-white">{n.title}</div>
                  <div className="text-gray-400 text-sm mt-1">{n.body}</div>
                  <div className="text-gray-600 text-xs mt-2">
                    {new Date(n.sentAt).toLocaleString()} · {n.userId ? 'Individual' : 'Broadcast'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
