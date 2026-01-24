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
} from 'lucide-react'

// Progress Bar Component
function GoalProgressBar({ percentage, size = 'md' }) {
  const getColor = (pct) => {
    if (pct >= 100) return 'from-yellow-400 to-amber-500' // Gold for exceeding
    if (pct >= 75) return 'from-emerald-400 to-emerald-500'
    if (pct >= 50) return 'from-yellow-400 to-yellow-500'
    return 'from-red-400 to-red-500'
  }
  
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const clampedWidth = Math.min(percentage, 150) // Cap visual at 150%
  
  return (
    <div className={cn("w-full bg-slate-200 rounded-full overflow-hidden", heights[size])}>
      <div
        className={cn(
          "h-full bg-gradient-to-r transition-all duration-500 rounded-full relative",
          getColor(percentage)
        )}
        style={{ width: `${Math.min(clampedWidth, 100)}%` }}
      >
        {percentage > 100 && (
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse"
            style={{ width: `${((percentage - 100) / percentage) * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

// User Goal Card
function UserGoalCard({ userProgress, rank }) {
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
          <div className={cn(
            "text-3xl font-bold",
            totalPct >= 100 ? "text-amber-500" : totalPct >= 75 ? "text-emerald-600" : totalPct >= 50 ? "text-yellow-600" : "text-red-500"
          )}>
            {totalPct}%
            {totalPct >= 100 && <Flame className="w-6 h-6 inline ml-1 text-orange-500 animate-pulse" />}
          </div>
          <p className="text-xs text-slate-400">
            {userProgress.total_achieved}/{userProgress.total_target} links
          </p>
        </div>
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

// Modal for Setting Goals
function GoalsModal({ open, onClose, month, users, packages, existingGoals, onSave }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [goals, setGoals] = useState([])
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    if (selectedUser && existingGoals) {
      const userGoals = existingGoals.filter(g => g.user_id == selectedUser)
      setGoals(userGoals.map(g => ({ package_id: g.package_id, target_count: g.target_count })))
    } else {
      setGoals([])
    }
  }, [selectedUser, existingGoals])
  
  const addGoalRow = () => {
    setGoals([...goals, { package_id: '', target_count: 0 }])
  }
  
  const removeGoalRow = (index) => {
    setGoals(goals.filter((_, i) => i !== index))
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            🎯 Definir Metas - {month}
          </h2>
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
              
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={goal.package_id}
                    onChange={e => updateGoalRow(index, 'package_id', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm"
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
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none text-sm text-center"
                    placeholder="Meta"
                    min="0"
                  />
                  <span className="text-sm text-slate-500">links</span>
                  <button
                    onClick={() => removeGoalRow(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addGoalRow}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
  
  const canManageGoals = isAdmin || can('manage_packages')
  
  const loadData = async () => {
    setLoading(true)
    try {
      const [progressData, usersData, pkgData, goalsData] = await Promise.all([
        api.getGoalsProgress(month),
        api.listUsers(),
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
        
        {canManageGoals && (
          <button
            onClick={() => setShowGoalsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Definir Metas
          </button>
        )}
      </div>
      
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4 bg-white rounded-xl p-4 border border-slate-200">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold text-slate-900 min-w-48 text-center">
          📅 {formatMonth(month)}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress Cards */}
      {progress.length > 0 ? (
        <div className="space-y-4">
          {progress.map((userProgress, index) => (
            <UserGoalCard
              key={userProgress.user_id}
              userProgress={userProgress}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">Nenhuma meta definida para este mês</p>
          {canManageGoals && (
            <button
              onClick={() => setShowGoalsModal(true)}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              Definir Metas
            </button>
          )}
        </div>
      )}
      
      {/* Goals Modal */}
      <GoalsModal
        open={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        month={month}
        users={users}
        packages={packages}
        existingGoals={existingGoals}
        onSave={loadData}
      />
    </div>
  )
}
