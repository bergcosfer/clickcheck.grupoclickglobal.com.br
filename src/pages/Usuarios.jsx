import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Users,
  Edit3,
  Loader2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
} from 'lucide-react'

const adminLevels = [
  { value: 'convidado', label: 'Convidado', color: 'bg-slate-500' },
  { value: 'user', label: 'Usuário', color: 'bg-blue-500' },
  { value: 'admin_principal', label: 'Admin', color: 'bg-emerald-500' },
]

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState({ open: false, user: null })
  const [newUserModal, setNewUserModal] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [newUser, setNewUser] = useState({ email: '', full_name: '', admin_level: 'user' })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const data = await api.listUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLevelChange = async (userId, newLevel) => {
    try {
      await api.updateUser(userId, { admin_level: newLevel })
      toast.success('Nível atualizado')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEditNickname = async () => {
    setSaving(true)
    try {
      await api.updateUser(editModal.user.id, { nickname: editNickname })
      toast.success('Apelido atualizado')
      setEditModal({ open: false, user: null })
      loadData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email) {
      toast.error('Email é obrigatório')
      return
    }
    setSaving(true)
    try {
      await api.fetch('/users.php', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      toast.success('Usuário cadastrado! Agora ele pode fazer login.')
      setNewUserModal(false)
      setNewUser({ email: '', full_name: '', admin_level: 'user' })
      loadData()
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      await api.fetch(`/users.php?id=${userId}`, { method: 'DELETE' })
      toast.success('Usuário excluído')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500">Apenas administradores podem gerenciar usuários.</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Gerenciar Usuários
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os usuários e suas permissões</p>
        </div>
        <button
          onClick={() => setNewUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
        <p className="text-sm">
          ⚠️ <strong>Importante:</strong> Apenas usuários cadastrados aqui podem fazer login no sistema. 
          Adicione o email da pessoa antes que ela tente acessar.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map(usr => {
            const levelData = adminLevels.find(l => l.value === usr.admin_level)
            const isSelf = usr.id === currentUser?.id

            return (
              <div key={usr.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                {usr.profile_picture ? (
                  <img
                    src={usr.profile_picture}
                    alt={usr.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {usr.full_name?.charAt(0) || usr.email?.charAt(0) || '?'}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {usr.nickname || usr.full_name || 'Sem nome'}
                    {isSelf && <span className="ml-2 text-xs text-slate-400">(você)</span>}
                    {!usr.google_id && <span className="ml-2 text-xs text-amber-500">(nunca logou)</span>}
                  </p>
                  <p className="text-sm text-slate-500">{usr.email}</p>
                </div>

                <span className={cn(
                  "px-3 py-1 text-xs font-medium text-white rounded-full",
                  levelData?.color || 'bg-slate-500'
                )}>
                  {levelData?.label || 'Convidado'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditNickname(usr.nickname || '')
                      setEditModal({ open: true, user: usr })
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    title="Editar apelido"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {!isSelf && (
                    <>
                      <select
                        value={usr.admin_level}
                        onChange={e => handleLevelChange(usr.id, e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                      >
                        {adminLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Editar */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, user: null })}
        title="Editar Usuário"
      >
        {editModal.user && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={editModal.user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apelido</label>
              <input
                type="text"
                value={editNickname}
                onChange={e => setEditNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Apelido do usuário"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditNickname}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Novo Usuário */}
      <Modal
        open={newUserModal}
        onClose={() => setNewUserModal(false)}
        title="Cadastrar Novo Usuário"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            Cadastre o email do novo usuário. Ele poderá fazer login assim que for adicionado.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nome (opcional)</label>
            <input
              type="text"
              value={newUser.full_name}
              onChange={e => setNewUser({...newUser, full_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nível de Acesso</label>
            <select
              value={newUser.admin_level}
              onChange={e => setNewUser({...newUser, admin_level: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              {adminLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setNewUserModal(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateUser}
              disabled={saving || !newUser.email}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
