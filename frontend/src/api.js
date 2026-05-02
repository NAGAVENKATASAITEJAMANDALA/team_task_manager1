import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  // Auth
  login: (email, password) => axios.post(`${API_BASE}/api/auth/login`, { email, password }),
  signup: (data) => axios.post(`${API_BASE}/api/auth/signup`, data),
  me: () => axios.get(`${API_BASE}/api/auth/me`),

  // Projects
  getProjects: () => axios.get(`${API_BASE}/api/projects`),
  getProject: (id) => axios.get(`${API_BASE}/api/projects/${id}`),
  createProject: (data) => axios.post(`${API_BASE}/api/projects`, data),
  updateProject: (id, data) => axios.put(`${API_BASE}/api/projects/${id}`, data),
  deleteProject: (id) => axios.delete(`${API_BASE}/api/projects/${id}`),
  addMember: (projectId, userId, role) => axios.post(`${API_BASE}/api/projects/${projectId}/members`, { userId, role }),
  removeMember: (projectId, userId) => axios.delete(`${API_BASE}/api/projects/${projectId}/members/${userId}`),

  // Tasks
  getTasks: (params) => axios.get(`${API_BASE}/api/tasks`, { params }),
  getTask: (id) => axios.get(`${API_BASE}/api/tasks/${id}`),
  createTask: (data) => axios.post(`${API_BASE}/api/tasks`, data),
  updateTask: (id, data) => axios.put(`${API_BASE}/api/tasks/${id}`, data),
  deleteTask: (id) => axios.delete(`${API_BASE}/api/tasks/${id}`),

  // Users
  getUsers: () => axios.get(`${API_BASE}/api/users`),
  getDashboard: () => axios.get(`${API_BASE}/api/users/dashboard`),
};

export default api;
