import client from '../api/client';

export const userService = {
  // Authentication
  login: (credentials) =>
    client.post('/auth/login', credentials).then(r => r.data?.data || r.data),

  logout: () =>
    client.post('/auth/logout'),

  register: (userData) =>
    client.post('/auth/register', userData).then(r => r.data?.data || r.data),

  // User Management
  getUsers: () =>
    client.get('/users').then(r => r.data?.data || r.data),

  getUserById: (userId) =>
    client.get(`/users/${userId}`).then(r => r.data?.data || r.data),

  createUser: (userData) =>
    client.post('/users', userData).then(r => r.data?.data || r.data),

  updateUser: (userId, userData) =>
    client.put(`/users/${userId}`, userData).then(r => r.data?.data || r.data),

  deleteUser: (userId) =>
    client.delete(`/users/${userId}`).then(r => r.data?.data || r.data),

  // User Profile
  getProfile: () =>
    client.get('/users/profile').then(r => r.data?.data || r.data),

  updateProfile: (profileData) =>
    client.put('/users/profile', profileData).then(r => r.data?.data || r.data),

  // Password Management
  changePassword: (passwordData) =>
    client.post('/users/change-password', passwordData).then(r => r.data?.data || r.data),

  resetPassword: (resetData) =>
    client.post('/users/reset-password', resetData).then(r => r.data?.data || r.data),

  // Role Management
  getUserRoles: () =>
    client.get('/users/roles').then(r => r.data?.data || r.data),

  assignRole: (userId, roleId) =>
    client.post(`/users/${userId}/roles/${roleId}`).then(r => r.data?.data || r.data),

  // User Statistics
  getUserStats: (userId) =>
    client.get(`/users/${userId}/stats`).then(r => r.data?.data || r.data),

  // Activity Log
  getUserActivity: (userId) =>
    client.get(`/users/${userId}/activity`).then(r => r.data?.data || r.data)
};
