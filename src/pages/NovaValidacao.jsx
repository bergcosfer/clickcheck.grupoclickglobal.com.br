import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  PlusCircle,
  X,
  Link as LinkIcon,
  Package,
  User,
  Flag,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import ImageTextArea from '@/components/ImageTextArea'

export default function NovaValidacao() {
  const navigate = useNavigate()
  const { user, can } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [packages, setPackages] = useState([])
  const [users, setUsers] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    description_images: [],
    package_id: '',
    priority: 'normal',
    assigned_to: '',
    content_urls: [''],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pkgData, validatorsData] = await Promise.all([
        api.listPackages(true),
        api.listValidators(), // Usa endpoint que não requer admin
      ])
      setPackages(pkgData)
      // Filter out current user from assignables
      setUsers(validatorsData.filter(u => u.email !== user?.email))
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const addUrl = () => {
    setFormData(prev => ({
      ...prev,
      content_urls: [...prev.content_urls, ''],
    }))
  }

  const removeUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      content_urls: prev.content_urls.filter((_, i) => i !== index),
    }))
  }

  const updateUrl = (index, value) => {
    setFormData(prev => ({
      ...prev,
      content_urls: prev.content_urls.map((url, i) => i === index ? value : url),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (!formData.title.trim()) {
      toast.error('Informe um título')
      return
    }
    if (!formData.package_id) {
      toast.error('Selecione um pacote de validação')
      return
    }
    if (!formData.assigned_to) {
      toast.error('Selecione um validador')
      return
    }
    
    const validUrls = formData.content_urls.filter(url => url.trim())
    if (validUrls.length === 0) {
      toast.error('Adicione pelo menos um link de conteúdo')
      return
    }

    setSubmitting(true)
    try {
      await api.createRequest({
        ...formData,
        content_urls: validUrls,
        description_images: formData.description_images.map(img => img.data),
      })
      toast.success('Validação criada com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Erro ao criar validação')
    } finally {
      setSubmitting(false)
    }
  }

  // Access check
  if (!can('create_validation')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Não Autorizado</h2>
        <p className="text-slate-500">
          Você não tem permissão para criar validações.
        </p>
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

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa (24h)', color: 'text-slate-600' },
    { value: 'normal', label: 'Normal (12h)', color: 'text-blue-600' },
    { value: 'alta', label: 'Alta (6h)', color: 'text-amber-600' },
    { value: 'urgente', label: 'Urgente (2h)', color: 'text-red-600' },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-slide-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          Nova Validação
        </h1>
        <p className="text-slate-500 mt-2">
          Preencha os detalhes para solicitar uma nova validação de conteúdo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            placeholder="Ex: Banner Campanha de Verão"
          />
        </div>

        {/* Description com suporte a imagens */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descrição (pode colar imagens com Ctrl+V)
          </label>
          <ImageTextArea
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            images={formData.description_images}
            onImagesChange={(images) => setFormData(prev => ({ ...prev, description_images: images }))}
            placeholder="Detalhes adicionais sobre a validação..."
            rows={3}
          />
        </div>

        {/* Package */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Pacote de Validação *
          </label>
          <select
            value={formData.package_id}
            onChange={e => setFormData(prev => ({ ...prev, package_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white"
          >
            <option value="">Selecione um pacote...</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} ({pkg.type})
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Flag className="w-4 h-4 inline mr-2" />
            Prioridade
          </label>
          <select
            value={formData.priority}
            onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white"
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Validador *
          </label>
          <select
            value={formData.assigned_to}
            onChange={e => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white"
          >
            <option value="">Selecione um validador...</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>
                {u.nickname || u.full_name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Content URLs */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Links de Conteúdo *
          </label>
          <div className="space-y-3">
            {formData.content_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => updateUrl(index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="https://..."
                />
                {formData.content_urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrl(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addUrl}
            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar mais um link
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Criar Validação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
