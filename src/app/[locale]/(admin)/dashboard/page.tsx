import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

async function getStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('admin_dashboard_stats')
    .select('*')
    .single()
  return data
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Users',      value: stats?.total_users ?? '—',       icon: '👥', color: 'text-blue-400' },
    { label: 'Active (24h)',      value: stats?.active_users_24h ?? '—',  icon: '✅', color: 'text-green-400' },
    { label: 'Pending Photos',    value: stats?.pending_photos ?? '—',    icon: '⏳', color: 'text-yellow-400' },
    { label: 'Published Photos',  value: stats?.published_photos ?? '—',  icon: '📸', color: 'text-purple-400' },
    { label: 'Rejected Photos',   value: stats?.rejected_photos ?? '—',   icon: '❌', color: 'text-red-400' },
    { label: 'Total Votes',       value: stats?.total_votes ?? '—',       icon: '🗳️', color: 'text-yellow-400' },
    { label: 'Total Comments',    value: stats?.total_comments ?? '—',    icon: '💬', color: 'text-pink-400' },
    { label: 'Pending Reports',   value: stats?.pending_reports ?? '—',   icon: '🚨', color: 'text-orange-400' },
  ]

  const revenue = stats?.total_revenue_cents
    ? `${(Number(stats.total_revenue_cents) / 100).toFixed(2)}€`
    : '0.00€'

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Dashboard</h1>
      <p className="text-white/40 text-sm mb-8">Resumen general de la plataforma</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(stat => (
          <div key={stat.label} className="bg-[#111] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value?.toString()}</p>
            <p className="text-white/40 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + credits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">💰 Revenue Total</p>
          <p className="text-3xl font-black text-green-400">{revenue}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">💳 Créditos Vendidos</p>
          <p className="text-3xl font-black text-yellow-400">{stats?.credits_purchased ?? 0}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">🔥 Créditos Consumidos</p>
          <p className="text-3xl font-black text-white">{stats?.credits_consumed ?? 0}</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-bold text-white mb-4">Acciones rápidas</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Moderar fotos pendientes', href: 'moderation', icon: '🛡️', urgent: (stats?.pending_photos ?? 0) > 0 },
          { label: 'Revisar reportes',         href: 'reports',    icon: '🚨', urgent: (stats?.pending_reports ?? 0) > 0 },
          { label: 'Gestionar usuarios',       href: 'users',      icon: '👥', urgent: false },
          { label: 'Ver estadísticas',         href: 'stats',      icon: '📈', urgent: false },
          { label: 'Configurar créditos',      href: 'credits',    icon: '💳', urgent: false },
          { label: 'Documentos legales',       href: 'legal',      icon: '📄', urgent: false },
        ].map(action => (
          <a
            key={action.label}
            href={action.href}
            className={`bg-[#111] border rounded-2xl p-5 flex items-center gap-3 hover:bg-white/5 transition-colors ${
              action.urgent ? 'border-yellow-400/30' : 'border-white/5'
            }`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-white/80 text-sm font-medium">{action.label}</span>
            {action.urgent && <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
          </a>
        ))}
      </div>
    </div>
  )
}
