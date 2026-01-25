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
  ChevronDown,
  UserCog,
  UsersRound,
} from 'lucide-react'

// Perfis de permissão
const PROFILES = {
  validador: {
    label: 'Validador',
    description: 'Vê validações atribuídas, valida, vê ranking',
    color: 'bg-blue-500',
    permissions: {
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
  },
  solicitante: {
    label: 'Solicitante',
    description: 'Cria validações, vê todas validações, vê ranking',
    color: 'bg-purple-500',
    permissions: {
      view_dashboard: true,
      create_validation: true,
      view_assigned: false,
      view_all_validations: true,
      validate: false,
      view_ranking: true,
      view_reports: false,
      manage_packages: false,
      manage_users: false,
      view_wiki: true,
    }
  },
  gerente: {
    label: 'Gerente',
    description: 'Faz quase tudo, menos gerenciar usuários',
    color: 'bg-amber-500',
    permissions: {
      view_dashboard: true,
      create_validation: true,
      view_assigned: true,
      view_all_validations: true,
      validate: true,
      view_ranking: true,
      view_reports: true,
      manage_packages: true,
      manage_users: false,
      view_wiki: true,
    }
  },
  admin: {
    label: 'Admin',
    description: 'Acesso total ao sistema',
    color: 'bg-emerald-500',
    permissions: {
      view_dashboard: true,
      create_validation: true,
      view_assigned: true,
      view_all_validations: true,
      validate: true,
      view_ranking: true,
      view_reports: true,
      manage_packages: true,
      manage_users: true,
      view_wiki: true,
    }
  },
  personalizado: {
    label: 'Personalizado',
    description: 'Permissões customizadas',
    color: 'bg-slate-500',
    permissions: null // Será definido pelo admin
  }
}

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

function ProfileSelector({ value, onChange }) {
  const profiles = Object.entries(PROFILES).filter(([key]) => key !== 'personalizado')
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {profiles.map(([key, profile]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "p-4 rounded-xl border-2 text-left transition",
            value === key
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("w-3 h-3 rounded-full", profile.color)} />
            <span className="font-medium text-slate-900">{profile.label}</span>
          </div>
          <p className="text-xs text-slate-500">{profile.description}</p>
        </button>
      ))}
    </div>
  )
}

function PermissionCheckbox({ permission, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition">
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
        className="sr-only"
      />
      <span className="text-slate-700 text-sm">{permission.label}</span>
    </label>
  )
}

