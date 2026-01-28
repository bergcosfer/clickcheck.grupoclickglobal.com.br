import { useState, useEffect, useMemo } from 'react'
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn, statusColors, statusLabels, priorityColors, priorityLabels, formatDate } from '@/lib/utils'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

// Stat Card Component
function StatCard({ title, value, icon: Icon, gradient, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
          gradient
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Recent Request Card
function RecentRequestCard({ request }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 truncate">{request.title}</h4>
        <p className="text-sm text-slate-500 truncate">{request.package_name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2 py-1 text-xs font-medium rounded-full",
          statusColors[request.status]
        )}>
          {statusLabels[request.status]}
        </span>
        <span className="text-xs text-slate-400">
          {formatDate(request.created_at)}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, isUser, isAdmin } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
      
      const data = await api.listRequests({ 
        start_date: start, 
        end_date: end,
        limit: 1000 // Aumentamos o limite para pegar todas do mês para as estatísticas
      })
      
      // Handle response structure (items/meta) from backend pagination
      const items = data.items || data
      
      setRequests(items)
      
      // Calculate stats based on ALL items of the month
      setStats({
        total: items.length,
        pending: items.filter(r => r.status === 'pendente' || r.status === 'em_analise').length,
        approved: items.filter(r => r.status === 'aprovado' || r.status === 'aprovado_parcial').length,
        rejected: items.filter(r => r.status === 'reprovado').length,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentRequests = requests.slice(0, 5)
  const firstName = user?.full_name?.split(' ')[0] || 'Usuário'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Veja o resumo das suas validações
          </p>
        </div>

        
        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 capitalize">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
          </div>

          <button 
            onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {(isUser || isAdmin) && (
          <Link
            to="/nova-validacao"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium py-2.5 px-5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Validação
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Solicitações"
          value={stats.total}
          icon={ClipboardList}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Pendentes"
          value={stats.pending}
          icon={Clock}
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard
          title="Aprovados"
          value={stats.approved}
          icon={CheckCircle}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Reprovados"
          value={stats.rejected}
          icon={XCircle}
          gradient="from-red-500 to-red-600"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Solicitações Recentes
          </h2>
          <Link
            to="/central"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            Ver Todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentRequests.length > 0 ? (
          <div>
            {recentRequests.map(request => (
              <RecentRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma solicitação ainda</p>
            
        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2 min-w-[140px] justify-center">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 capitalize">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
          </div>

          <button 
            onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {(isUser || isAdmin) && (
              <Link
                to="/nova-validacao"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                Criar primeira validação
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
