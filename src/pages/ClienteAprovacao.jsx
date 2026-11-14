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
  const [rejecting, setRejecting] = useState(false) // modo reprovação (habilita pinos)
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

  // ---- Desenho (só funciona em modo reprovação) ----
  const startDraw = (e) => {
    if (!rejecting) return
    if (!imgRef.current) return
    e.preventDefault()
    const rect = imgRef.current.getBoundingClientRect()
    drawingRef.current = { startX: e.clientX - rect.left, startY: e.clientY - rect.top, rect }
    if (e.currentTarget && typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const moveDraw = (e) => {
    if (!drawingRef.current) return
    const { startX, startY, rect } = drawingRef.current
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const left = Math.min(startX, cx)
    const top = Math.min(startY, cy)
    const w = Math.abs(cx - startX)
    const h = Math.abs(cy - startY)
    setDrawRect({
      x: (left / rect.width) * 100,
      y: (top / rect.height) * 100,
      w: (w / rect.width) * 100,
      h: (h / rect.height) * 100,
    })
  }

  const endDraw = (e) => {
    if (!drawingRef.current) return
    const { startX, startY, rect } = drawingRef.current
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const left = Math.min(startX, cx)
    const top = Math.min(startY, cy)
    const w = Math.abs(cx - startX)
    const h = Math.abs(cy - startY)
    drawingRef.current = null
    setDrawRect(null)
    if (w < 8 || h < 8) return
    setPendingRect({
      image_url: mainImage || '',
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
      setRejecting(false)
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

  const descImages = Array.isArray(data.description_images) ? data.description_images : []
  const urls = Array.isArray(data.content_urls) ? data.content_urls.filter(u => u && String(u).trim()) : []
  const mainImage = descImages[0] || urls[0] || null
  const extraDescImages = mainImage === descImages[0] ? descImages.slice(1) : descImages
  const linkUrls = mainImage === urls[0] ? urls.slice(1) : urls

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{data.title}</h1>
          {data.client_name && <p className="text-sm text-slate-400 mb-4">{data.client_name}</p>}
          {data.description && <p className="text-slate-600 whitespace-pre-wrap mb-6">{data.description}</p>}

          {/* Imagem principal com pinos de anotação */}
          {mainImage && (
            <>
              <p className="text-xs text-slate-400 mb-2">
                {rejecting
                  ? '✏️ Arraste sobre a imagem para marcar uma área e escreva o ajuste. O pino fica salvo no local marcado.'
                  : '💡 Para pedir ajustes, clique em "Reprovar" e marque na imagem onde deseja alterar.'}
              </p>
              <div
                className={`relative w-full select-none rounded-xl overflow-hidden ${rejecting ? 'cursor-crosshair touch-none' : ''}`}
                onPointerDown={rejecting ? startDraw : undefined}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerCancel={endDraw}
              >
                <img ref={imgRef} src={mainImage} alt="" draggable={false} className="w-full block border border-slate-200" />

                {drawRect && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                    style={{ left: drawRect.x + '%', top: drawRect.y + '%', width: drawRect.w + '%', height: drawRect.h + '%' }}
                  />
                )}

                {annotations.map((a, i) => (
                  <div
                    key={i}
                    className="absolute pointer-events-none"
                    style={{ left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%' }}
                  >
                    <div className="absolute inset-0 border-2 border-red-500 bg-red-500/15 rounded-sm" />
                    {/* Pino numerado */}
                    <div
                      className="absolute pointer-events-auto"
                      style={{ left: 0, top: 0, transform: 'translate(-50%, -100%)' }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => removeAnnotation(i)}
                        title={a.comment}
                        className="relative block"
                      >
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                          {i + 1}
                        </span>
                        <span
                          className="absolute left-1/2"
                          style={{
                            bottom: -5,
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '6px solid #ef4444',
                          }}
                        />
                      </button>
                    </div>
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
                <div className="mt-3 space-y-2">
                  {annotations.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="pt-0.5">{a.comment}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Outras imagens da descrição */}
          {extraDescImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {extraDescImages.map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-xl border border-slate-200" />
              ))}
            </div>
          )}

          {/* Links de conteúdo (carrossel/vídeo) */}
          {linkUrls.length > 0 && (
            <div className="mt-4 space-y-1">
              {linkUrls.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline break-all">{u}</a>
              ))}
            </div>
          )}

          {/* Ações */}
          {!rejecting ? (
            <div className="grid grid-cols-2 gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                onClick={() => submitDecision('aprovado')}
                disabled={submitting}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> Aprovar
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={submitting}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" /> Reprovar
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-6 border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">O que precisa ser ajustado?</h2>
              {annotations.length > 0 && (
                <p className="text-xs text-slate-500 mb-2">{annotations.length} pino(s) marcado(s) na imagem.</p>
              )}
              <textarea
                autoFocus
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                placeholder="Descreva as mudanças necessárias..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setRejecting(false); setFeedback(''); setAnnotations([]); setPendingRect(null); setDraftText('') }}
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
          )}
        </div>
      </div>
    </div>
  )
}
