'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type LegalDoc = {
  id: string
  type: string
  version: string
  is_active: boolean
  published_at: string
  content_es: string
  content_en: string
}

const typeLabels: Record<string, string> = {
  terms:             '📋 Términos de Servicio',
  privacy:           '🔒 Política de Privacidad',
  cookies:           '🍪 Política de Cookies',
  content_policy:    '📝 Política de Contenido',
  moderation_policy: '🛡️ Política de Moderación',
  dmca:              '⚖️ DMCA',
}

export default function LegalPage() {
  const [docs, setDocs] = useState<LegalDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LegalDoc | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editDoc, setEditDoc] = useState<LegalDoc | null>(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'es' | 'en'>('es')

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('legal_documents')
      .select('*')
      .order('published_at', { ascending: false })
    setDocs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveDoc = async () => {
    if (!editDoc) return
    setSaving(true)
    if (editDoc.id) {
      await supabase.from('legal_documents').update({
        content_es: editDoc.content_es,
        content_en: editDoc.content_en,
        version: editDoc.version,
      }).eq('id', editDoc.id)
    } else {
      // Nueva versión — desactivar la anterior del mismo tipo
      await supabase.from('legal_documents').update({ is_active: false }).eq('type', editDoc.type)
      await supabase.from('legal_documents').insert({
        type: editDoc.type,
        version: editDoc.version,
        content_es: editDoc.content_es,
        content_en: editDoc.content_en,
        is_active: true,
      })
    }
    setEditMode(false)
    setEditDoc(null)
    setSelected(null)
    load()
    setSaving(false)
  }

  const activeDocs = docs.filter(d => d.is_active)

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Documentos Legales</h1>
      <p className="text-white/40 text-sm mb-8">Gestión de textos legales de la plataforma</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : editMode && editDoc ? (
        /* Editor */
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold">{typeLabels[editDoc.type] ?? editDoc.type}</h2>
            <button onClick={() => { setEditMode(false); setEditDoc(null) }} className="text-white/40 hover:text-white">✕ Cancelar</button>
          </div>

          <div className="mb-4">
            <label className="text-white/40 text-xs block mb-1">Versión</label>
            <input
              type="text"
              value={editDoc.version}
              onChange={e => setEditDoc({ ...editDoc, version: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white w-40 focus:outline-none focus:border-yellow-400/50"
            />
          </div>

          <div className="flex gap-2 mb-4">
            {(['es', 'en'] as const).map(l => (
              <button key={l} onClick={() => setTab(l)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === l ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60'}`}
              >
                {l === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
              </button>
            ))}
          </div>

          <textarea
            value={tab === 'es' ? editDoc.content_es : editDoc.content_en}
            onChange={e => setEditDoc(tab === 'es'
              ? { ...editDoc, content_es: e.target.value }
              : { ...editDoc, content_en: e.target.value }
            )}
            rows={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-yellow-400/50 resize-none"
          />

          <button
            onClick={saveDoc}
            disabled={saving}
            className="mt-4 w-full bg-yellow-400 text-black font-black rounded-xl py-3 hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar documento'}
          </button>
        </div>
      ) : selected ? (
        /* Vista detalle */
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold">{typeLabels[selected.type] ?? selected.type}</h2>
              <p className="text-white/40 text-xs mt-0.5">v{selected.version} · {new Date(selected.published_at).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditDoc({ ...selected }); setEditMode(true) }}
                className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-xl px-4 py-2 text-sm font-bold hover:bg-yellow-400/30"
              >
                ✏️ Editar
              </button>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {(['es', 'en'] as const).map(l => (
              <button key={l} onClick={() => setTab(l)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === l ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60'}`}
              >
                {l === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
              </button>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-4 whitespace-pre-wrap text-white/70 text-sm max-h-96 overflow-y-auto">
            {tab === 'es' ? selected.content_es : selected.content_en}
          </div>
        </div>
      ) : (
        /* Lista */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.keys(typeLabels).map(type => {
            const doc = activeDocs.find(d => d.type === type)
            return (
              <div
                key={type}
                onClick={() => doc && setSelected(doc)}
                className={`bg-[#111] border rounded-2xl p-5 transition-colors ${doc ? 'border-white/5 hover:border-white/20 cursor-pointer' : 'border-white/5 opacity-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">{typeLabels[type]}</span>
                  {doc ? (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">v{doc.version}</span>
                  ) : (
                    <span className="bg-white/10 text-white/30 text-xs px-2 py-0.5 rounded-full">Sin documento</span>
                  )}
                </div>
                {doc && (
                  <p className="text-white/30 text-xs">
                    Actualizado: {new Date(doc.published_at).toLocaleDateString('es-ES')}
                  </p>
                )}
                {!doc && (
                  <button
                    onClick={e => { e.stopPropagation(); setEditDoc({ id: '', type, version: '1.0', is_active: true, published_at: '', content_es: '', content_en: '' }); setEditMode(true) }}
                    className="mt-2 text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    + Crear documento
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
