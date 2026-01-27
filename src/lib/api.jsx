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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
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
    window.location.href = `${API_URL}/auth.php?action=login`
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
  async listRequests() {
    return this.fetch('/requests.php')
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
