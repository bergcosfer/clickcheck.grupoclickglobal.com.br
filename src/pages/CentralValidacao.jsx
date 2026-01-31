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
  ChevronDown,
} from 'lucide-react'

// Modal Component
function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-xl w-full overflow-hidden max-h-[90vh] flex flex-col", sizes[size])}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto grow">{children}</div>
      </div>
    </div>
  )
}

// Request Card Component
function RequestCard({ request, users, onValidate, onViewDetails, onEdit, onCorrect, onRevert, onDelete, currentUser, isAdmin, can }) {
  const requester = users.find(u => u.email === request.requested_by)
  const validator = users.find(u => u.email === request.assigned_to)
  
  const isAssignedToMe = request.assigned_to === currentUser?.email
  const isMyRequest = request.requested_by === currentUser?.email
  const isPending = request.status === 'pendente' || request.status === 'em_analise'
  const needsCorrection = request.status === 'aprovado_parcial' || request.status === 'reprovado'
  const isApproved = request.status === 'aprovado'

  const contentUrls = Array.isArray(request.content_urls) ? request.content_urls : JSON.parse(request.content_urls || '[]')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-lg truncate">{request.title}</h3>
          {request.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{request.description}</p>}
          {request.description_images && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {JSON.parse(request.description_images || '[]').slice(0, 3).map((img, idx) => (
                <img 
                  key={idx} src={img} alt="" 
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80" 
                  onClick={() => window.dispatchEvent(new CustomEvent('preview-image', { detail: img }))}
                />
              ))}
              {JSON.parse(request.description_images || '[]').length > 3 && (
                <span className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-500">+{JSON.parse(request.description_images || '[]').length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn("px-3 py-1 text-xs font-medium rounded-full", statusColors[request.status])}>{statusLabels[request.status]}</span>
          <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", priorityColors[request.priority])}>{priorityLabels[request.priority]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        <div className="min-w-0 font-medium"><span className="text-slate-400 block font-normal">Solicitante:</span><span className="truncate block">{request.requester_name || requester?.nickname || request.requested_by}</span></div>
        <div className="min-w-0 font-medium"><span className="text-slate-400 block font-normal">Validador:</span><span className="truncate block">{request.assigned_name || validator?.nickname || request.assigned_to}</span></div>
        <div className="min-w-0 font-medium"><span className="text-slate-400 block font-normal">Pacote:</span><span className="truncate block">{request.package_name}</span></div>
        <div className="font-medium"><span className="text-slate-400 block font-normal">Links:</span><span>{request.approved_links_count || 0}/{contentUrls.length}</span></div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(request.created_at, 'datetime')}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onViewDetails(request)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Ver Detalhes"><Eye className="w-4 h-4" /></button>
          
          {(isMyRequest || isAdmin || can('edit_validation')) && isPending && (
            <button onClick={() => onEdit(request)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit3 className="w-4 h-4" /></button>
          )}

          {isAssignedToMe && isPending && can('validate') && (
            <button onClick={() => onValidate(request)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"><Play className="w-4 h-4" /> Validar</button>
          )}

          {isMyRequest && needsCorrection && can('create_validation') && (
            <button onClick={() => onCorrect(request)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"><Edit3 className="w-4 h-4" /> Corrigir</button>
          )}

          {isAdmin && isApproved && (
            <button onClick={() => onRevert(request)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600"><RotateCcw className="w-4 h-4" /> Reverter</button>
          )}

          {(isAdmin || can('delete_validation')) && (
            <button onClick={() => onDelete(request)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function CentralValidacao() {
  const { user, isAdmin, can } = useAuth()
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [requesterFilter, setRequesterFilter] = useState('')
  const [validatorFilter, setValidatorFilter] = useState('')
  const [packageFilter, setPackageFilter] = useState('')
  const [activeTab, setActiveTab] = useState('recebidas')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const [validationModal, setValidationModal] = useState({ open: false, request: null, readOnly: false })
  const [correctionModal, setCorrectionModal] = useState({ open: false, request: null })
  const [revertModal, setRevertModal] = useState({ open: false, request: null })
  const [editModal, setEditModal] = useState({ open: false, request: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, request: null })

  useEffect(() => {
    const handlePreview = (e) => setPreviewImage(e.detail)
    window.addEventListener('preview-image', handlePreview)
    return () => window.removeEventListener('preview-image', handlePreview)
  }, [])

  useEffect(() => {
    setPage(1)
    loadData(1, activeTab, true)
  }, [activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadData(1, activeTab, true)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, requesterFilter, validatorFilter, packageFilter])

  const loadData = async (pageNum, tab, isReset = false) => {
    try {
      if (isReset) setLoading(true)
      else setLoadingMore(true)
      
      const [resp, usersData, pkgData] = await Promise.all([
        api.listRequests({ 
          page: pageNum, 
          limit: 10, 
          tab, 
          search: searchTerm,
          requested_by: requesterFilter,
          assigned_to: validatorFilter,
          package_id: packageFilter
        }),
        users.length === 0 ? api.listValidators() : Promise.resolve(users),
        packages.length === 0 ? api.listPackages(true) : Promise.resolve(packages)
      ])

      if (users.length === 0) setUsers(usersData)
      if (packages.length === 0) setPackages(pkgData)

      const items = resp.items || resp
      const meta = resp.meta || { pages: 1, page: 1 }

      if (isReset) setRequests(items)
      else setRequests(prev => [...prev, ...items])
      
      setHasMore(meta.page < meta.pages)
    } catch (error) { toast.error('Erro ao carregar dados') } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadData(nextPage, activeTab, false)
  }

  const handleDelete = (request) => {
    setDeleteModal({ open: true, request })
  }

  const tabs = [
    { id: 'recebidas', label: 'Recebidas', icon: ClipboardList, show: can('view_assigned') || can('validate') },
    { id: 'minhas', label: 'Minhas Solicitações', icon: Clock, show: can('create_validation') || can('view_all_validations') },
    { id: 'todas', label: 'Todas', icon: Eye, show: can('view_all_validations') },
    { id: 'parcial', label: 'Parcial', icon: AlertCircle, show: true },
    { id: 'finalizadas', label: 'Finalizadas', icon: CheckCircle, show: true },
  ].filter(t => t.show)

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-white" /></div>
            Central de Validação <span className="text-xs font-normal text-slate-400">v1.2.3</span>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie todas as suas validações</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Nome..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none w-full shadow-sm text-sm"
            />
          </div>
          
          <select 
            value={requesterFilter} 
            onChange={e => setRequesterFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[150px]"
          >
            <option value="">Solicitante...</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>{u.nickname || u.full_name}</option>
            ))}
          </select>

          <select 
            value={validatorFilter} 
            onChange={e => setValidatorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[150px]"
          >
            <option value="">Validador...</option>
            {[...new Set(users.map(u => u.email))].map(email => {
              const u = users.find(usr => usr.email === email);
              return <option key={email} value={email}>{u?.nickname || u?.full_name || email}</option>
            })}
          </select>

          <select 
            value={packageFilter} 
            onChange={e => setPackageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[150px]"
          >
            <option value="">Pacote...</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {(searchTerm || requesterFilter || validatorFilter || packageFilter) && (
            <button 
              onClick={() => {
                setSearchTerm(''); setRequesterFilter(''); setValidatorFilter(''); setPackageFilter('');
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap", activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100")}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : requests.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4">{requests.map(request => <RequestCard key={request.id} request={request} users={users} currentUser={user} isAdmin={isAdmin} can={can} onValidate={r => setValidationModal({ open: true, request: r, readOnly: false })} onViewDetails={r => setValidationModal({ open: true, request: r, readOnly: true })} onCorrect={r => setCorrectionModal({ open: true, request: r })} onRevert={r => setRevertModal({ open: true, request: r })} onEdit={r => setEditModal({ open: true, request: r })} onDelete={handleDelete} />)}</div>
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <button onClick={handleLoadMore} disabled={loadingMore} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:shadow-md transition-all font-medium">
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />} Carregar Mais
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200"><AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 font-medium">Nenhuma validação encontrada</p></div>
      )}

      {/* Modals */}
      <Modal open={validationModal.open} onClose={() => setValidationModal({ open: false, request: null })} title={validationModal.readOnly ? 'Detalhes' : 'Validar'} size="lg">
        {validationModal.request && <ValidationModalContent request={validationModal.request} readOnly={validationModal.readOnly} onClose={() => setValidationModal({ open: false, request: null })} onSuccess={() => { loadData(1, activeTab, true); setValidationModal({ open: false, request: null }); }} />}
      </Modal>
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, request: null })} title="Editar Solicitação">
        {editModal.request && <EditModalContent request={editModal.request} users={users} onClose={() => setEditModal({ open: false, request: null })} onSuccess={() => { loadData(1, activeTab, true); setEditModal({ open: false, request: null }); }} />}
      </Modal>
      <Modal open={correctionModal.open} onClose={() => setCorrectionModal({ open: false, request: null })} title="Corrigir">
        {correctionModal.request && <CorrectionModalContent request={correctionModal.request} onClose={() => setCorrectionModal({ open: false, request: null })} onSuccess={() => { loadData(1, activeTab, true); setCorrectionModal({ open: false, request: null }); }} />}
      </Modal>
      <Modal open={revertModal.open} onClose={() => setRevertModal({ open: false, request: null })} title="Reverter">
        {revertModal.request && <RevertModalContent request={revertModal.request} onClose={() => setRevertModal({ open: false, request: null })} onSuccess={() => { loadData(1, activeTab, true); setRevertModal({ open: false, request: null }); }} />}
      </Modal>
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, request: null })} title="Confirmar Exclusão">
        {deleteModal.request && (
          <DeleteModalContent 
            request={deleteModal.request} 
            onClose={() => setDeleteModal({ open: false, request: null })} 
            onSuccess={() => {
              setRequests(prev => prev.filter(r => r.id !== deleteModal.request.id));
              setDeleteModal({ open: false, request: null });
            }} 
          />
        )}
      </Modal>

      {/* Lightbox Rendering */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors" onClick={() => setPreviewImage(null)}><X className="w-8 h-8" /></button>
            <img src={previewImage} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  )
}

function ValidationModalContent({ request, readOnly, onClose, onSuccess }) {
  const contentUrls = Array.isArray(request.content_urls) ? request.content_urls : JSON.parse(request.content_urls || '[]')
  const [links, setLinks] = useState(() => {
    let initialLinks = request.validation_per_link;
    if (typeof initialLinks === 'string') {
      try { initialLinks = JSON.parse(initialLinks); } catch(e) { initialLinks = []; }
    }
    if (!initialLinks || (Array.isArray(initialLinks) && initialLinks.length === 0)) {
      initialLinks = contentUrls.map(url => ({ url, status: 'pendente', observations: '' }));
    }
    return Array.isArray(initialLinks) ? initialLinks : [];
  })
  const [activeLink, setActiveLink] = useState(0)
  const [observations, setObservations] = useState(request.final_observations || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.validateRequest(request.id, { validation_per_link: links, final_observations: observations })
      toast.success('Concluído')
      onSuccess()
    } catch (e) { toast.error('Erro ao salvar') } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{request.title}</h3>
        {request.description && <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">{request.description}</p>}
        {request.description_images && JSON.parse(request.description_images || '[]').length > 0 && (
          <div className="flex gap-3 flex-wrap mt-3">
            {JSON.parse(request.description_images || '[]').map((img, idx) => (
              <img 
                key={idx} src={img} alt="" 
                className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-sm cursor-pointer hover:border-emerald-500 transition-all" 
                onClick={() => window.dispatchEvent(new CustomEvent('preview-image', { detail: img }))}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-6">
        {links.length > 0 ? (
          <>
            {/* Sidebar de Links */}
            <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Links ({links.length})</label>
              {links.map((l, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveLink(idx)}
                  className={cn(
                    "p-3 rounded-xl text-left text-xs font-bold border transition-all relative overflow-hidden",
                    activeLink === idx ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-200 bg-white hover:border-slate-300",
                    l.status === 'aprovado' && "bg-emerald-50/50",
                    l.status === 'reprovado' && "bg-red-50/50"
                  )}
                >
                  <div className="truncate pr-4">Link {idx + 1}</div>
                  <div className={cn("text-[9px] uppercase mt-1", l.status === 'aprovado' ? "text-emerald-500" : l.status === 'reprovado' ? "text-red-500" : "text-slate-400")}>
                    {l.status === 'pendente' ? 'Pendente' : l.status}
                  </div>
                  {l.status !== 'pendente' && (
                    <div className={cn("absolute top-2 right-2 w-1.5 h-1.5 rounded-full", l.status === 'aprovado' ? "bg-emerald-500" : "bg-red-500")} />
                  )}
                </button>
              ))}
            </div>

            {/* Painel de Validação */}
            <div className="grow">
              <div className="flex items-start gap-2 mb-4">
                <ExternalLink className="w-4 h-4 shrink-0 mt-1 text-slate-400" />
                <a href={links[activeLink]?.url || '#'} target="_blank" className="text-blue-600 break-all text-sm font-bold leading-relaxed hover:underline">{links[activeLink]?.url}</a>
              </div>
              {!readOnly && (
                <div className="flex gap-3">
                  <button onClick={() => setLinks(links.map((l, i) => i === activeLink ? { ...l, status: 'aprovado' } : l))} className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", links[activeLink]?.status === 'aprovado' ? "bg-emerald-500 text-white shadow-lg" : "bg-white border text-slate-600 hover:border-emerald-200")}>
                     {links[activeLink]?.status === 'aprovado' && <Check className="w-4 h-4" />} APROVAR
                  </button>
                  <button onClick={() => setLinks(links.map((l, i) => i === activeLink ? { ...l, status: 'reprovado' } : l))} className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", links[activeLink]?.status === 'reprovado' ? "bg-red-500 text-white shadow-lg" : "bg-white border text-slate-600 hover:border-red-200")}>
                     {links[activeLink]?.status === 'reprovado' && <X className="w-4 h-4" />} REPROVAR
                  </button>
                </div>
              )}
              {readOnly && (
                <div className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2", statusColors[links[activeLink]?.status || 'pendente'])}>
                  {statusLabels[links[activeLink]?.status || 'pendente']}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-700 text-sm font-bold">Nenhum link encontrado para esta solicitação.</p>
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Observações Finais</label>
        <textarea value={observations} onChange={e => setObservations(e.target.value)} readOnly={readOnly} placeholder="Descreva observações gerais..." className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 h-24 resize-none text-sm font-medium mt-1" />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-widest"><Clock className="w-3 h-3" /> Histórico de Transições</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {(Array.isArray(request.history) ? request.history : JSON.parse(request.history || '[]')).length > 0 ? (Array.isArray(request.history) ? request.history : JSON.parse(request.history || '[]')).map((h, i) => (
            <div key={i} className="text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between font-bold text-slate-400 mb-1"><span className="text-slate-600">{(h.action || "AÇÃO").toUpperCase()}</span><span>{formatDate(h.timestamp, 'datetime')}</span></div>
              <p className="text-slate-600 font-bold text-xs">{h.details}</p>
              <p className="text-[10px] text-slate-400 mt-1">Realizado por: <span className="text-slate-500 font-bold">{h.user}</span></p>
            </div>
          )) : <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">Nenhuma transição registrada no histórico ainda.</p>}
        </div>
      </div>

      {!readOnly && (
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-3.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all uppercase tracking-wider">CANCELAR</button>
          <button onClick={handleSubmit} disabled={submitting || links.some(l => l.status === 'pendente')} className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all uppercase tracking-wider">FINALIZAR VALIDAÇÃO</button>
        </div>
      )}
    </div>
  )
}

function EditModalContent({ request, users, onClose, onSuccess }) {
  const [form, setForm] = useState({ title: request.title, description: request.description || '', priority: request.priority, assigned_to: request.assigned_to })
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.updateRequest(request.id, form)
      toast.success('Atualizado')
      onSuccess()
    } catch (e) { toast.error('Erro ao salvar') } finally { setSubmitting(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Título</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium text-sm mt-1" required /></div>
      <div><label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Descrição</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-3.5 border border-slate-200 rounded-xl h-24 resize-none outline-none focus:border-emerald-500 font-medium text-sm mt-1" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Prioridade</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-3.5 border border-slate-200 rounded-xl bg-white font-medium text-sm mt-1"><option value="baixa text-slate-900 font-medium">Baixa</option><option value="normal text-slate-900 font-medium">Normal</option><option value="alta text-slate-900 font-medium">Alta</option><option value="urgente text-slate-900 font-medium">Urgente</option></select></div>
        <div><label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Validador Substituto</label><select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full p-3.5 border border-slate-200 rounded-xl bg-white font-medium text-sm mt-1">{users.map(u => <option key={u.id} value={u.email} className="text-slate-900 font-medium">{u.nickname || u.full_name}</option>)}</select></div>
      </div>
      <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/20 mt-4 uppercase tracking-widest text-xs transition-all hover:scale-[1.01]">SALVAR ALTERAÇÕES</button>
    </form>
  )
}

function CorrectionModalContent({ request, onClose, onSuccess }) {
  const contentUrls = Array.isArray(request.content_urls) ? request.content_urls : JSON.parse(request.content_urls || '[]')
  const [links, setLinks] = useState(request.validation_per_link?.filter(l => l.status === 'reprovado').map(l => ({ original: l.url, new_url: '' })) || [])
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const finalUrls = contentUrls.map(url => {
        const corr = links.find(c => c.original === url)
        return corr?.new_url || url
      })
      await api.correctRequest(request.id, { content_urls: finalUrls })
      toast.success('Reenviado')
      onSuccess()
    } catch (e) { toast.error('Erro ao reenviar') } finally { setSubmitting(false) }
  }
  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-blue-500 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 leading-relaxed uppercase tracking-wider">Atenção: Apenas os links reprovados abaixo precisam ser corrigidos.</div>
      <div className="max-h-72 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {links.map((c, i) => (
          <div key={i} className="space-y-2 p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mb-2">Link Reprovado {i+1}</p>
            <p className="text-xs break-all text-slate-400 font-medium mb-3 italic">{c.original}</p>
            <input value={c.new_url} onChange={e => setLinks(links.map((x, idx) => idx === i ? { ...x, new_url: e.target.value } : x))} placeholder="Cole aqui o novo link corrigido..." className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium shadow-inner bg-slate-50 focus:bg-white transition-all" />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={submitting || links.some(l => !l.new_url)} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs transition-all hover:scale-[1.01] mt-2">REENVIAR PARA VALIDAÇÃO</button>
    </div>
  )
}

function RevertModalContent({ request, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.revertRequest(request.id, reason)
      toast.success('Revertido')
      onSuccess()
    } catch (e) { toast.error('Erro ao reverter') } finally { setSubmitting(false) }
  }
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 leading-relaxed">Confirma a reversão de status para "<span className="text-slate-900">{request.title}</span>"? Esta ação é irreversível e exige um motivo:</p>
      <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full p-4 border border-slate-200 rounded-xl h-24 resize-none text-sm outline-none focus:border-amber-500 font-medium bg-slate-50 focus:bg-white transition-all mt-1" placeholder="Explique por que esta validação precisa ser refeita..." />
      <button onClick={handleSubmit} disabled={submitting || !reason} className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold shadow-xl shadow-amber-500/20 uppercase tracking-widest text-xs transition-all hover:scale-[1.01] mt-2">CONFIRMAR REVERSÃO</button>
    </div>
  )
}

function DeleteModalContent({ request, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.deleteRequest(request.id)
      toast.success('Excluído com sucesso')
      onSuccess()
    } catch (e) {
      toast.error('Erro ao excluir')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <div>
          <p className="text-sm font-bold text-red-900">Esta ação não pode ser desfeita</p>
          <p className="text-xs text-red-700">O registro da validação será removido permanentemente.</p>
        </div>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Solicitação</p>
        <p className="text-sm font-semibold text-slate-900">{request.title}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all">CANCELAR</button>
        <button onClick={handleDelete} disabled={submitting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} EXCLUIR AGORA
        </button>
      </div>
    </div>
  )
}
