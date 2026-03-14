'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: '#F5F9FB',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="bg-white border border-[#dde4ea] rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#4A8FA3]">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>D</span>
            </div>
            <span className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Dall Academy
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-[#1A1A2E] mt-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Sign in to continue your SDLE prep</p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-[#dde4ea] rounded-lg text-[#1A1A2E] font-medium text-sm hover:bg-[#F5F9FB] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.440 1.345l2.582-2.580C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-[#dde4ea]" />
          <span className="text-xs text-[#9CA3AF]">or</span>
          <hr className="flex-1 border-[#dde4ea]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#6B7280] mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-white border border-[#dde4ea] rounded-lg text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:border-[#4A8FA3] focus:ring-1 focus:ring-[#4A8FA3] transition-colors"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#6B7280] mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 bg-white border border-[#dde4ea] rounded-lg text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:border-[#4A8FA3] focus:ring-1 focus:ring-[#4A8FA3] transition-colors"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#1A1A2E] text-white font-semibold rounded-lg hover:bg-[#4A8FA3] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#6B7280] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#4A8FA3] hover:underline font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  )
}
