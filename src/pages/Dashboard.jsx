import { useState, useEffect, useMemo } from 'react'
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
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
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 truncate">{request.title}</h4>
        <p className="text-xs text-slate-400 truncate">{request.package_name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
          statusColors[request.status]
        )}>
          {statusLabels[request.status]}
        </span>
        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
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
      
      const [statsData, recentData] = await Promise.all([
        api.getStats({ start_date: start, end_date: end }),
        api.listRequests({ start_date: start, end_date: end, limit: 10 })
      ])
      
      setStats(statsData)
      setRequests(recentData.items || recentData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentRequests = requests
  const firstName = user?.full_name?.split(' ')[0] || user?.nickname || 'Usuário'

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, <span className="text-emerald-500">{firstName}</span>! 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Veja o resumo das validações no período selecionado
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <button 
              onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-emerald-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 min-w-[160px] justify-center">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-700 capitalize text-sm">
                {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
            </div>

            <button 
              onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-emerald-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {(isUser || isAdmin) && (
            <Link
              to="/nova-validacao"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              NOVA VALIDAÇÃO
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="TOTAL NO MÊS" value={stats.total} icon={ClipboardList} gradient="from-slate-700 to-slate-800" />
            <StatCard title="PENDENTES" value={stats.pending} icon={Clock} gradient="from-amber-400 to-amber-500" />
            <StatCard title="APROVADOS" value={stats.approved} icon={CheckCircle} gradient="from-emerald-400 to-emerald-500" />
            <StatCard title="REPROVADOS" value={stats.rejected} icon={XCircle} gradient="from-red-400 to-red-500" />
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Últimas Atividades
              </h2>
              <Link
                to="/central"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-2"
              >
                VER CENTRAL
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentRequests.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentRequests.map(request => (
                  <RecentRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                   <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma atividade registrada neste período</p>
                {(isUser || isAdmin) && (
                  <Link to="/nova-validacao" className="text-emerald-500 font-bold text-xs mt-4 inline-block hover:underline">
                    Deseja criar uma nova validação?
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
