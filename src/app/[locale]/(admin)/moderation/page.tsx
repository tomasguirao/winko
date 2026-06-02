'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type PendingPhoto = {
  photo_id: string
  storage_path: string
  category: string
  visibility: string
  uploaded_at: string
  user_id: string
  nickname: string
  user_age: number
  gender: string
  country_code: string | null
  user_published_count: number
}

export default function ModerationPage() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('admin_moderation_queue').select('*')
    setPhotos(data ?? [])

    // Obtener URLs firmadas para cada foto
    if (data && data.length > 0) {
      const urls: Record<string, string> = {}
      for (const photo of data) {
        const { data: signed } = await supabase.storage
          .from('photos')
          .createSignedUrl(photo.storage_path, 3600)
        if (signed) urls[photo.photo_id] = signed.signedUrl
      }
      setPhotoUrls(urls)
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const moderate = async (photoId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    setActing(photoId)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/moderate-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ photo_id: photoId, action, reason }),
    })

    setPhotos(p => p.filter(x => x.photo_id !== photoId))
    setRejectingId(null)
    setRejectReason('')
    setActing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Moderación de fotos</h1>
          <p className="text-white/40 text-sm">{photos.length} fotos pendientes de revisión</p>
        </div>
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2">
          <span className="text-yellow-400 font-bold text-sm">⏳ {photos.length} pendientes</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-white font-bold">Todo moderado</p>
          <p className="text-white/40 text-sm mt-1">No hay fotos pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {photos.map(photo => (
            <div key={photo.photo_id} className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start gap-5">
                {/* Photo */}
                <div className="w-24 h-32 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                  {photoUrls[photo.photo_id] ? (
                    <img
                      src={photoUrls[photo.photo_id]}
                      alt="pending"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/20 text-xs text-center">Cargando...</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">{photo.nickname}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {photo.user_age} años · {photo.gender} {photo.country_code ? `· ${photo.country_code.toUpperCase()}` : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full capitalize">{photo.category}</span>
                    <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">{photo.visibility}</span>
                    <span className="bg-white/10 text-white/40 text-xs px-2 py-0.5 rounded-full">{photo.user_published_count} fotos publicadas</span>
                  </div>
                  <p className="text-white/20 text-xs mt-2">
                    {new Date(photo.uploaded_at).toLocaleString('es-ES')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    disabled={acting === photo.photo_id}
                    onClick={() => moderate(photo.photo_id, 'approve')}
                    className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl px-4 py-2 text-sm font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    ✓ Aprobar
                  </button>
                  <button
                    disabled={acting === photo.photo_id}
                    onClick={() => setRejectingId(rejectingId === photo.photo_id ? null : photo.photo_id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    ✕ Rechazar
                  </button>
                  <button
                    disabled={acting === photo.photo_id}
                    onClick={() => moderate(photo.photo_id, 'delete')}
                    className="bg-white/5 text-white/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>

              {/* Reject reason */}
              {rejectingId === photo.photo_id && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                  <input
                    type="text"
                    placeholder="Motivo del rechazo (opcional)..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-400/50"
                  />
                  <button
                    onClick={() => moderate(photo.photo_id, 'reject', rejectReason)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-sm font-bold hover:bg-red-500/30 transition-colors"
                  >
                    Confirmar rechazo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
