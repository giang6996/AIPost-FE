import apiClient from './client'

export async function loginApi(payload) {
  const response = await apiClient.post('/auth/login', payload)
  return response.data
}

export async function registerApi(payload) {
  const response = await apiClient.post('/auth/register', payload)
  return response.data
}

export async function getMeApi() {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export async function logoutApi() {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

export async function updateProfileApi(payload) {
  const response = await apiClient.put('/auth/profile', payload)
  return response.data
}

export async function changePasswordApi(payload) {
  const response = await apiClient.put('/auth/password', payload)
  return response.data
}