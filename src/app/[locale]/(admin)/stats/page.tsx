import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

async function getStats() {
  const supabase = await createClient()

  const [
    { data: votesPerDay },
    { data: uploadsPerDay },
    { data: usersPerDay },
    { data: topCategories },
    { data: reactionBreakdown },
  ] = await Promise.all([
    supabase.from('votes').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('photos').select('created_at, status').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('users').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('photos').select('category').eq('status', 'published'),
    supabase.from('votes').select('reaction'),
  ])

  // Agrupar votos por día
  const votesByDay = groupByDay(votesPerDay ?? [])
  const uploadsByDay = groupByDay(uploadsPerDay ?? [])
  const usersByDay = groupByDay(usersPerDay ?? [])

  // Categorías más populares
  const catCount: Record<string, number> = {}
  topCategories?.forEach(p => { catCount[p.category] = (catCount[p.category] ?? 0) + 1 })

  // Breakdown de reacciones
  const reactionCount: Record<string, number> = { hot: 0, nice: 0, ok: 0, nope: 0 }
  reactionBreakdown?.forEach(v => { reactionCount[v.reaction] = (reactionCount[v.reaction] ?? 0) + 1 })
  const totalReactions = Object.values(reactionCount).reduce((a, b) => a + b, 0)

  return { votesByDay, uploadsByDay, usersByDay, catCount, reactionCount, totalReactions }
}

function groupByDay(items: { created_at: string }[]): Record<string, number> {
  const result: Record<string, number> = {}
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  last7.forEach(day => result[day] = 0)
  items.forEach(item => {
    const day = item.created_at.split('T')[0]
    if (result[day] !== undefined) result[day]++
  })
  return result
}

const reactionEmojis: Record<string, string> = {
  hot: '🔥', nice: '😍', ok: '🙂', nope: '👎'
}

const categoryEmojis: Record<string, string> = {
  body: '🧍', chest: '👕', back: '🔙', butt: '🍑', intimate: '🔞'
}

export default async function StatsPage() {
  const { votesByDay, uploadsByDay, usersByDay, catCount, reactionCount, totalReactions } = await getStats()

  const days = Object.keys(votesByDay)
  const maxVotes = Math.max(...Object.values(votesByDay), 1)

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Estadísticas</h1>
      <p className="text-white/40 text-sm mb-8">Últimos 7 días</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Votos por día */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">🗳️ Votos por día</h2>
          <div className="flex items-end gap-2 h-32">
            {days.map(day => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-yellow-400/80 rounded-t-md transition-all"
                  style={{ height: `${((votesByDay[day] ?? 0) / maxVotes) * 100}%`, minHeight: 2 }}
                />
                <span className="text-white/30 text-xs">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Uploads por día */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">📸 Uploads por día</h2>
          <div className="flex items-end gap-2 h-32">
            {days.map(day => {
              const max = Math.max(...Object.values(uploadsByDay), 1)
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-purple-400/80 rounded-t-md transition-all"
                    style={{ height: `${((uploadsByDay[day] ?? 0) / max) * 100}%`, minHeight: 2 }}
                  />
                  <span className="text-white/30 text-xs">{day.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reacciones breakdown */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">❤️ Breakdown de reacciones</h2>
          <div className="space-y-3">
            {Object.entries(reactionCount).map(([reaction, count]) => {
              const pct = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0
              return (
                <div key={reaction}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm">{reactionEmojis[reaction]} {reaction.toUpperCase()}</span>
                    <span className="text-white font-bold text-sm">{pct}% <span className="text-white/40 font-normal">({count})</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Categorías más populares */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">📂 Fotos por categoría</h2>
          <div className="space-y-3">
            {Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const total = Object.values(catCount).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm capitalize">{categoryEmojis[cat]} {cat}</span>
                    <span className="text-white font-bold text-sm">{count} <span className="text-white/40 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Nuevos usuarios */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">👥 Nuevos usuarios por día</h2>
        <div className="flex items-end gap-2 h-24">
          {days.map(day => {
            const max = Math.max(...Object.values(usersByDay), 1)
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-white/50 text-xs">{usersByDay[day] ?? 0}</span>
                <div
                  className="w-full bg-green-400/80 rounded-t-md"
                  style={{ height: `${((usersByDay[day] ?? 0) / max) * 60}px`, minHeight: 2 }}
                />
                <span className="text-white/30 text-xs">{day.slice(5)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
