import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Medal,
  Award,
  Star,
  Loader2,
} from 'lucide-react'

export default function Ranking() {
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, requestsData] = await Promise.all([
        api.listUsers(),
        api.listRequests(),
      ])
      setUsers(usersData)
      setRequests(requestsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate scores
  const rankedUsers = users.map(user => {
    const approvalsMade = requests.filter(r => r.validated_by === user.email && r.status === 'aprovado').length
    const approvalsReceived = requests.filter(r => r.requested_by === user.email && r.status === 'aprovado').length
    const partialApprovalsReceived = requests.filter(r => r.requested_by === user.email && r.status === 'aprovado_parcial').length
    const rejectionsReceived = requests.filter(r => r.requested_by === user.email && r.status === 'reprovado').length
    const returnsPenalties = requests.filter(r => r.requested_by === user.email && (r.return_count || 0) > 0)
      .reduce((acc, r) => acc + (r.return_count || 0), 0)

    const score = Math.max(0, 
      approvalsMade + 
      (approvalsReceived * 2) + 
      partialApprovalsReceived - 
      rejectionsReceived - 
      returnsPenalties
    )

    const hasActivity = approvalsMade > 0 || approvalsReceived > 0 || partialApprovalsReceived > 0 || rejectionsReceived > 0

    return {
      ...user,
      score,
      approvalsMade,
      approvalsReceived,
      partialApprovalsReceived,
      rejectionsReceived,
      returnsPenalties,
      hasActivity,
    }
  }).sort((a, b) => b.score - a.score)

  const activeUsers = rankedUsers.filter(u => u.hasActivity)
  const inactiveUsers = rankedUsers.filter(u => !u.hasActivity)

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />
    return <span className="w-6 h-6 text-center text-slate-400 font-bold">{index + 1}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          Ranking de Desempenho
        </h1>
        <p className="text-slate-500 mt-1">Classificação baseada em validações realizadas e aprovações recebidas</p>
      </div>

      {/* Active Users Ranking */}
      {activeUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Usuários Ativos
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {activeUsers.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors",
                  index === 0 && "bg-yellow-50/50",
                  index === 1 && "bg-slate-50/50",
                  index === 2 && "bg-amber-50/50"
                )}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(index)}
                </div>
                
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {user.nickname || user.full_name || user.email}
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{user.score}</p>
                  <p className="text-xs text-slate-400">pontos</p>
                </div>

                <div className="hidden md:flex gap-4 text-center text-xs">
                  <div>
                    <p className="font-medium text-slate-900">{user.approvalsMade}</p>
                    <p className="text-slate-400">Validações</p>
                  </div>
                  <div>
                    <p className="font-medium text-emerald-600">{user.approvalsReceived}</p>
                    <p className="text-slate-400">Aprovados</p>
                  </div>
                  <div>
                    <p className="font-medium text-red-600">{user.rejectionsReceived}</p>
                    <p className="text-slate-400">Reprovados</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Users */}
      {inactiveUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-500">Aguardando Participação</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {inactiveUsers.map(user => (
                <div key={user.id} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.full_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-medium">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-sm text-slate-600">{user.nickname || user.full_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeUsers.length === 0 && inactiveUsers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum usuário cadastrado ainda</p>
        </div>
      )}
    </div>
  )
}
