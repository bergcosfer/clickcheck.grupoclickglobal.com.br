import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn, statusColors, statusLabels, priorityColors, priorityLabels, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ClipboardList,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Play,
  Edit3,
  RotateCcw,
  Trash2,
  Loader2,
  ExternalLink,
  X,
  Check,
  Bell,
  BellRing,
} from 'lucide-react'

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgn...')
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    console.log('Audio not supported')
  }
}

// Request Card Component
function RequestCard({ request, users, onValidate, onViewDetails, onCorrect, onRevert, onDelete, currentUser, isAdmin, can }) {
  const requester = users.find(u => u.email === request.requested_by)
  const validator = users.find(u => u.email === request.assigned_to)
  
  const isAssignedToMe = request.assigned_to === currentUser?.email
  const isMyRequest = request.requested_by === currentUser?.email
  const isPending = request.status === 'pendente' || request.status === 'em_analise'
  const needsCorrection = request.status === 'aprovado_parcial' || request.status === 'reprovado'
  const isApproved = request.status === 'aprovado'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{request.title}</h3>
          {request.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{request.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("px-3 py-1 text-xs font-medium rounded-full", statusColors[request.status])}>
            {statusLabels[request.status]}
          </span>
          <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", priorityColors[request.priority])}>
            {priorityLabels[request.priority]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-slate-400">Solicitante:</span>
          <p className="font-medium text-slate-700">{requester?.nickname || requester?.full_name || request.requested_by}</p>
        </div>
        <div>
          <span className="text-slate-400">Validador:</span>
          <p className="font-medium text-slate-700">{validator?.nickname || validator?.full_name || request.assigned_to}</p>
        </div>
        <div>
          <span className="text-slate-400">Pacote:</span>
          <p className="font-medium text-slate-700">{request.package_name}</p>
        </div>
        <div>
          <span className="text-slate-400">Links:</span>
          <p className="font-medium text-slate-700">{request.approved_links_count || 0}/{request.total_links_count || request.content_urls?.length || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(request.created_at, 'datetime')}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(request)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isAssignedToMe && isPending && can('validate') && (
            <button
              onClick={() => onValidate(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              Validar
            </button>
          )}

          {isMyRequest && needsCorrection && can('create_validation') && (
            <button
              onClick={() => onCorrect(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Corrigir
            </button>
          )}

          {isAdmin && isApproved && (
            <button
              onClick={() => onRevert(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reverter
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onDelete(request)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-xl w-full overflow-hidden", sizes[size])}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function CentralValidacao() {
  const { user, isAdmin, can } = useAuth()
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('recebidas')
  const previousCountRef = useRef(0)
  const [hasNewValidation, setHasNewValidation] = useState(false)
  
  // Modals
  const [validationModal, setValidationModal] = useState({ open: false, request: null, readOnly: false })
  const [correctionModal, setCorrectionModal] = useState({ open: false, request: null })
  const [revertModal, setRevertModal] = useState({ open: false, request: null })

  const loadData = useCallback(async (isInitial = false) => {
    try {
      const [reqData, usersData] = await Promise.all([
        api.listRequests(),
        isInitial ? api.listUsers() : Promise.resolve(users),
      ])
      
      // Check for new validations assigned to me
      const myPendingCount = reqData.filter(r => 
        r.assigned_to === user?.email && 
        (r.status === 'pendente' || r.status === 'em_analise')
      ).length
      
      if (!isInitial && myPendingCount > previousCountRef.current) {
        // New validation arrived!
        playNotificationSound()
        toast.success('🔔 Nova validação recebida!', {
          duration: 5000,
          icon: <BellRing className="w-5 h-5 text-emerald-500" />
        })
        setHasNewValidation(true)
        setTimeout(() => setHasNewValidation(false), 3000)
      }
      
      previousCountRef.current = myPendingCount
      setRequests(reqData)
      if (isInitial) setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.email, users])

  useEffect(() => {
    loadData(true)
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => loadData(false), 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const filterRequests = () => {
    let filtered = requests

    switch (activeTab) {
      case 'recebidas':
        // Only show if user can validate
        if (!can('view_assigned') && !can('validate')) return []
        filtered = filtered.filter(r => 
          r.assigned_to === user?.email && 
          (r.status === 'pendente' || r.status === 'em_analise')
        )
        break
      case 'minhas':
        // Show my requests if I can create or view all
        if (!can('create_validation') && !can('view_all_validations')) return []
        filtered = filtered.filter(r => r.requested_by === user?.email)
        break
      case 'todas':
        // Only for users with view_all_validations permission
        if (!can('view_all_validations')) return []
        break
      case 'parcial':
        filtered = filtered.filter(r => 
          r.requested_by === user?.email && r.status === 'aprovado_parcial'
        )
        break
      case 'finalizadas':
        if (can('view_all_validations')) {
          filtered = filtered.filter(r => 
            r.status === 'aprovado' || r.status === 'reprovado'
          )
        } else {
          filtered = filtered.filter(r => 
            (r.requested_by === user?.email || r.assigned_to === user?.email) &&
            (r.status === 'aprovado' || r.status === 'reprovado')
          )
        }
        break
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.package_name?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  const handleDelete = async (request) => {
    if (!confirm(`Excluir a validação "${request.title}"?`)) return
    
    try {
      await api.deleteRequest(request.id)
      toast.success('Validação excluída')
      loadData(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Build tabs based on permissions
  const tabs = []
  if (can('view_assigned') || can('validate')) {
    tabs.push({ id: 'recebidas', label: 'Recebidas', icon: ClipboardList })
  }
  if (can('create_validation') || can('view_all_validations')) {
    tabs.push({ id: 'minhas', label: 'Minhas Solicitações', icon: Clock })
  }
  if (can('view_all_validations')) {
    tabs.push({ id: 'todas', label: 'Todas', icon: Eye })
  }
  tabs.push({ id: 'parcial', label: 'Aprovaods Parcial', icon: AlertCircle })
  tabs.push({ id: 'finalizadas', label: 'Finalizadas', icon: CheckCircle })

  const filteredRequests = filterRequests()

  // Get count of pending validations for me
  const pendingForMeCount = requests.filter(r => 
    r.assigned_to === user?.email && 
    (r.status === 'pendente' || r.status === 'em_analise')
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center",
                hasNewValidation && "animate-bounce"
              )}>
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              Central de Validação
              {pendingForMeCount > 0 && (
                <span className="px-2 py-0.5 text-sm font-bold bg-red-500 text-white rounded-full animate-pulse">
                  {pendingForMeCount}
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1">Gerencie todas as suas validações</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar validações..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {/* New validation alert */}
      {hasNewValidation && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <BellRing className="w-6 h-6 text-emerald-600" />
          <span className="text-emerald-800 font-medium">Nova validação recebida! Confira a aba "Recebidas".</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1 border border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon
          const count = tab.id === 'recebidas' ? pendingForMeCount : 0
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 text-xs font-bold rounded-full",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-red-500 text-white"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Request List */}
      {filteredRequests.length > 0 ? (
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              users={users}
              currentUser={user}
              isAdmin={isAdmin}
              can={can}
              onValidate={r => setValidationModal({ open: true, request: r, readOnly: false })}
              onViewDetails={r => setValidationModal({ open: true, request: r, readOnly: true })}
              onCorrect={r => setCorrectionModal({ open: true, request: r })}
              onRevert={r => setRevertModal({ open: true, request: r })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma validação encontrada</p>
        </div>
      )}

      {/* Validation Modal */}
      <Modal
        open={validationModal.open}
        onClose={() => setValidationModal({ open: false, request: null, readOnly: false })}
        title={validationModal.readOnly ? 'Detalhes da Validação' : 'Validar Solicitação'}
        size="lg"
      >
        {validationModal.request && (
          <ValidationModalContent
            request={validationModal.request}
            readOnly={validationModal.readOnly}
            onClose={() => {
              setValidationModal({ open: false, request: null, readOnly: false })
              loadData(false)
            }}
          />
        )}
      </Modal>

      {/* Correction Modal */}
      <Modal
        open={correctionModal.open}
        onClose={() => setCorrectionModal({ open: false, request: null })}
        title="Corrigir e Reenviar"
        size="md"
      >
        {correctionModal.request && (
          <CorrectionModalContent
            request={correctionModal.request}
            onClose={() => {
              setCorrectionModal({ open: false, request: null })
              loadData(false)
            }}
          />
        )}
      </Modal>

      {/* Revert Modal */}
      <Modal
        open={revertModal.open}
        onClose={() => setRevertModal({ open: false, request: null })}
        title="Reverter Aprovação"
        size="sm"
      >
        {revertModal.request && (
          <RevertModalContent
            request={revertModal.request}
            onClose={() => {
              setRevertModal({ open: false, request: null })
              loadData(false)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

// Validation Modal Content
function ValidationModalContent({ request, readOnly, onClose }) {
  const [validationData, setValidationData] = useState(request.validation_per_link || [])
  const [finalObservations, setFinalObservations] = useState(request.final_observations || '')
  const [activeLink, setActiveLink] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleLinkStatus = (index, status) => {
    setValidationData(prev => prev.map((link, i) => 
      i === index ? { ...link, status } : link
    ))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.validateRequest(request.id, {
        validation_per_link: validationData,
        final_observations: finalObservations,
      })
      toast.success('Validação finalizada!')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const allLinksJudged = validationData.every(link => link.status !== 'pendente')

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="font-semibold text-slate-900">{request.title}</h3>
        {request.description && <p className="text-sm text-slate-500 mt-1">{request.description}</p>}
        <p className="text-sm text-slate-400 mt-2">Pacote: {request.package_name}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {request.content_urls?.map((url, index) => (
          <button
            key={index}
            onClick={() => setActiveLink(index)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeLink === index
                ? "bg-emerald-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            Link {index + 1}
            {validationData[index]?.status === 'aprovado' && <CheckCircle className="w-4 h-4 text-emerald-300" />}
            {validationData[index]?.status === 'reprovado' && <XCircle className="w-4 h-4 text-red-300" />}
          </button>
        ))}
      </div>

      {request.content_urls?.map((url, index) => (
        <div key={index} className={cn(index === activeLink ? 'block' : 'hidden')}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ExternalLink className="w-4 h-4" />
            {url}
          </a>

          {!readOnly && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleLinkStatus(index, 'aprovado')}
                className={cn(
                  "flex-1 py-2 rounded-lg font-medium transition-all",
                  validationData[index]?.status === 'aprovado'
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                )}
              >
                <Check className="w-4 h-4 inline mr-2" />
                Aprovar
              </button>
              <button
                onClick={() => handleLinkStatus(index, 'reprovado')}
                className={cn(
                  "flex-1 py-2 rounded-lg font-medium transition-all",
                  validationData[index]?.status === 'reprovado'
                    ? "bg-red-500 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                )}
              >
                <X className="w-4 h-4 inline mr-2" />
                Reprovar
              </button>
            </div>
          )}

          {readOnly && validationData[index] && (
            <div className={cn("px-4 py-2 rounded-lg text-sm font-medium mb-4", statusColors[validationData[index].status])}>
              Status: {statusLabels[validationData[index].status]}
            </div>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Observações Finais</label>
        <textarea
          value={finalObservations}
          onChange={e => setFinalObservations(e.target.value)}
          readOnly={readOnly}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
          placeholder="Observações gerais sobre a validação..."
        />
      </div>

      {!readOnly && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={!allLinksJudged || submitting} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Finalizar Validação'}
          </button>
        </div>
      )}
    </div>
  )
}

// Correction Modal Content
function CorrectionModalContent({ request, onClose }) {
  const [corrections, setCorrections] = useState(
    request.validation_per_link?.filter(link => link.status === 'reprovado')?.map(link => ({ original: link.url, new_url: '' })) || []
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const missingUrls = corrections.filter(c => !c.new_url.trim())
    if (missingUrls.length > 0) {
      toast.error('Preencha todos os novos links')
      return
    }

    setSubmitting(true)
    try {
      const newUrls = request.content_urls?.map((url, index) => {
        const linkData = request.validation_per_link?.[index]
        if (linkData?.status === 'reprovado') {
          const correction = corrections.find(c => c.original === url)
          return correction?.new_url || url
        }
        return url
      }) || []

      await api.correctRequest(request.id, {
        content_urls: newUrls,
        correction_notes: notes,
      })
      toast.success('Correção enviada!')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600">Corrija os links reprovados e reenvie para uma nova validação.</p>

      {corrections.map((correction, index) => (
        <div key={index} className="space-y-2">
          <div className="text-sm">
            <span className="text-slate-400">Link reprovado:</span>
            <p className="text-red-600 truncate">{correction.original}</p>
          </div>
          <input
            type="url"
            value={correction.new_url}
            onChange={e => setCorrections(prev => prev.map((c, i) => i === index ? { ...c, new_url: e.target.value } : c))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            placeholder="Novo link corrigido..."
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notas da Correção</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none" placeholder="Descreva as correções realizadas..." />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reenviar Correção'}
        </button>
      </div>
    </div>
  )
}

// Revert Modal Content
function RevertModalContent({ request, onClose }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Informe o motivo da reversão')
      return
    }

    setSubmitting(true)
    try {
      await api.revertRequest(request.id, reason)
      toast.success('Aprovação revertida!')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600">Esta ação irá reverter a aprovação da validação "{request.title}" para o status "Pendente".</p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Motivo da Reversão *</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none" placeholder="Explique o motivo da reversão..." />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Reversão'}
        </button>
      </div>
    </div>
  )
}
