import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { href: 'dashboard',  label: 'Dashboard',   icon: '📊' },
  { href: 'moderation', label: 'Moderation',  icon: '🛡️' },
  { href: 'users',      label: 'Users',        icon: '👥' },
  { href: 'reports',    label: 'Reports',      icon: '🚨' },
  { href: 'comments',   label: 'Comments',     icon: '💬' },
  { href: 'credits',    label: 'Credits',      icon: '💳' },
  { href: 'stats',      label: 'Statistics',   icon: '📈' },
  { href: 'legal',      label: 'Legal Docs',   icon: '📄' },
]

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  // Verificar sesión via cookies (más fiable en SSR que getUser)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect(`/${locale}/admin-login`)

  // Verificar que es admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, status, nickname')
    .eq('id', session.user.id)
    .single()

  // Si no puede leer el perfil o no es admin, mostrar error en vez de redirigir
  const isAdmin = profile?.is_admin === true && profile?.status === 'active'
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="bg-[#111] border border-red-500/20 rounded-2xl p-8 max-w-sm text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-white font-bold mb-2">Acceso denegado</p>
          <p className="text-white/40 text-sm mb-4">No tienes permisos de administrador.</p>
          <a href={`/${locale}/feed`} className="text-yellow-400 text-sm underline">Volver al feed</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] border-r border-white/5 flex flex-col fixed h-full z-10">
        <div className="px-4 py-5 border-b border-white/5">
          <Image src="/logo.PNG" alt="Winko" width={90} height={32} className="object-contain" />
          <span className="text-yellow-400 text-xs font-bold mt-1 block">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={`/${locale}/${item.href}`}
              className="flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <p className="text-white/30 text-xs mb-1">{profile.nickname}</p>
          <p className="text-white/20 text-xs">Winko Admin v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
