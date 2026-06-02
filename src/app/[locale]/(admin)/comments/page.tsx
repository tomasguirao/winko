'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  content: string
  status: string
  created_at: string
  photo_id: string
  user: { nickname: string } | null
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, user:user_id(nickname)')
      .order('created_at', { ascending: false })
      .limit(100)
    setComments((data as Comment[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const deleteComment = async (id: string) => {
    await supabase.from('comments').update({ status: 'deleted' }).eq('id', id)
    setComments(c => c.map(x => x.id === id ? { ...x, status: 'deleted' } : x))
  }

  const filtered = comments.filter(c =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    (c.user as any)?.nickname?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Comentarios</h1>
      <p className="text-white/40 text-sm mb-6">Moderación de comentarios · {comments.length} total</p>

      <input
        type="text"
        placeholder="Buscar por contenido o nickname..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 mb-6"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-white font-bold">Sin comentarios</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(comment => (
            <div key={comment.id} className={`bg-[#111] border rounded-2xl p-4 flex items-start justify-between gap-4 ${comment.status === 'deleted' ? 'opacity-40 border-white/5' : 'border-white/5'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-sm">{(comment.user as any)?.nickname ?? '—'}</span>
                  {comment.status === 'deleted' && (
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">Eliminado</span>
                  )}
                </div>
                <p className="text-white/70 text-sm">"{comment.content}"</p>
                <p className="text-white/30 text-xs mt-1">{new Date(comment.created_at).toLocaleString('es-ES')}</p>
              </div>
              {comment.status !== 'deleted' && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 transition-colors flex-shrink-0"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
