// Use the same API base URL as the public API
const API_BASE_URL = 'https://charity-api.daira.website/api';
const API_ADMIN_BASE_URL = `${API_BASE_URL}/admin`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    data: data,
    headers: response.headers
  };
};

// Admin API functions
export const adminAPI = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(true),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(true),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const result = await handleResponse(response);
      
      if (result.ok && result.data) {
        const { access_token, refresh_token: newRefreshToken } = result.data;
        if (access_token) {
          localStorage.setItem('auth_token', access_token);
        }
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
      }

      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
};

// Export API base URLs for use in other files
export { API_BASE_URL, API_ADMIN_BASE_URL };

