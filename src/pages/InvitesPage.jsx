import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, Check, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function InvitesPage() {
  const { isAdmin } = useAuth()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newInvite, setNewInvite] = useState({ email: '', admin_level: 'user', expires_in: 7 })
  const [createdInvite, setCreatedInvite] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (isAdmin) {
      loadInvites()
    } else {
      setLoading(false)
    }
  }, [isAdmin])
  
  const loadInvites = async () => {
    try {
      const data = await api.fetch('/invites.php')
      setInvites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar convites:', err)
      setError('Erro ao carregar convites')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreate = async () => {
    try {
      const data = await api.fetch('/invites.php', {
        method: 'POST',
        body: JSON.stringify(newInvite)
      })
      setCreatedInvite(data)
      setNewInvite({ email: '', admin_level: 'user', expires_in: 7 })
      loadInvites()
    } catch (err) {
      setError(err.message)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Excluir este convite?')) return
    try {
      await api.fetch(`/invites.php?id=${id}`, { method: 'DELETE' })
      loadInvites()
    } catch (err) {
      setError(err.message)
    }
  }
  
  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'bg-yellow-500/20 text-yellow-400',
      usado: 'bg-green-500/20 text-green-400',
      expirado: 'bg-red-500/20 text-red-400'
    }
    return <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || ''}`}>{status}</span>
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Carregando...</p>
      </div>
    )
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Apenas administradores podem gerenciar convites.</p>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Convites</h1>
        <button
          onClick={() => { setShowModal(true); setCreatedInvite(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
        >
          <Plus className="w-4 h-4" />
          Novo Convite
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 text-slate-600 font-medium">Email</th>
              <th className="text-left p-4 text-slate-600 font-medium">Nível</th>
              <th className="text-left p-4 text-slate-600 font-medium">Status</th>
              <th className="text-left p-4 text-slate-600 font-medium">Expira em</th>
              <th className="text-left p-4 text-slate-600 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {invites.map(invite => (
              <tr key={invite.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-slate-900">{invite.email}</td>
                <td className="p-4 text-slate-600 capitalize">{invite.admin_level}</td>
                <td className="p-4">{getStatusBadge(invite.status)}</td>
                <td className="p-4 text-slate-500">
                  {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {invite.status === 'pendente' && (
                      <button
                        onClick={() => copyLink(`https://clickcheck-grupoclickglobal-com-facmok9as.vercel.app/invite?token=${invite.token || ''}`)}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition"
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invite.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  Nenhum convite encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {createdInvite ? 'Convite Criado!' : 'Novo Convite'}
            </h2>
            
            {createdInvite ? (
              <div>
                <p className="text-slate-600 mb-4">
                  Convite criado para <strong className="text-emerald-600">{createdInvite.email}</strong>
                </p>
                <div className="bg-slate-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Link do convite:</p>
                  <p className="text-sm text-slate-900 break-all">{createdInvite.invite_url}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(createdInvite.invite_url)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-1">Nível de Acesso</label>
                  <select
                    value={newInvite.admin_level}
                    onChange={(e) => setNewInvite({...newInvite, admin_level: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="convidado">Convidado</option>
                    <option value="user">Usuário</option>
                    <option value="admin_principal">Admin</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-slate-600 mb-1">Expira em (dias)</label>
                  <input
                    type="number"
                    value={newInvite.expires_in}
                    onChange={(e) => setNewInvite({...newInvite, expires_in: parseInt(e.target.value) || 7})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    min="1"
                    max="30"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newInvite.email}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Convite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
