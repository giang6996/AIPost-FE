import apiClient from './client'

// Users
export async function adminListUsersApi() {
  const response = await apiClient.get('/admin/users')
  return response.data
}

export async function adminCreateUserApi(payload) {
  const response = await apiClient.post('/admin/users', payload)
  return response.data
}

export async function adminUpdateUserApi(userId, payload) {
  const response = await apiClient.put(`/admin/users/${userId}`, payload)
  return response.data
}

export async function adminUpdateUserStatusApi(userId, payload) {
  const response = await apiClient.patch(`/admin/users/${userId}/status`, payload)
  return response.data
}

export async function adminResetUserPasswordApi(userId, payload) {
  const response = await apiClient.put(`/admin/users/${userId}/password`, payload)
  return response.data
}

// Drafts
export async function adminListDraftsApi() {
  const response = await apiClient.get('/admin/drafts')
  return response.data
}

export async function adminGetDraftApi(draftId) {
  const response = await apiClient.get(`/admin/drafts/${draftId}`)
  return response.data
}

export async function adminDeleteDraftApi(draftId) {
  const response = await apiClient.delete(`/admin/drafts/${draftId}`)
  return response.data
}

// Sites
export async function adminListSitesApi() {
  const response = await apiClient.get('/admin/sites')
  return response.data
}

export async function adminGetSiteApi(siteId) {
  const response = await apiClient.get(`/admin/sites/${siteId}`)
  return response.data
}

export async function adminDeleteSiteApi(siteId) {
  const response = await apiClient.delete(`/admin/sites/${siteId}`)
  return response.data
}