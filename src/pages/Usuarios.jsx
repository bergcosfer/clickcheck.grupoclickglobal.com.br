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
  Settings,
  Check,
} from 'lucide-react'

const PERMISSIONS_LIST = [
  { key: 'view_dashboard', label: 'Ver Dashboard', group: 'Visualização' },
  { key: 'create_validation', label: 'Criar Validações', group: 'Validações' },
  { key: 'view_assigned', label: 'Ver Validações Atribuídas', group: 'Validações' },
  { key: 'view_all_validations', label: 'Ver Todas Validações', group: 'Validações' },
  { key: 'validate', label: 'Validar Conteúdos', group: 'Validações' },
  { key: 'view_ranking', label: 'Ver Ranking', group: 'Visualização' },
  { key: 'view_reports', label: 'Ver Relatórios', group: 'Administração' },
  { key: 'manage_packages', label: 'Gerenciar Pacotes', group: 'Administração' },
  { key: 'manage_users', label: 'Gerenciar Usuários', group: 'Administração' },
  { key: 'view_wiki', label: 'Ver Wiki', group: 'Visualização' },
]

const DEFAULT_PERMISSIONS = {
  view_dashboard: true,
  create_validation: false,
  view_assigned: true,
  view_all_validations: false,
  validate: true,
  view_ranking: true,
  view_reports: false,
  manage_packages: false,
  manage_users: false,
  view_wiki: true,
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn(
        "relative bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col",
        wide ? "w-full max-w-2xl" : "w-full max-w-md"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function PermissionCheckbox({ permission, checked, onChange, disabled }) {
  return (
    <label className={cn(
      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
    )}>
      <div className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition",
        checked 
          ? "bg-emerald-500 border-emerald-500 text-white" 
          : "border-slate-300 bg-white"
      )}>
        {checked && <Check className="w-3 h-3" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(permission.key, e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span className="text-slate-700">{permission.label}</span>
    </label>
  )
}

function PermissionsEditor({ permissions, onChange, disabled }) {
  const groups = ['Visualização', 'Validações', 'Administração']
  
  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group}>
          <h4 className="text-sm font-medium text-slate-500 mb-2">{group}</h4>
          <div className="bg-slate-50 rounded-xl p-2 space-y-1">
            {PERMISSIONS_LIST.filter(p => p.group === group).map(permission => (
              <PermissionCheckbox
                key={permission.key}
                permission={permission}
                checked={permissions[permission.key] || false}
                onChange={onChange}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Usuarios() {
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState({ open: false, user: null })
  const [permModal, setPermModal] = useState({ open: false, user: null })
  const [newUserModal, setNewUserModal] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editPermissions, setEditPermissions] = useState({})
  const [newUser, setNewUser] = useState({ email: '', full_name: '', permissions: {...DEFAULT_PERMISSIONS} })
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

  const handleSavePermissions = async () => {
    setSaving(true)
    try {
      await api.updateUser(permModal.user.id, { permissions: editPermissions })
      toast.success('Permissões atualizadas')
      setPermModal({ open: false, user: null })
      loadData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePermissionChange = (key, value) => {
    setEditPermissions(prev => ({ ...prev, [key]: value }))
  }

  const handleNewUserPermissionChange = (key, value) => {
    setNewUser(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value }
    }))
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
      toast.success('Usuário cadastrado!')
      setNewUserModal(false)
      setNewUser({ email: '', full_name: '', permissions: {...DEFAULT_PERMISSIONS} })
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

  const openPermModal = (usr) => {
    setEditPermissions(usr.permissions || {...DEFAULT_PERMISSIONS})
    setPermModal({ open: true, user: usr })
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
          ⚠️ <strong>Importante:</strong> Apenas usuários cadastrados aqui podem fazer login. 
          Clique em <Settings className="w-4 h-4 inline" /> para definir as permissões de cada usuário.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map(usr => {
            const isSelf = usr.id === currentUser?.id
            const isUserAdmin = usr.admin_level === 'admin_principal'

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

                {isUserAdmin ? (
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-emerald-500">
                    Admin
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full">
                    {Object.values(usr.permissions || {}).filter(v => v).length} permissões
                  </span>
                )}

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

                  {!isSelf && !isUserAdmin && (
                    <button
                      onClick={() => openPermModal(usr)}
                      className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"
                      title="Gerenciar permissões"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}

                  {!isSelf && !isUserAdmin && (
                    <button
                      onClick={() => handleDeleteUser(usr.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Editar Apelido */}
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

      {/* Modal Permissões */}
      <Modal
        open={permModal.open}
        onClose={() => setPermModal({ open: false, user: null })}
        title={`Permissões: ${permModal.user?.nickname || permModal.user?.email || ''}`}
        wide
      >
        {permModal.user && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Marque as permissões que este usuário deve ter no sistema.
            </p>
            <PermissionsEditor
              permissions={editPermissions}
              onChange={handlePermissionChange}
              disabled={saving}
            />
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPermModal({ open: false, user: null })}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Permissões'}
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
        wide
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Permissões</label>
            <PermissionsEditor
              permissions={newUser.permissions}
              onChange={handleNewUserPermissionChange}
              disabled={saving}
            />
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
