import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const PROTECTED_ROUTES = ['/feed', '/upload', '/profile', '/credits', '/my-photos', '/alerts', '/buy-credits', '/results']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login', '/register', '/adults-only']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix para comparar rutas
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'

  const isProtected = PROTECTED_ROUTES.some(r => pathnameWithoutLocale.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some(r => pathnameWithoutLocale.startsWith(r))
  const isAuth = AUTH_ROUTES.some(r => pathnameWithoutLocale.startsWith(r))

  // Si no es ruta protegida, solo aplicar i18n
  if (!isProtected && !isAdmin && !isAuth) {
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

  const { data: { user } } = await supabase.auth.getUser()

  // Detectar locale actual
  const locale = pathname.startsWith('/en') ? 'en' : 'es'

  if ((isProtected || isAdmin) && !user) {
    return NextResponse.redirect(new URL(`/${locale}/adults-only`, request.url))
  }

  if (isAuth && user) {
    return NextResponse.redirect(new URL(`/${locale}/feed`, request.url))
  }

  // Aplicar i18n sobre la respuesta autenticada
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)', '/(es|en)/:path*'],
}
