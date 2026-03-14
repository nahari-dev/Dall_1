import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/guider', '/qbank', '/mock', '/progress', '/settings', '/onboarding']
const adminRoutes = ['/admin']
const authRoutes = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))
  const isAuth = authRoutes.some((r) => pathname.startsWith(r))

  if ((isProtected || isAdmin) && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdmin && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
