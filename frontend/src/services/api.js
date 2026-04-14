import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // You might need to run: npm install uuid

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get or create a guest session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest_${uuidv4()}`; // Generates a unique ID
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

// Interceptor: Automatically add Token OR Session ID to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    // If logged in, send the token
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If guest, send the session ID
    config.headers['x-session-id'] = getSessionId();
  }
  
  return config;
});

export default api;