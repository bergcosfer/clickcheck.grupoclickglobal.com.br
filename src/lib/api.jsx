/**
 * Clickcheck - API Client com Token
 */

const API_URL = 'https://clickcheck.grupoclickglobal.com.br/api'

// Gerenciamento de Token
const TOKEN_KEY = 'clickcheck_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

class ApiClient {
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`
    const token = getToken()
    
    const fetchOptions = { ...options }
    if (fetchOptions.body && typeof fetchOptions.body === 'string' && fetchOptions.body.startsWith('{')) {
        const _b64 = btoa(unescape(encodeURIComponent(fetchOptions.body)))
        fetchOptions.body = JSON.stringify({ _b64 })
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição')
    }
    
    return data
  }

  // Auth
  async me() {
    return this.fetch('/auth.php?action=me')
  }

  login() {
    // Redirecionar direto para Google OAuth (resolvendo block do ModSecurity na Hostgator)
    const clientId = '605011846792-s6inrmfffljk4cos19rorjjc3ncvc89i.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent(`https://clickcheck-grupoclickglobal-com-br.vercel.app/google/sucesso`)
    const scope = encodeURIComponent('email profile')
    window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`
  }
  
  // Realiza a requisicao secreta POST para recuperar o Token real (Bypass Modsecurity)
  async authCallback(code) {
    const payload = JSON.stringify({ 
         code: code,
         redirect_uri: `https://clickcheck-grupoclickglobal-com-br.vercel.app/google/sucesso`
    })
    const _b64 = btoa(unescape(encodeURIComponent(payload)))

    const res = await fetch(`${API_URL}/auth.php?action=google-callback-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _b64 })
    })

    if (!res.ok) {
        throw new Error('Falha no callback da API')
    }

    const data = await res.json()
    if (data.token) {
        setToken(data.token)
        return true
    }
    return false
  }

  async logout() {
    removeToken()
    return { success: true }
  }

  // Users
  async listUsers() {
    return this.fetch('/users.php')
  }

  // Validadores (para qualquer usuário autenticado)
  async listValidators() {
    return this.fetch('/validators.php')
  }

  async getUser(id) {
    return this.fetch(`/users.php?id=${id}`)
  }

  async updateUser(id, data) {
    return this.fetch(`/users.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Packages
  async listPackages(activeOnly = false) {
    return this.fetch(`/packages.php${activeOnly ? '?active=true' : ''}`)
  }

  async getPackage(id) {
    return this.fetch(`/packages.php?id=${id}`)
  }

  async createPackage(data) {
    return this.fetch('/packages.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePackage(id, data) {
    return this.fetch(`/packages.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePackage(id) {
    return this.fetch(`/packages.php?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Requests
  // test comment

    async getStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.fetch(query ? `/requests.php?action=stats&${query}` : `/requests.php?action=stats`)
  }
  async listRequests(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.fetch(query ? `/requests.php?${query}` : '/requests.php')
  }

  async getRequest(id) {
    return this.fetch(`/requests.php?id=${id}`)
  }

  async createRequest(data) {
    return this.fetch('/requests.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRequest(id, data) {
    return this.fetch(`/requests.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async validateRequest(id, data) {
    return this.fetch(`/requests.php?id=${id}&action=validate`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async correctRequest(id, data) {
    return this.fetch(`/requests.php?id=${id}&action=correct`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async revertRequest(id, reason) {
    return this.fetch(`/requests.php?id=${id}&action=revert`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    })
  }

  async bulkUpdateDate(ids, newDate) {
    return this.fetch('/requests.php?action=bulk-update-date', {
      method: 'PUT',
      body: JSON.stringify({ ids, new_date: newDate }),
    })
  }

  async deleteRequest(id) {
    return this.fetch(`/requests.php?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Upload
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    const token = getToken()
    
    const response = await fetch(`${API_URL}/upload.php`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload')
    }
    
    return data
  }

  // Goals
  async listGoals(month) {
    return this.fetch(`/goals.php${month ? '?month=' + month : ''}`)
  }

  async getGoalsProgress(month) {
    return this.fetch(`/goals.php?action=progress${month ? '&month=' + month : ''}`)
  }

  async createGoal(data) {
    return this.fetch('/goals.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGoal(id, data) {
    return this.fetch(`/goals.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteGoal(id) {
    return this.fetch(`/goals.php?id=${id}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
export default api
