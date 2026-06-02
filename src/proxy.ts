import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const PROTECTED_ROUTES = ['/feed', '/upload', '/profile', '/my-photos', '/alerts', '/buy-credits', '/results']
const ADMIN_ROUTES = ['/dashboard', '/moderation', '/users', '/reports', '/comments', '/credits', '/stats', '/legal']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix para comparar rutas
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'

  const isProtected = PROTECTED_ROUTES.some(r => pathnameWithoutLocale.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some(r => pathnameWithoutLocale.startsWith(r))

  // Rutas públicas y onboarding — sin verificar sesión
  if (!isProtected && !isAdmin) {
    return intlMiddleware(request)
  }

  // Verificar sesión de Supabase
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Usar getSession() en vez de getUser() — lee desde cookies sin llamada a red
  const { data: { session } } = await supabase.auth.getSession()

  const locale = pathname.startsWith('/en') ? 'en' : 'es'

  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/adults-only`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)', '/(es|en)/:path*'],
}
