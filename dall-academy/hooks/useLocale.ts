'use client'
import { useState, useEffect } from 'react'
import { type Locale, t, getDirection, type TranslationKey } from '@/lib/i18n'

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const saved = (localStorage.getItem('dall-locale') || 'en') as Locale
    setLocale(saved)
  }, [])

  return {
    locale,
    dir: getDirection(locale),
    isRTL: locale === 'ar',
    t: (key: TranslationKey) => t(locale, key),
    fontFamily: locale === 'ar' ? "'IBM Plex Arabic', sans-serif" : "'DM Sans', sans-serif",
  }
}
