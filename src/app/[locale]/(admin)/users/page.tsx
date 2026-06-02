'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type AdminUser = {
  id: string
  nickname: string
  email: string
  age: number
  gender: string
  status: string
  credits_balance: number
  country_code: string | null
  is_admin: boolean
  last_seen_at: string | null
  created_at: string
  published_photos: number
  total_votes_cast: number
}

const statusColors: Record<string, string> = {
  active:    'bg-green-500/20 text-green-400',
  suspended: 'bg-yellow-400/20 text-yellow-400',
  banned:    'bg-red-500/20 text-red-400',
  deleted:   'bg-white/10 text-white/30',
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [creditAmount, setCreditAmount] = useState('')

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admin_users_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    u.nickname?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (userId: string, status: string) => {
    setActing(userId)
    await supabase.from('users').update({ status }).eq('id', userId)
    setUsers(u => u.map(x => x.id === userId ? { ...x, status } : x))
    setActing(null)
  }

  const adjustCredits = async (userId: string, amount: number, type: 'admin_add' | 'admin_remove') => {
    const supabaseWithKey = createClient()
    const { data: { session } } = await supabaseWithKey.auth.getSession()
    if (!session) return
    await supabaseWithKey.rpc(type === 'admin_add' ? 'add_credits' : 'spend_credits', {
      p_user_id: userId,
      p_amount: Math.abs(amount),
      p_type: type,
      p_description: `Ajuste manual desde admin`,
    })
    setUsers(u => u.map(x => x.id === userId ? {
      ...x,
      credits_balance: type === 'admin_add' ? x.credits_balance + amount : x.credits_balance - amount
    } : x))
    setSelected(null)
    setCreditAmount('')
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Usuarios</h1>
      <p className="text-white/40 text-sm mb-6">Gestión de usuarios · {users.length} total</p>

      <input
        type="text"
        placeholder="Buscar por nickname, email o ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 mb-6"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Nickname','Email','Edad','Género','País','Estado','Créditos','Fotos','Acciones'].map(h => (
                  <th key={h} className="text-left text-white/40 font-medium px-4 py-3 text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{user.nickname}</span>
                      {user.is_admin && <span className="text-yellow-400 text-xs">★</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-white/70">{user.age}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{user.gender}</td>
                  <td className="px-4 py-3 text-white/50">{user.country_code?.toUpperCase() ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[user.status] ?? ''}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{user.credits_balance}</td>
                  <td className="px-4 py-3 text-white/50">{user.published_photos}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelected(selected?.id === user.id ? null : user)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg transition-colors"
                      >
                        Ver
                      </button>
                      {user.status === 'active' && (
                        <button
                          disabled={acting === user.id}
                          onClick={() => updateStatus(user.id, 'suspended')}
                          className="text-xs bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Suspender
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          disabled={acting === user.id}
                          onClick={() => updateStatus(user.id, 'active')}
                          className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Restaurar
                        </button>
                      )}
                      {user.status !== 'banned' && user.status !== 'deleted' && (
                        <button
                          disabled={acting === user.id}
                          onClick={() => updateStatus(user.id, 'banned')}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Ban
                        </button>
                      )}
                      {user.status === 'banned' && (
                        <button
                          disabled={acting === user.id}
                          onClick={() => updateStatus(user.id, 'active')}
                          className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Restaurar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel de usuario seleccionado */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black">{selected.nickname}</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 text-sm mb-6">
              <p className="text-white/50">Email: <span className="text-white">{selected.email}</span></p>
              <p className="text-white/50">ID: <span className="text-white/70 text-xs">{selected.id}</span></p>
              <p className="text-white/50">Registrado: <span className="text-white">{new Date(selected.created_at).toLocaleDateString('es-ES')}</span></p>
              <p className="text-white/50">Último acceso: <span className="text-white">{selected.last_seen_at ? new Date(selected.last_seen_at).toLocaleDateString('es-ES') : 'Nunca'}</span></p>
              <p className="text-white/50">Votos emitidos: <span className="text-white">{selected.total_votes_cast}</span></p>
              <p className="text-white/50">Créditos: <span className="text-yellow-400 font-bold">{selected.credits_balance}</span></p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <p className="text-white/40 text-xs mb-2">Ajuste de créditos</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                />
                <button
                  onClick={() => adjustCredits(selected.id, Number(creditAmount), 'admin_add')}
                  disabled={!creditAmount}
                  className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl px-3 py-2 text-sm font-bold hover:bg-green-500/30 disabled:opacity-50"
                >
                  + Añadir
                </button>
                <button
                  onClick={() => adjustCredits(selected.id, Number(creditAmount), 'admin_remove')}
                  disabled={!creditAmount}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-3 py-2 text-sm font-bold hover:bg-red-500/30 disabled:opacity-50"
                >
                  − Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
