import { useState, useEffect, createContext, useContext } from 'react'
import api, { getToken, setToken, removeToken } from '../lib/api'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    const errorFromUrl = urlParams.get('error')
    const emailFromUrl = urlParams.get('email')
    
    const initAuth = async () => {
      if (tokenFromUrl) {
        setToken(tokenFromUrl)
      }
      
      if (errorFromUrl) {
        if (errorFromUrl === 'not_registered') {
          toast.error(`Email ${emailFromUrl || ''} não está cadastrado. Peça ao administrador para adicionar você.`, { duration: 10000 })
        } else if (errorFromUrl === 'no_code') {
          toast.error('Erro no login com Google. Tente novamente.')
        } else if (errorFromUrl === 'token_failed') {
          toast.error('Erro ao autenticar com Google. Tente novamente.')
        } else {
          toast.error('Erro no login: ' + errorFromUrl)
        }
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      await checkAuth(tokenFromUrl)
      
      if (tokenFromUrl) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    initAuth()
  }, [])

  const checkAuth = async (initialToken) => {
    const token = initialToken || getToken()
    if (!token) {
      setLoading(false)
      return
    }
    
    try {
      const userData = await api.me()
      setUser(userData)
    } catch (error) {
      if (!initialToken) {
        removeToken()
        setUser(null)
      }
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

  // Verificar permissão específica
  const can = (permission) => {
    if (!user) return false
    if (user.admin_level === 'admin_principal') return true
    return user.permissions?.[permission] === true
  }

  // Verificar se tem pelo menos uma das permissões (para menus)
  const hasAnyPermission = (permissions) => {
    if (!user) return false
    if (user.admin_level === 'admin_principal') return true
    return permissions.some(p => user.permissions?.[p] === true)
  }

  const hasPermission = (levels) => {
    if (!user) return false
    const levelArray = Array.isArray(levels) ? levels : [levels]
    return levelArray.includes(user.admin_level)
  }

  const isAdmin = user?.admin_level === 'admin_principal'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUserData,
      hasPermission,
      can,
      hasAnyPermission,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
