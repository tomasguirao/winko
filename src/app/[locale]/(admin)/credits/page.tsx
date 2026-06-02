'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type CreditPackage = {
  id: string
  name_es: string
  name_en: string
  credits: number
  price_cents: number
  currency: string
  is_active: boolean
  sort_order: number
}

type CreditConfig = {
  id: string
  registration_bonus: number
  upload_bonus: number
  vote_cost: number
}

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [config, setConfig] = useState<CreditConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [editConfig, setEditConfig] = useState<CreditConfig | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: pkgs }, { data: cfg }] = await Promise.all([
      supabase.from('credit_packages').select('*').order('sort_order'),
      supabase.from('credit_config').select('*').single(),
    ])
    setPackages(pkgs ?? [])
    setConfig(cfg)
    setEditConfig(cfg)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveConfig = async () => {
    if (!editConfig) return
    setSaving(true)
    await supabase.from('credit_config').update({
      registration_bonus: editConfig.registration_bonus,
      upload_bonus: editConfig.upload_bonus,
      vote_cost: editConfig.vote_cost,
    }).eq('id', editConfig.id)
    setConfig(editConfig)
    setSaving(false)
  }

  const togglePackage = async (id: string, is_active: boolean) => {
    await supabase.from('credit_packages').update({ is_active }).eq('id', id)
    setPackages(p => p.map(x => x.id === id ? { ...x, is_active } : x))
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Créditos</h1>
      <p className="text-white/40 text-sm mb-8">Configuración del sistema de créditos</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Configuración general */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">⚙️ Configuración general</h2>
            {editConfig && (
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1">Créditos al registrarse</label>
                  <input
                    type="number"
                    value={editConfig.registration_bonus}
                    onChange={e => setEditConfig({ ...editConfig, registration_bonus: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1">Créditos por foto aprobada</label>
                  <input
                    type="number"
                    value={editConfig.upload_bonus}
                    onChange={e => setEditConfig({ ...editConfig, upload_bonus: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1">Coste por voto</label>
                  <input
                    type="number"
                    value={editConfig.vote_cost}
                    onChange={e => setEditConfig({ ...editConfig, vote_cost: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400/50"
                  />
                </div>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="w-full bg-yellow-400 text-black font-black rounded-xl py-2.5 hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {/* Paquetes */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">📦 Paquetes de créditos</h2>
            <div className="space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className={`border rounded-xl p-4 flex items-center justify-between ${pkg.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                  <div>
                    <p className="text-white font-bold">{pkg.name_es}</p>
                    <p className="text-white/40 text-xs">{pkg.credits} créditos · {(pkg.price_cents / 100).toFixed(2)}€</p>
                  </div>
                  <button
                    onClick={() => togglePackage(pkg.id, !pkg.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      pkg.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30'
                    }`}
                  >
                    {pkg.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
