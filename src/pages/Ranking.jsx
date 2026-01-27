import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Target,
  Trophy,
  Medal,
  Award,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Trash2,
  TrendingUp,
  Flame,
  Sparkles,
  Settings,
  Edit3,
  Calendar,
  History,
  LayoutGrid,
  List,
  Square,
} from 'lucide-react'

// Progress Bar Component com escala de cores gradual e efeito FIRE quando 100%+
function GoalProgressBar({ percentage, size = 'md' }) {
  // Escala: 0-20% vermelho, 20-40% laranja, 40-60% amarelo, 60-80% verde-lima, 80-100% verde, 100%+ FIRE
  const getColor = (pct) => {
    if (pct >= 100) return 'from-green-500 via-emerald-400 to-green-400'
    if (pct >= 80) return 'from-lime-500 to-green-500'
    if (pct >= 60) return 'from-yellow-400 to-lime-500'
    if (pct >= 40) return 'from-amber-400 to-yellow-400'
    if (pct >= 20) return 'from-orange-500 to-amber-400'
    return 'from-red-500 to-orange-500'
  }
  
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const displayWidth = percentage >= 100 ? 100 : Math.min(percentage, 100)
  const isOnFire = percentage >= 100
  
  return (
    <div className="relative">
      {/* Container da barra */}
      <div className={cn("w-full bg-slate-200 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-500 rounded-full relative overflow-hidden",
            getColor(percentage)
          )}
          style={{ width: `${displayWidth}%` }}
        >
          {isOnFire && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
        </div>
      </div>
      
      {/* FOGUINHO - Fora do overflow para aparecer completo */}
      {isOnFire && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ right: '-12px' }}
        >
          <div className="animate-bounce" style={{ animationDuration: '0.4s' }}>
            🔥
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de Lista Compacta
function UserListItem({ userProgress, rank, onEditGoals, canEdit }) {
  const getRankBadge = (r) => {
    if (r === 1) return '🥇'
    if (r === 2) return '🥈'
    if (r === 3) return '🥉'
    return `#${r}`
  }
  
  const totalPct = userProgress.total_percentage
  const isOnFire = totalPct >= 100
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-white border-b border-slate-100 hover:bg-slate-50 transition",
      rank <= 3 && "bg-gradient-to-r from-amber-50/50 to-transparent"
    )}>
      {/* Rank */}
      <div className="w-10 text-center font-bold text-lg">
        {getRankBadge(rank)}
      </div>
      
      {/* Avatar */}
      {userProgress.profile_picture ? (
        <img src={userProgress.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-medium">
          {userProgress.user_name?.charAt(0) || '?'}
        </div>
      )}
      
      {/* Nome */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">
          {userProgress.nickname || userProgress.user_name}
          {userProgress.is_manager && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">👥 Equipe</span>}
        </p>
        <p className="text-xs text-slate-500 truncate">{userProgress.user_email}</p>
      </div>
      
      {/* Barra de progresso */}
      <div className="w-32 hidden sm:block">
        <GoalProgressBar percentage={totalPct} size="sm" />
      </div>
      
      {/* Percentual */}
      <div className={cn(
        "w-16 text-right font-bold",
        totalPct >= 100 ? "text-green-500" : totalPct >= 60 ? "text-yellow-500" : "text-red-500"
      )}>
        {totalPct}%
        {isOnFire && " 🔥"}
      </div>
      
      {/* Links */}
      <div className="w-20 text-right text-sm text-slate-500 hidden md:block">
        {userProgress.total_achieved}/{userProgress.total_target}
      </div>
      
      {/* Edit */}
      {canEdit && (
        <button onClick={() => onEditGoals(userProgress.user_id)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded">
          <Edit3 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Componente de Card Compacto
function UserCompactCard({ userProgress, rank, onEditGoals, canEdit }) {
  const getRankBadge = (r) => {
    if (r === 1) return { icon: '🥇', bg: 'bg-yellow-100 border-yellow-300' }
    if (r === 2) return { icon: '🥈', bg: 'bg-slate-100 border-slate-300' }
    if (r === 3) return { icon: '🥉', bg: 'bg-amber-100 border-amber-300' }
    return { icon: `#${r}`, bg: 'bg-white border-slate-200' }
  }
  
  const totalPct = userProgress.total_percentage
  const isOnFire = totalPct >= 100
  const badge = getRankBadge(rank)
  
  return (
    <div className={cn(
      "rounded-xl border p-4 transition hover:shadow-md",
      badge.bg
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{badge.icon}</div>
        
        {userProgress.profile_picture ? (
          <img src={userProgress.profile_picture} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold">
            {userProgress.user_name?.charAt(0) || '?'}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {userProgress.nickname || userProgress.user_name}
          </p>
          {userProgress.is_manager && (
            <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">👥 {userProgress.team_members?.length || 0}</span>
          )}
        </div>
        
        {canEdit && (
          <button onClick={() => onEditGoals(userProgress.user_id)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded">
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">{userProgress.total_achieved}/{userProgress.total_target} links</span>
          <span className={cn(
            "font-bold text-lg",
            totalPct >= 100 ? "text-green-500" : totalPct >= 60 ? "text-yellow-500" : "text-red-500"
          )}>
            {totalPct}% {isOnFire && "🔥"}
          </span>
        </div>
        <GoalProgressBar percentage={totalPct} size="md" />
      </div>
    </div>
  )
}

// User Goal Card
function UserGoalCard({ userProgress, rank, onEditGoals, canEdit }) {
  const getRankIcon = (r) => {
    if (r === 1) return <Trophy className="w-8 h-8 text-yellow-500" />
    if (r === 2) return <Medal className="w-8 h-8 text-slate-400" />
    if (r === 3) return <Award className="w-8 h-8 text-amber-600" />
    return <span className="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400">#{r}</span>
  }
  
  const totalPct = userProgress.total_percentage
  
  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-sm border p-6 transition-all",
      rank === 1 && "border-yellow-300 shadow-yellow-100 shadow-lg",
      rank === 2 && "border-slate-300",
      rank === 3 && "border-amber-200",
      rank > 3 && "border-slate-200"
    )}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          {getRankIcon(rank)}
        </div>
        
        {userProgress.profile_picture ? (
          <img
            src={userProgress.profile_picture}
            alt={userProgress.user_name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {userProgress.user_name?.charAt(0) || '?'}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">
            {userProgress.nickname || userProgress.user_name}
          </h3>
          <p className="text-sm text-slate-500">{userProgress.user_email}</p>
        </div>
        
        <div className="text-right">
          {userProgress.is_manager && (
            <div className="flex items-center gap-1 justify-end mb-1">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                👥 Equipe ({userProgress.team_members?.length || 0})
              </span>
            </div>
          )}
          <div className={cn(
            "text-3xl font-bold",
            totalPct >= 100 ? "text-green-500" : totalPct >= 80 ? "text-lime-600" : totalPct >= 60 ? "text-yellow-500" : totalPct >= 40 ? "text-amber-500" : totalPct >= 20 ? "text-orange-500" : "text-red-500"
          )}>
            {totalPct}%
            {totalPct >= 100 && <Flame className="w-6 h-6 inline ml-1 text-orange-500 animate-pulse" />}
          </div>
          <p className="text-xs text-slate-400">
            {userProgress.total_achieved}/{userProgress.total_target} links
          </p>
        </div>
        
        {/* Edit button */}
        {canEdit && (
          <button
            onClick={() => onEditGoals(userProgress.user_id)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            title="Editar metas deste usuário"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Total Progress */}
      <div className="mb-4">
        <GoalProgressBar percentage={totalPct} size="lg" />
      </div>
      
      {/* Individual Goals */}
      <div className="space-y-3">
        {userProgress.goals.map((goal, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-32 text-sm text-slate-600 truncate" title={goal.package_name}>
              📦 {goal.package_name}
            </div>
            <div className="flex-1">
              <GoalProgressBar percentage={goal.percentage} size="sm" />
            </div>
            <div className="w-24 text-right text-sm">
              <span className={cn(
                "font-medium",
                goal.percentage >= 100 ? "text-amber-600" : "text-slate-700"
              )}>
                {goal.achieved}/{goal.target}
              </span>
              <span className="text-slate-400 ml-1">({goal.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Modal for Setting/Managing Goals
function GoalsModal({ open, onClose, month, users, packages, existingGoals, onSave, preSelectedUserId }) {
  const [selectedUser, setSelectedUser] = useState(preSelectedUserId || '')
  const [goals, setGoals] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  
  useEffect(() => {
    if (preSelectedUserId) {
      setSelectedUser(preSelectedUserId)
    }
  }, [preSelectedUserId])
  
  useEffect(() => {
    if (selectedUser && existingGoals) {
      const userGoals = existingGoals.filter(g => g.user_id == selectedUser)
      setGoals(userGoals.map(g => ({ 
        id: g.id,
        package_id: g.package_id, 
        target_count: g.target_count 
      })))
    } else {
      setGoals([])
    }
  }, [selectedUser, existingGoals])
  
  const addGoalRow = () => {
    setGoals([...goals, { package_id: '', target_count: 0 }])
  }
  
  const removeGoalRow = async (index) => {
    const goal = goals[index]
    if (goal.id) {
      // Excluir do banco
      setDeleting(index)
      try {
        await api.deleteGoal(goal.id)
        toast.success('Meta excluída!')
        setGoals(goals.filter((_, i) => i !== index))
      } catch (error) {
        toast.error('Erro ao excluir: ' + error.message)
      } finally {
        setDeleting(null)
      }
    } else {
      setGoals(goals.filter((_, i) => i !== index))
    }
  }
  
  const updateGoalRow = (index, field, value) => {
    setGoals(goals.map((g, i) => i === index ? { ...g, [field]: value } : g))
  }
  
  const handleSave = async () => {
    if (!selectedUser) {
      toast.error('Selecione um usuário')
      return
    }
    
    const validGoals = goals.filter(g => g.package_id && g.target_count > 0)
    if (validGoals.length === 0) {
      toast.error('Adicione pelo menos uma meta')
      return
    }
    
    setSaving(true)
    try {
      for (const goal of validGoals) {
        await api.createGoal({
          user_id: selectedUser,
          package_id: goal.package_id,
          target_count: parseInt(goal.target_count),
          month: month,
        })
      }
      toast.success('Metas salvas!')
      onSave()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }
  
  if (!open) return null
  
  const isPast = new Date(month + '-01') < new Date(new Date().toISOString().slice(0, 7) + '-01')
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              {isPast ? <History className="w-5 h-5 text-amber-500" /> : <Target className="w-5 h-5 text-emerald-500" />}
              {preSelectedUserId ? 'Editar Metas' : 'Definir Metas'} - {formatMonthShort(month)}
            </h2>
            {isPast && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Mês passado - alterações afetam registros históricos
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              disabled={!!preSelectedUserId}
            >
              <option value="">Selecione um usuário...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nickname || u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          
          {/* Goals List */}
          {selectedUser && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Metas por Pacote</label>
              
              {goals.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhuma meta definida. Clique em "Adicionar pacote".</p>
              )}
              
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                  <select
                    value={goal.package_id}
                    onChange={e => updateGoalRow(index, 'package_id', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm bg-white"
                  >
                    <option value="">Selecione pacote...</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={goal.target_count}
                    onChange={e => updateGoalRow(index, 'target_count', e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm text-center bg-white"
                    placeholder="Meta"
                    min="0"
                  />
                  <span className="text-sm text-slate-500">links</span>
                  <button
                    onClick={() => removeGoalRow(index)}
                    disabled={deleting === index}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    {deleting === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              
              <button
                onClick={addGoalRow}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar pacote
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedUser}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Metas'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatMonthShort(m) {
  const [year, mon] = m.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(mon) - 1]}/${year}`
}

export default function Ranking() {
  const { can, isAdmin } = useAuth()
  const [progress, setProgress] = useState([])
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [existingGoals, setExistingGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards', 'list', 'compact'
  
  const canManageGoals = isAdmin || can('manage_packages')
  
  const currentMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()
  
  const isPastMonth = month < currentMonth
  const isFutureMonth = month > currentMonth
  
  const loadData = async () => {
    setLoading(true)
    try {
      const [progressData, usersData, pkgData, goalsData] = await Promise.all([
        api.getGoalsProgress(month),
        api.listUsers().catch(() => []), // Fallback se não tiver permissão
        api.listPackages(true),
        api.listGoals(month),
      ])
      setProgress(progressData)
      setUsers(usersData)
      setPackages(pkgData)
      setExistingGoals(goalsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [month])
  
  const changeMonth = (delta) => {
    const [year, mon] = month.split('-').map(Number)
    const newDate = new Date(year, mon - 1 + delta, 1)
    setMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`)
  }
  
  const formatMonth = (m) => {
    const [year, mon] = m.split('-')
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${months[parseInt(mon) - 1]} ${year}`
  }
  
  const openEditGoals = (userId = null) => {
    setEditingUserId(userId)
    setShowGoalsModal(true)
  }
  
  const closeGoalsModal = () => {
    setShowGoalsModal(false)
    setEditingUserId(null)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Metas da Equipe
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe o progresso das metas mensais</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "p-2 rounded-md transition",
                viewMode === 'cards' ? "bg-white shadow text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
              title="Cards expandidos"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "p-2 rounded-md transition",
                viewMode === 'compact' ? "bg-white shadow text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
              title="Cards compactos"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition",
                viewMode === 'list' ? "bg-white shadow text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {canManageGoals && (
            <div className="flex gap-2">
              <button
                onClick={() => openEditGoals()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                Nova Meta
              </button>
              <button
                onClick={() => openEditGoals()}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition"
                title="Gerenciar metas existentes"
              >
                <Settings className="w-5 h-5" />
                Gerenciar
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Month Selector with indicators */}
      <div className={cn(
        "flex items-center justify-center gap-4 rounded-xl p-4 border",
        isPastMonth ? "bg-amber-50 border-amber-200" : isFutureMonth ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
      )}>
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center min-w-48">
          <div className="flex items-center justify-center gap-2">
            {isPastMonth && <History className="w-4 h-4 text-amber-600" />}
            {isFutureMonth && <Calendar className="w-4 h-4 text-blue-600" />}
            <span className="text-lg font-semibold text-slate-900">
              📅 {formatMonth(month)}
            </span>
          </div>
          {isPastMonth && (
            <span className="text-xs text-amber-600 font-medium">Mês passado - Dados históricos</span>
          )}
          {isFutureMonth && (
            <span className="text-xs text-blue-600 font-medium">Mês futuro - Planejamento</span>
          )}
        </div>
        
        <button
          onClick={() => changeMonth(1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {month !== currentMonth && (
          <button
            onClick={() => setMonth(currentMonth)}
            className="ml-2 px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition font-medium"
          >
            Hoje
          </button>
        )}
      </div>
      
      {/* Progress Cards */}
      {progress.length > 0 ? (
        <>
          {/* View: Cards Expandidos */}
          {viewMode === 'cards' && (
            <div className="space-y-4">
              {progress.map((userProgress, index) => (
                <UserGoalCard
                  key={userProgress.user_id}
                  userProgress={userProgress}
                  rank={index + 1}
                  canEdit={canManageGoals}
                  onEditGoals={openEditGoals}
                />
              ))}
            </div>
          )}
          
          {/* View: Cards Compactos */}
          {viewMode === 'compact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progress.map((userProgress, index) => (
                <UserCompactCard
                  key={userProgress.user_id}
                  userProgress={userProgress}
                  rank={index + 1}
                  canEdit={canManageGoals}
                  onEditGoals={openEditGoals}
                />
              ))}
            </div>
          )}
          
          {/* View: Lista */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {progress.map((userProgress, index) => (
                <UserListItem
                  key={userProgress.user_id}
                  userProgress={userProgress}
                  rank={index + 1}
                  canEdit={canManageGoals}
                  onEditGoals={openEditGoals}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">
            {isPastMonth 
              ? 'Nenhuma meta foi definida para este mês'
              : 'Nenhuma meta definida para este mês'}
          </p>
          {canManageGoals && (
            <button
              onClick={() => openEditGoals()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              {isPastMonth ? 'Definir Metas Retroativas' : 'Definir Metas'}
            </button>
          )}
        </div>
      )}
      
      {/* Goals Modal */}
      <GoalsModal
        open={showGoalsModal}
        onClose={closeGoalsModal}
        month={month}
        users={users}
        packages={packages}
        existingGoals={existingGoals}
        onSave={loadData}
        preSelectedUserId={editingUserId}
      />
    </div>
  )
}