function PermissionsEditor({ permissions, onChange }) {
  const groups = ['Visualização', 'Validações', 'Administração']
  
  return (
    <div className="space-y-3">
      {groups.map(group => (
        <div key={group}>
          <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">{group}</h4>
          <div className="bg-slate-50 rounded-lg p-1">
            {PERMISSIONS_LIST.filter(p => p.group === group).map(permission => (
              <PermissionCheckbox
                key={permission.key}
                permission={permission}
                checked={permissions[permission.key] || false}
                onChange={onChange}
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
  const [teamModal, setTeamModal] = useState({ open: false, user: null })
  const [selectedManager, setSelectedManager] = useState('')
  const [newUserModal, setNewUserModal] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editProfile, setEditProfile] = useState('validador')
  const [editPermissions, setEditPermissions] = useState({})
  const [showCustom, setShowCustom] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', full_name: '', profile: 'validador' })
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

  const handleSaveManager = async () => {
    setSaving(true)
    try {
      await api.updateUser(teamModal.user.id, { 
        manager_id: selectedManager || null 
      })
      toast.success('Gerente atualizado!')
      setTeamModal({ open: false, user: null })
      loadData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const openTeamModal = (usr) => {
    setSelectedManager(usr.manager_id || '')
    setTeamModal({ open: true, user: usr })
  }

  const getManagersAndGerentes = () => {
    return users.filter(u => 
      u.profile === 'gerente' || 
      u.admin_level === 'admin_principal' || 
      u.admin_level === 'admin_secundario'
    )
  }

  const getManagerName = (managerId) => {
    if (!managerId) return null
    const manager = users.find(u => u.id == managerId)
    return manager ? (manager.nickname || manager.full_name || manager.email) : null
  }

  const handleProfileChange = (profile) => {
    setEditProfile(profile)
    setEditPermissions({...PROFILES[profile].permissions})
    setShowCustom(false)
  }

  const handlePermissionChange = (key, value) => {
    setEditPermissions(prev => ({ ...prev, [key]: value }))
    setEditProfile('personalizado')
    setShowCustom(true)
  }

  const handleSavePermissions = async () => {
    setSaving(true)
    try {
      await api.updateUser(permModal.user.id, { 
        profile: editProfile,
        permissions: editPermissions 
      })
      toast.success('Permissões atualizadas')
      setPermModal({ open: false, user: null })
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
      const profilePerms = PROFILES[newUser.profile].permissions
      await api.fetch('/users.php', {
        method: 'POST',
        body: JSON.stringify({
          ...newUser,
          permissions: profilePerms
        })
      })
      toast.success('Usuário cadastrado!')
      setNewUserModal(false)
      setNewUser({ email: '', full_name: '', profile: 'validador' })
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
    const profile = usr.profile || 'validador'
    setEditProfile(profile)
    setEditPermissions(usr.permissions || PROFILES.validador.permissions)
    setShowCustom(profile === 'personalizado')
    setPermModal({ open: true, user: usr })
  }

  const getUserProfile = (usr) => {
    if (usr.admin_level === 'admin_principal') return PROFILES.admin
    return PROFILES[usr.profile] || PROFILES.validador
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map(usr => {
            const isSelf = usr.id === currentUser?.id
            const isUserAdmin = usr.admin_level === 'admin_principal'
            const profile = getUserProfile(usr)

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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500">{usr.email}</p>
                    {usr.manager_id && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        �� {getManagerName(usr.manager_id)}
                      </span>
                    )}
                  </div>
                </div>

                <span className={cn(
                  "px-3 py-1 text-xs font-medium text-white rounded-full",
                  profile.color
                )}>
                  {profile.label}
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

                  {!isSelf && !isUserAdmin && (
                    <button
                      onClick={() => openTeamModal(usr)}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                      title="Definir gerente/equipe"
                    >
                      <UsersRound className="w-4 h-4" />
                    </button>
                  )}

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
              <input type="email" value={editModal.user.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
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
              <button onClick={() => setEditModal({ open: false, user: null })} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
              <button onClick={handleEditNickname} disabled={saving} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Escolha um perfil</label>
              <ProfileSelector value={editProfile} onChange={handleProfileChange} />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <ChevronDown className={cn("w-4 h-4 transition", showCustom && "rotate-180")} />
                {showCustom ? 'Ocultar' : 'Mostrar'} permissões detalhadas
                {editProfile === 'personalizado' && <span className="text-xs text-purple-500">(personalizado)</span>}
              </button>
            </div>

            {showCustom && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-3">
                  ⚠️ Ao marcar/desmarcar, o perfil será alterado para "Personalizado"
                </p>
                <PermissionsEditor
                  permissions={editPermissions}
                  onChange={handlePermissionChange}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => setPermModal({ open: false, user: null })} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSavePermissions} disabled={saving} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Permissões'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Definir Gerente */}
      <Modal
        open={teamModal.open}
        onClose={() => setTeamModal({ open: false, user: null })}
        title={`Definir Gerente: ${teamModal.user?.nickname || teamModal.user?.email || ''}`}
      >
        {teamModal.user && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Selecione o gerente deste usuário. O gerente terá suas metas calculadas com base na equipe.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gerente</label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="">Sem gerente (independente)</option>
                {getManagersAndGerentes().filter(m => m.id !== teamModal.user?.id).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nickname || m.full_name || m.email}
                    {m.profile === 'gerente' && ' (Gerente)'}
                    {m.admin_level === 'admin_principal' && ' (Admin)'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Como funciona:</strong> Ao vincular este usuário a um gerente, 
                as metas do gerente serão calculadas como a soma das metas de toda a equipe.
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button onClick={() => setTeamModal({ open: false, user: null })} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSaveManager} disabled={saving} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">
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
            <label className="block text-sm font-medium text-slate-700 mb-3">Perfil de Acesso</label>
            <ProfileSelector 
              value={newUser.profile} 
              onChange={(profile) => setNewUser({...newUser, profile})} 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setNewUserModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
            <button onClick={handleCreateUser} disabled={saving || !newUser.email} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
