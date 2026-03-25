/**
 * API Service
 * Centralized API calls with error handling and token management
 */

// Use relative URL for development (goes through Vite proxy)
// For production, set VITE_API_URL environment variable
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders(includeAuth = true, isFormData = false) {
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.includeAuth !== false, isFormData),
        ...options.headers,
      },
    };

    // Remove Content-Type for FormData (browser sets it with boundary)
    if (isFormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);

      // Handle unauthorized
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      // Handle empty response
      const text = await response.text();
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });
  }

  async register(username, email, password, mobile) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, mobile }),
      includeAuth: false,
    });
  }

  // ==================== CLIENT CRUD ENDPOINTS ====================

  async getClients() {
    return this.request('/user/clients');
  }

  async getClient(id) {
    return this.request(`/user/clients/${id}`);
  }

  async createClient(formData) {
    // formData should be a FormData object for file upload
    return this.request('/user/clients', {
      method: 'POST',
      body: formData,
    });
  }

  async createClientJson(clientData) {
    // For JSON-based client creation (no file)
    return this.request('/user/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, formData) {
    // formData should be a FormData object for file upload
    return this.request(`/user/clients/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async updateClientJson(id, clientData) {
    // For JSON-based client update (no file change)
    return this.request(`/user/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id) {
    return this.request(`/user/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== VALIDATION ENDPOINTS ====================

  async checkEmailExists(email, excludeId = null) {
    const params = new URLSearchParams({ email });
    if (excludeId) params.append('excludeId', excludeId);
    return this.request(`/user/clients/check-email?${params}`);
  }

  async checkMobileExists(mobile, excludeId = null) {
    const params = new URLSearchParams({ mobile });
    if (excludeId) params.append('excludeId', excludeId);
    return this.request(`/user/clients/check-mobile?${params}`);
  }

  // ==================== LOGS ENDPOINTS ====================

  async getLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/user/logs?${queryString}`);
  }

  async getDistinctCompanies() {
    return this.request('/user/logs/companies');
  }

  async generateReview(clientId, reviewData) {
    return this.request(`/user/clients/${clientId}/generate-review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // ==================== CLIENT DASHBOARD ENDPOINTS ====================

  async getStats(email) {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request(`/client/stats${params}`);
  }

  async getClientHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/client/history?${queryString}`);
  }

  async getChatText(email) {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request(`/client/chat-text${params}`);
  }

  async updateChatText(email, chatText) {
    return this.request('/client/chat-text', {
      method: 'POST',
      body: JSON.stringify({ email, chatText }),
    });
  }

  // ==================== USER PROFILE ====================

  async getUserProfile() {
    return this.request('/user/profile');
  }

  // ==================== HELPER METHODS ====================

  buildPaginationParams(page, size, filters = {}) {
    return {
      page,
      size,
      ...filters,
    };
  }

  buildSearchParams(searchTerm, filters = {}) {
    return {
      search: searchTerm,
      ...filters,
    };
  }
}

export default new APIService();
