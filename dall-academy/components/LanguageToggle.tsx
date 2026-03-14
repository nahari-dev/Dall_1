'use client'
import { useState, useEffect } from 'react'

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const [locale, setLocale] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const saved = localStorage.getItem('dall-locale') || 'en'
    setLocale(saved as 'en' | 'ar')
    document.documentElement.lang = saved
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const toggle = () => {
    const next = locale === 'en' ? 'ar' : 'en'
    setLocale(next)
    localStorage.setItem('dall-locale', next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    window.location.reload()
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${className}`}
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className="text-sm">{locale === 'en' ? '\u{1F1F8}\u{1F1E6}' : '\u{1F1EC}\u{1F1E7}'}</span>
      <span>{locale === 'en' ? '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' : 'English'}</span>
    </button>
  )
}
