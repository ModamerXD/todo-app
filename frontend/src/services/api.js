import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Todos
export const getTodos = (params) => api.get('/todos', { params });
export const getTodo = (id) => api.get(`/todos/${id}`);
export const createTodo = (data) => api.post('/todos', data);
export const updateTodo = (id, data) => api.patch(`/todos/${id}`, data);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);
export const getStats = () => api.get('/todos/stats');

export default api;
