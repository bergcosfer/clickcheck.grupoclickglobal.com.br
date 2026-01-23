import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Package,
  Trophy,
  BarChart3,
  User,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react'

// Navigation Items
const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredLevel: ['convidado', 'user', 'admin_principal'],
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Nova Validação',
    href: '/nova-validacao',
    icon: PlusCircle,
    requiredLevel: ['user', 'admin_principal'],
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Central',
    href: '/central',
    icon: ClipboardList,
    requiredLevel: ['convidado', 'user', 'admin_principal'],
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Pacotes',
    href: '/pacotes',
    icon: Package,
    requiredLevel: ['admin_principal'],
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    title: 'Ranking',
    href: '/ranking',
    icon: Trophy,
    requiredLevel: ['convidado', 'user', 'admin_principal'],
    gradient: 'from-yellow-500 to-yellow-600',
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    requiredLevel: ['admin_principal'],
    gradient: 'from-red-500 to-red-600',
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: Users,
    requiredLevel: ['admin_principal'],
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Convites',
    href: '/convites',
    icon: Mail,
    requiredLevel: ['admin_principal'],
    gradient: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Wiki',
    href: '/wiki',
    icon: BookOpen,
    requiredLevel: ['user', 'admin_principal'],
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Meu Perfil',
    href: '/perfil',
    icon: User,
    requiredLevel: ['convidado', 'user', 'admin_principal'],
    gradient: 'from-slate-500 to-slate-600',
  },
]

// Login Screen Component
function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Clickcheck</h1>
          <p className="text-slate-400">Sistema inteligente de validação de conteúdo</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">Bem-vindo!</h2>
          <p className="text-slate-300 mb-8">
            Acesse sua conta para gerenciar validações de conteúdo com eficiência.
          </p>
          
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3 px-6 rounded-xl hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-500 text-sm">
          © 2024 Clickcheck. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user, logout, hasPermission } = useAuth()

  const visibleItems = navItems.filter(item => 
    hasPermission(item.requiredLevel)
  )

  const adminLevelLabels = {
    convidado: 'Convidado',
    user: 'Usuário',
    admin_principal: 'Admin',
  }

  const adminLevelColors = {
    convidado: 'bg-slate-500',
    user: 'bg-blue-500',
    admin_principal: 'bg-emerald-500',
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:transform-none flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Clickcheck</h1>
              <p className="text-xs text-slate-500">Sistema de Validação</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-medium">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.nickname || user?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium text-white rounded-full",
              adminLevelColors[user?.admin_level] || 'bg-slate-500'
            )}>
              {adminLevelLabels[user?.admin_level] || 'Convidado'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// Top Bar for Mobile
function TopBar({ onToggleSidebar }) {
  const { user } = useAuth()

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">Clickcheck</span>
      </div>

      {user?.profile_picture ? (
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
          {user?.full_name?.charAt(0) || '?'}
        </div>
      )}
    </div>
  )
}

// Main Layout Component
export default function Layout() {
  const { user, loading, login } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <LoginScreen onLogin={login} />
  }

  // Authenticated
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
