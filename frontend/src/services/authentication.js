import api from './api';
const API_URL = import.meta.env.VITE_API_BASE_URL; // for oAuth

export const authService = {
  // Login Call
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register Call
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Get Current User (Using the token)
  async getCurrentUser() {
    // axios does this by default already but i still left it in cuz AI recommended 
    const token = localStorage.getItem("token");
    if (!token) return null; // Still good to check before making the request

    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  loginWithGoogle() {
    window.location.href = `${API_URL}/api/auth/google`;
  },

  loginWithFacebook() {
    window.location.href = `${API_URL}/api/auth/facebook`;
  }
};