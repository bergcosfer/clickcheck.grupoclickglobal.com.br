import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react'

// Package Types
const packageTypes = [
  { value: 'artwork', label: 'Artwork' },
  { value: 'texto_copy', label: 'Texto/Copy' },
  { value: 'video', label: 'Vídeo' },
  { value: 'documento', label: 'Documento' },
  { value: 'outro', label: 'Outro' },
]

// Modal Component
function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// Package Card
function PackageCard({ pkg, onEdit, onDelete, onToggleActive }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-sm border p-6 transition-all",
      pkg.active ? "border-slate-200" : "border-slate-200 opacity-60"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">{pkg.name}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            {packageTypes.find(t => t.value === pkg.type)?.label || pkg.type}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={pkg.active}
            onChange={() => onToggleActive(pkg)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
      </div>

      {pkg.description && (
        <p className="text-sm text-slate-500 mb-4">{pkg.description}</p>
      )}

      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Critérios ({pkg.criteria?.length || 0}):</p>
        <div className="flex flex-wrap gap-1">
          {pkg.criteria?.slice(0, 5).map((c, i) => (
            <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
              {c.name}
            </span>
          ))}
          {pkg.criteria?.length > 5 && (
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
              +{pkg.criteria.length - 5}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(pkg)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  )
}

// Package Form
function PackageForm({ pkg, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    type: pkg?.type || 'artwork',
    active: pkg?.active ?? true,
    criteria: pkg?.criteria || [{ name: '', description: '', required: true, weight: 1 }],
  })
  const [submitting, setSubmitting] = useState(false)

  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { name: '', description: '', required: true, weight: 1 }],
    }))
  }

  const removeCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }))
  }

  const updateCriterion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((c, i) => i === index ? { ...c, [field]: value } : c),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Informe o nome do pacote')
      return
    }
    
    const validCriteria = formData.criteria.filter(c => c.name.trim())
    if (validCriteria.length === 0) {
      toast.error('Adicione pelo menos um critério')
      return
    }

    setSubmitting(true)
    try {
      if (pkg?.id) {
        await api.updatePackage(pkg.id, { ...formData, criteria: validCriteria })
      } else {
        await api.createPackage({ ...formData, criteria: validCriteria })
      }
      toast.success(pkg?.id ? 'Pacote atualizado!' : 'Pacote criado!')
      onSave()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="Nome do pacote..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo *</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white"
          >
            {packageTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">Ativo</span>
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
          />
        </div>
      </div>

      {/* Criteria */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-700">Critérios de Validação</label>
          <button
            type="button"
            onClick={addCriterion}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {formData.criteria.map((criterion, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={e => updateCriterion(index, 'name', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Nome do critério"
                  />
                  <input
                    type="text"
                    value={criterion.description}
                    onChange={e => updateCriterion(index, 'description', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Descrição"
                  />
                  <select
                    value={criterion.weight}
                    onChange={e => updateCriterion(index, 'weight', parseInt(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    {[1,2,3,4,5].map(w => (
                      <option key={w} value={w}>Peso {w}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={criterion.required}
                      onChange={e => updateCriterion(index, 'required', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-500"
                    />
                    <span className="text-sm text-slate-600">Obrigatório</span>
                  </label>
                </div>
                {formData.criteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriterion(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (pkg?.id ? 'Atualizar' : 'Criar Pacote')}
        </button>
      </div>
    </form>
  )
}

export default function Pacotes() {
  const { isAdmin, can } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, pkg: null })

  const loadData = async () => {
    try {
      const data = await api.listPackages()
      setPackages(data)
    } catch (error) {
      toast.error('Erro ao carregar pacotes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (pkg) => {
    if (!confirm(`Excluir o pacote "${pkg.name}"?`)) return
    
    try {
      await api.deletePackage(pkg.id)
      toast.success('Pacote excluído')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (pkg) => {
    try {
      await api.updatePackage(pkg.id, { active: !pkg.active })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!isAdmin && !can("manage_packages")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500">Apenas administradores podem gerenciar pacotes.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Pacotes de Validação
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os modelos de validação</p>
        </div>
        <button
          onClick={() => setModal({ open: true, pkg: null })}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium py-2.5 px-5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          Novo Pacote
        </button>
      </div>

      {packages.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={p => setModal({ open: true, pkg: p })}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum pacote criado ainda</p>
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, pkg: null })}
        title={modal.pkg ? 'Editar Pacote' : 'Novo Pacote'}
      >
        <PackageForm
          pkg={modal.pkg}
          onSave={() => { setModal({ open: false, pkg: null }); loadData() }}
          onCancel={() => setModal({ open: false, pkg: null })}
        />
      </Modal>
    </div>
  )
}
