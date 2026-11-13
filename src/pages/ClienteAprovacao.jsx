import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/api'
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function ClienteAprovacao() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [decision, setDecision] = useState(null)
  const [showReject, setShowReject] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getClientReview(token)
      .then(d => setData(d))
      .catch(e => setError(e.message || 'Link inválido'))
      .finally(() => setLoading(false))
  }, [token])

  const submitDecision = async (dec, fb = '') => {
    setSubmitting(true)
    try {
      await api.submitClientReview(token, dec, fb)
      setDecision(dec)
      setShowReject(false)
    } catch (e) {
      setError(e.message || 'Erro ao enviar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-slate-600">{error}</p>
      </div>
    )
  }

  if (decision) {
    const ok = decision === 'aprovado'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        {ok
          ? <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          : <XCircle className="w-16 h-16 text-red-500 mb-4" />}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {ok ? 'Aprovado!' : 'Feedback enviado!'}
        </h1>
        <p className="text-slate-500">
          {ok ? 'Obrigado! Sua aprovação foi registrada.' : 'Obrigado! Seu feedback foi enviado à equipe.'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.title}</h1>
          {data.client_name && <p className="text-sm text-slate-400 mb-4">{data.client_name}</p>}
          {data.description && <p className="text-slate-600 whitespace-pre-wrap mb-6">{data.description}</p>}

          {Array.isArray(data.description_images) && data.description_images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {data.description_images.map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-xl border border-slate-200" />
              ))}
            </div>
          )}

          {Array.isArray(data.content_urls) && data.content_urls.length > 0 && (
            <div className="space-y-4 mb-8">
              {data.content_urls.map((url, i) => renderContent(url, i))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => submitDecision('aprovado')}
              disabled={submitting}
              className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" /> Aprovar
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={submitting}
              className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-5 h-5" /> Reprovar
            </button>
          </div>
        </div>
      </div>

      {showReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">O que precisa ser ajustado?</h2>
            <textarea
              autoFocus
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none mb-4"
              placeholder="Descreva as mudanças necessárias..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReject(false); setFeedback('') }}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => submitDecision('reprovado', feedback)}
                disabled={submitting || !feedback.trim()}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function renderContent(url, i) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/)
  if (yt) {
    return (
      <iframe
        key={i}
        src={`https://www.youtube.com/embed/${yt[1]}`}
        className="w-full aspect-video rounded-xl border border-slate-200"
        allowFullScreen
      />
    )
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return <video key={i} src={url} controls className="w-full rounded-xl border border-slate-200" />
  }
  return <img key={i} src={url} alt="" className="w-full rounded-xl border border-slate-200" />
}
