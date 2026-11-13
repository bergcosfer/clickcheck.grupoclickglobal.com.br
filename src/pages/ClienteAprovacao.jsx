import { useState, useEffect, useRef } from 'react'
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

  const [annotations, setAnnotations] = useState([])
  const [drawRect, setDrawRect] = useState(null)
  const [pendingRect, setPendingRect] = useState(null)
  const [draftText, setDraftText] = useState('')
  const imgRef = useRef(null)
  const drawingRef = useRef(null)

  useEffect(() => {
    api.getClientReview(token)
      .then(d => { setData(d); setAnnotations(d.client_annotations || []) })
      .catch(e => setError(e.message || 'Link inválido'))
      .finally(() => setLoading(false))
  }, [token])

  const handleMouseDown = (e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    drawingRef.current = { startX: e.clientX - rect.left, startY: e.clientY - rect.top }
  }

  const handleMouseMove = (e) => {
    if (!drawingRef.current || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const sx = drawingRef.current.startX
    const sy = drawingRef.current.startY
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const left = Math.min(sx, cx)
    const top = Math.min(sy, cy)
    const w = Math.abs(cx - sx)
    const h = Math.abs(cy - sy)
    setDrawRect({
      x: (left / rect.width) * 100,
      y: (top / rect.height) * 100,
      w: (w / rect.width) * 100,
      h: (h / rect.height) * 100,
    })
  }

  const handleMouseUp = (e) => {
    if (!drawingRef.current || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const sx = drawingRef.current.startX
    const sy = drawingRef.current.startY
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const left = Math.min(sx, cx)
    const top = Math.min(sy, cy)
    const w = Math.abs(cx - sx)
    const h = Math.abs(cy - sy)
    drawingRef.current = null
    setDrawRect(null)
    if (w < 8 || h < 8) return
    setPendingRect({
      image_url: data?.content_urls?.[0] || '',
      x: (left / rect.width) * 100,
      y: (top / rect.height) * 100,
      w: (w / rect.width) * 100,
      h: (h / rect.height) * 100,
    })
    setDraftText('')
  }

  const saveAnnotation = () => {
    if (!pendingRect || !draftText.trim()) return
    setAnnotations(prev => [...prev, { ...pendingRect, comment: draftText.trim() }])
    setPendingRect(null)
    setDraftText('')
  }

  const removeAnnotation = (idx) => {
    setAnnotations(prev => prev.filter((_, i) => i !== idx))
  }

  const submitDecision = async (dec) => {
    setSubmitting(true)
    try {
      await api.submitClientReview(token, dec, feedback, annotations)
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

          {/* Imagem principal com anotação por retângulo */}
          {Array.isArray(data.content_urls) && data.content_urls.length > 0 && (
            <>
              <p className="text-xs text-slate-400 mb-2">💡 Arraste sobre a imagem para marcar uma área e comentar.</p>
              <div
                className="relative w-full select-none cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <img ref={imgRef} src={data.content_urls[0]} alt="" draggable={false} className="w-full rounded-xl border border-slate-200" />

                {drawRect && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                    style={{ left: drawRect.x + '%', top: drawRect.y + '%', width: drawRect.w + '%', height: drawRect.h + '%' }}
                  />
                )}

                {annotations.map((a, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-red-500 bg-red-500/20 cursor-pointer"
                    style={{ left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%' }}
                    title={a.comment}
                    onClick={() => removeAnnotation(i)}
                  >
                    <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {pendingRect && (
                <div className="mt-3 p-3 border border-blue-200 rounded-xl bg-blue-50">
                  <textarea
                    autoFocus
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    rows={2}
                    placeholder="Descreva a alteração nesta região..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveAnnotation} disabled={!draftText.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      Adicionar comentário
                    </button>
                    <button onClick={() => setPendingRect(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {annotations.length > 0 && (
                <div className="mt-3 space-y-1">
                  {annotations.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                      <span>{a.comment}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 mt-6">
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
            {annotations.length > 0 && (
              <p className="text-xs text-slate-500 mb-2">{annotations.length} anotação(ões) marcada(s) na imagem.</p>
            )}
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
                onClick={() => submitDecision('reprovado')}
                disabled={submitting || (feedback.trim() === '' && annotations.length === 0)}
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
