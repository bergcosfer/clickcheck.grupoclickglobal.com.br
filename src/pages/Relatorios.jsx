import { useState, useEffect, useMemo } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn, statusColors, statusLabels, formatDate } from '@/lib/utils'
import {
  BarChart3,
  Calendar,
  Users,
  Filter,
  Loader2,
  AlertTriangle,
  ClipboardList,
  Link as LinkIcon,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']

export default function Relatorios() {
  const { isAdmin, can, user } = useAuth()
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [showDateModal, setShowDateModal] = useState(false)
  const [batchDate, setBatchDate] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('visao')

  // Filters
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    userId: '',
    status: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [reqData, usersData] = await Promise.all([
        api.listRequests({ start_date: filters.startDate, end_date: filters.endDate }),
        api.listUsers(),
      ])
      setRequests(reqData)
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Parse dates properly for comparison (ignore time component)
      if (filters.startDate) {
        const createdDate = r.created_at?.split(' ')[0] || r.created_at?.split('T')[0]
        if (createdDate && createdDate < filters.startDate) return false
      }
      if (filters.endDate) {
        const createdDate = r.created_at?.split(' ')[0] || r.created_at?.split('T')[0]
        if (createdDate && createdDate > filters.endDate) return false
      }
      if (filters.userId && r.requested_by !== filters.userId && r.assigned_to !== filters.userId && r.validated_by !== filters.userId) return false
      if (filters.status && r.status !== filters.status) return false
      return true
    })
  }, [requests, filters])

  // Stats
  const stats = useMemo(() => {
    const totalLinks = filteredRequests.reduce((acc, r) => acc + (r.total_links_count || r.content_urls?.length || 0), 0)
    const approved = filteredRequests.filter(r => r.status === 'aprovado').length
    const validatedRequests = filteredRequests.filter(r => r.validated_at)
    const avgTime = validatedRequests.length > 0
      ? validatedRequests.reduce((acc, r) => {
          const created = new Date(r.created_at)
          const validated = new Date(r.validated_at)
          return acc + (validated - created) / (1000 * 60 * 60)
        }, 0) / validatedRequests.length
      : 0

    return {
      total: filteredRequests.length,
      totalLinks,
      approvalRate: filteredRequests.length > 0 ? ((approved / filteredRequests.length) * 100).toFixed(1) : 0,
      avgTime: avgTime.toFixed(1),
    }
  }, [filteredRequests])

  // Chart data
  const statusChartData = useMemo(() => {
    const counts = {}
    filteredRequests.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }))
  }, [filteredRequests])

  const userChartData = useMemo(() => {
    const userData = {}
    filteredRequests.forEach(r => {
      if (!userData[r.requested_by]) {
        userData[r.requested_by] = { requested: 0, validated: 0 }
      }
      userData[r.requested_by].requested++
      
      if (r.validated_by) {
        if (!userData[r.validated_by]) {
          userData[r.validated_by] = { requested: 0, validated: 0 }
        }
        userData[r.validated_by].validated++
      }
    })
    
    return Object.entries(userData)
      .map(([email, data]) => {
        const user = users.find(u => u.email === email)
        return {
          name: user?.nickname || user?.full_name || email.split('@')[0],
          solicitadas: data.requested,
          validadas: data.validated,
        }
      })
      .sort((a, b) => (b.solicitadas + b.validadas) - (a.solicitadas + a.validadas))
      .slice(0, 10)
  }, [filteredRequests, users])

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', userId: '', status: '' })
  }


  const handleBulkUpdateDate = async () => {
    if (!batchDate) return toast.error('Selecione uma data')
    setIsUpdating(true)
    try {
      await api.bulkUpdateDate(selectedIds, batchDate)
      toast.success('Datas atualizadas com sucesso!')
      setSelectedIds([])
      setShowDateModal(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao atualizar datas')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isAdmin && !can("view_reports")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500">Apenas administradores podem acessar relatórios.</p>
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Relatórios
        </h1>
        <p className="text-slate-500 mt-1">Análise detalhada das validações</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              placeholder="Data início"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <select
            value={filters.userId}
            onChange={e => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="">Todos os usuários</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>{u.nickname || u.full_name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Resetar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Validações</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLinks}</p>
              <p className="text-xs text-slate-500">Total de Links</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.approvalRate}%</p>
              <p className="text-xs text-slate-500">Taxa Aprovação</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.avgTime}h</p>
              <p className="text-xs text-slate-500">Tempo Médio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribuição por Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Sem dados
            </div>
          )}
        </div>

        {/* By User */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Validações por Usuário</h3>
          {userChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="solicitadas" fill="#3b82f6" name="Solicitadas" />
                <Bar dataKey="validadas" fill="#10b981" name="Validadas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Sem dados
            </div>
          )}
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Detalhes</h3>
          {user?.email === 'berg.cosfer@gmail.com' && selectedIds.length > 0 && (
            <button
              onClick={() => setShowDateModal(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Alterar Data ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {user?.email === 'berg.cosfer@gmail.com' && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      checked={selectedIds.length === filteredRequests.slice(0, 20).length && filteredRequests.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredRequests.slice(0, 20).map(r => r.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Validador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Links</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.slice(0, 20).map(req => {
                const requester = users.find(u => u.email === req.requested_by)
                const validator = users.find(u => u.email === req.validated_by)
                return (
                  <tr key={req.id} className={cn("hover:bg-slate-50", selectedIds.includes(req.id) && "bg-red-50/30")}>
                    {user?.email === 'berg.cosfer@gmail.com' && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          checked={selectedIds.includes(req.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, req.id])
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== req.id))
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{req.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{requester?.nickname || requester?.full_name || req.requested_by}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{validator?.nickname || validator?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{req.approved_links_count || 0}/{req.total_links_count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusColors[req.status])}>
                        {statusLabels[req.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(req.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Date Update Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Alterar Data em Massa</h2>
              <p className="text-slate-500 text-center mb-8">
                Defina a nova data de criação para as {selectedIds.length} validações selecionadas.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nova Data</label>
                  <input
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowDateModal(false)}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkUpdateDate}
                    disabled={isUpdating || !batchDate}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
