import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react'
import api from '../lib/api'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState(null)
  
  const token = searchParams.get('token')
  
  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado')
      setLoading(false)
      return
    }
    
    verifyInvite()
  }, [token])
  
  const verifyInvite = async () => {
    try {
      const response = await fetch('https://clickcheck.grupoclickglobal.com.br/api/invites.php?action=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await response.json()
      
      if (data.valid) {
        setInvite(data)
      } else {
        setError(data.error || 'Convite inválido')
      }
    } catch (err) {
      setError('Erro ao verificar convite')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAccept = () => {
    window.location.href = `https://clickcheck.grupoclickglobal.com.br/api/auth.php?action=login&invite=${token}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-slate-700/50 shadow-2xl">
        {error ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Convite Inválido</h1>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              Voltar ao Início
            </button>
          </div>
        ) : invite ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Você foi Convidado!</h1>
            <p className="text-slate-400 mb-6">
              Você foi convidado para acessar o <strong className="text-teal-400">Clickcheck</strong>
            </p>
            
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Email:</span>
                <span className="text-white">{invite.email}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Nível de acesso:</span>
                <span className="text-teal-400 capitalize">{invite.admin_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expira em:</span>
                <span className="text-white">{new Date(invite.expires_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <p className="text-yellow-400/80 text-sm mb-4">
              ⚠️ Você precisa fazer login com o email <strong>{invite.email}</strong>
            </p>
            
            <button
              onClick={handleAccept}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Aceitar Convite com Google
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
