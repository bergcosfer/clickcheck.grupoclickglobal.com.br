import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { api } from '../lib/api'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    
    if (!code) {
      setStatus('error')
      setTimeout(() => navigate('/?error=no_code'), 3000)
      return
    }

    const authenticate = async () => {
      try {
        const success = await api.authCallback(code)
        if (success) {
          setStatus('success')
          setTimeout(() => navigate('/ranking'), 1500)
        } else {
          setStatus('error')
          setTimeout(() => navigate('/?error=login_failed'), 3000)
        }
      } catch (err) {
        console.error("Auth Callback falhou:", err)
        setStatus('error')
        setTimeout(() => navigate('/?error=server_fail'), 3000)
      }
    }

    authenticate()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center border border-slate-100">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Autenticando</h2>
            <p className="text-slate-500">Conectando ao Google Segurança...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Login Concluído</h2>
            <p className="text-slate-500">Redirecionando para o sistema...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Falha na Autenticação</h2>
            <p className="text-slate-500">Não foi possível completar o login. Redirecionando...</p>
          </div>
        )}

      </div>
    </div>
  )
}
