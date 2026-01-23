import { useState, useEffect, createContext, useContext } from 'react'
import api, { getToken, setToken, removeToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token na URL (retorno do login)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    
    try {
      const userData = await api.me()
      setUser(userData)
    } catch (error) {
      removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    api.login()
  }

  const logout = async () => {
    removeToken()
    setUser(null)
  }

  const updateUserData = (newData) => {
    setUser(prev => ({ ...prev, ...newData }))
  }

  const hasPermission = (levels) => {
    if (!user) return false
    const levelArray = Array.isArray(levels) ? levels : [levels]
    return levelArray.includes(user.admin_level)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserData,
    hasPermission,
    isAdmin: user?.admin_level === 'admin_principal',
    isUser: user?.admin_level === 'user' || user?.admin_level === 'admin_principal',
    isGuest: user?.admin_level === 'convidado',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
