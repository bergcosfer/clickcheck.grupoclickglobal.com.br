import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'sonner'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import NovaValidacao from '@/pages/NovaValidacao'
import CentralValidacao from '@/pages/CentralValidacao'
import Pacotes from '@/pages/Pacotes'
import Ranking from '@/pages/Ranking'
import Relatorios from '@/pages/Relatorios'
import MeuPerfil from '@/pages/MeuPerfil'
import Usuarios from '@/pages/Usuarios'
import Wiki from '@/pages/Wiki'
import InvitePage from '@/pages/InvitePage'
import InvitesPage from '@/pages/InvitesPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública para aceitar convite */}
          <Route path="/invite" element={<InvitePage />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="nova-validacao" element={<NovaValidacao />} />
            <Route path="central" element={<CentralValidacao />} />
            <Route path="pacotes" element={<Pacotes />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="perfil" element={<MeuPerfil />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="convites" element={<InvitesPage />} />
            <Route path="wiki" element={<Wiki />} />
          </Route>
        </Routes>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
