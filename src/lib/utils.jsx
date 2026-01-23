import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// API Base URL
export const API_URL = 'http://localhost/clickcheck/backend/api'

// Fetch helper with credentials
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || 'Erro na requisição')
  }
  
  return response.json()
}

// Format date in Portuguese
export function formatDate(date, format = 'short') {
  if (!date) return '-'
  const d = new Date(date)
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR')
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('pt-BR')
  }
  
  return d.toLocaleDateString('pt-BR')
}

// Priority colors
export const priorityColors = {
  baixa: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-700',
  urgente: 'bg-red-100 text-red-700',
}

// Status colors
export const statusColors = {
  pendente: 'bg-yellow-100 text-yellow-700',
  em_analise: 'bg-blue-100 text-blue-700',
  aprovado: 'bg-emerald-100 text-emerald-700',
  reprovado: 'bg-red-100 text-red-700',
  aprovado_parcial: 'bg-amber-100 text-amber-700',
}

// Status labels
export const statusLabels = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  aprovado_parcial: 'Aprovado Parcial',
}

// Priority labels
export const priorityLabels = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
}

// Admin level labels
export const adminLevelLabels = {
  convidado: 'Convidado',
  user: 'Usuário',
  admin_principal: 'Admin',
}
