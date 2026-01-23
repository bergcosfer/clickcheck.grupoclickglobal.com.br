/**
 * Clickcheck - API Client
 */

const API_URL = 'https://clickcheck.grupoclickglobal.com.br/api'

class ApiClient {
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
    return this.fetch('/auth.php?action=logout')
  }

  // Users
  async listUsers() {
    return this.fetch('/users.php')
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
    
    const response = await fetch(`${API_URL}/upload.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload')
    }
    
    return data
  }
}

export const api = new ApiClient()
export default api
