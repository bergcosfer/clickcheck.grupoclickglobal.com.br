import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  User,
  Camera,
  Trash2,
  Save,
  Loader2,
  Mail,
  Phone,
  Building,
} from 'lucide-react'

export default function MeuPerfil() {
  const { user, updateUserData } = useAuth()
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
    department: user?.department || '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.updateUser(user.id, formData)
      updateUserData(updated)
      toast.success('Perfil atualizado!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await api.uploadFile(file)
      const updated = await api.updateUser(user.id, { profile_picture: result.url })
      updateUserData(updated)
      toast.success('Foto atualizada!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Remover foto de perfil?')) return

    try {
      const updated = await api.updateUser(user.id, { profile_picture: '' })
      updateUserData(updated)
      toast.success('Foto removida')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const adminLevelLabels = {
    convidado: 'Convidado',
    user: 'Usuário',
    admin_principal: 'Administrador Principal',
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          Meu Perfil
        </h1>
        <p className="text-slate-500 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                {user?.full_name?.charAt(0) || '?'}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Alterar Foto
            </button>
            {user?.profile_picture && (
              <button
                onClick={handleRemovePhoto}
                className="flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Remover
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Apelido
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={e => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              placeholder="Como você quer ser chamado?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={user?.full_name || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Departamento
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ex: Marketing"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nível de Acesso
            </label>
            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                user?.admin_level === 'admin_principal' ? "bg-emerald-100 text-emerald-700" :
                user?.admin_level === 'user' ? "bg-blue-100 text-blue-700" :
                "bg-slate-200 text-slate-700"
              )}>
                {adminLevelLabels[user?.admin_level] || 'Convidado'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
