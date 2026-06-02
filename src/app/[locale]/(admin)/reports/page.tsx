'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Report = {
  id: string
  type: 'photo' | 'comment'
  reason: string
  details: string | null
  status: string
  created_at: string
  photo_id: string | null
  comment_id: string | null
  reporter: { nickname: string } | null
}

const reasonLabels: Record<string, string> = {
  underage:       '🚨 Menor de edad',
  stolen_image:   '🖼 Imagen robada',
  face_visible:   '👤 Cara visible',
  offensive:      '⚠️ Contenido ofensivo',
  other:          '❓ Otro',
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-400/20 text-yellow-400',
  reviewed:  'bg-blue-400/20 text-blue-400',
  dismissed: 'bg-white/10 text-white/40',
  actioned:  'bg-green-500/20 text-green-400',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('reports')
      .select('*, reporter:reporter_id(nickname)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter === 'pending') query = query.eq('status', 'pending')

    const { data } = await query
    setReports((data as Report[]) ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateReport = async (id: string, status: string, action?: string) => {
    await supabase.from('reports').update({
      status,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      reviewed_at: new Date().toISOString(),
      action_taken: action ?? null,
    }).eq('id', id)
    setReports(r => r.map(x => x.id === id ? { ...x, status } : x))
  }

  const removeContent = async (report: Report) => {
    if (report.photo_id) {
      await supabase.from('photos').update({ status: 'deleted' }).eq('id', report.photo_id)
    }
    if (report.comment_id) {
      await supabase.from('comments').update({ status: 'deleted' }).eq('id', report.comment_id)
    }
    await updateReport(report.id, 'actioned', 'Contenido eliminado')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Reportes</h1>
          <p className="text-white/40 text-sm">{reports.length} reportes {filter === 'pending' ? 'pendientes' : 'total'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'all' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-white font-bold">Sin reportes pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(report => (
            <div key={report.id} className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold text-sm">{reasonLabels[report.reason] ?? report.reason}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[report.status] ?? ''}`}>
                      {report.status}
                    </span>
                    <span className="bg-white/10 text-white/40 text-xs px-2 py-0.5 rounded-full capitalize">
                      {report.type}
                    </span>
                  </div>
                  {report.details && (
                    <p className="text-white/50 text-xs mb-2">"{report.details}"</p>
                  )}
                  <p className="text-white/30 text-xs">
                    Por: {(report.reporter as any)?.nickname ?? 'Desconocido'} · {new Date(report.created_at).toLocaleString('es-ES')}
                  </p>
                </div>

                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeContent(report)}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 transition-colors"
                    >
                      Eliminar contenido
                    </button>
                    <button
                      onClick={() => updateReport(report.id, 'dismissed')}
                      className="bg-white/5 text-white/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                      Desestimar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
