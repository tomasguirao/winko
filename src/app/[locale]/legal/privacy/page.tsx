import { createClient } from '@/lib/supabase/server'

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('legal_documents')
    .select('content_es, content_en, version, published_at')
    .eq('type', 'privacy')
    .eq('is_active', true)
    .single()

  const content = locale === 'en' ? doc?.content_en : doc?.content_es

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <a href="javascript:history.back()" className="text-yellow-400 text-sm hover:text-yellow-300">
            ← Volver
          </a>
          {doc && (
            <span className="text-white/30 text-xs">
              v{doc.version} · {new Date(doc.published_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          {content ? (
            <pre className="whitespace-pre-wrap font-sans text-white/80 text-sm leading-relaxed">
              {content}
            </pre>
          ) : (
            <p className="text-white/40">Documento no disponible.</p>
          )}
        </div>
      </div>
    </div>
  )
}
