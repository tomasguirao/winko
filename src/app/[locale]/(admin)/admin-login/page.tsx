'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string ?? 'es'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Verificar que es admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin, status')
      .eq('id', data.user.id)
      .single()

    if (!profile?.is_admin || profile?.status !== 'active') {
      await supabase.auth.signOut()
      setError('No tienes permisos de administrador')
      setLoading(false)
      return
    }

    router.push(`/${locale}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-3xl font-black text-yellow-400 tracking-tight mb-1">WINKO</div>
          <div className="text-white/30 text-xs tracking-widest">ADMIN PANEL</div>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
          <h1 className="text-white font-black text-xl mb-6">Acceso restringido</h1>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/40 text-xs block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="admin@winko.me"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs block mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-yellow-400 text-black font-black rounded-xl py-3 hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          Solo para administradores de Winko
        </p>
      </div>
    </div>
  )
}
