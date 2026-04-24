import apiClient from './client'

export async function getDraftsApi() {
  const response = await apiClient.get('/drafts')
  return response.data
}

export async function getDraftByIdApi(id) {
  const response = await apiClient.get(`/drafts/${id}`)
  return response.data
}

export async function createDraftApi(payload) {
  const response = await apiClient.post('/drafts', payload)
  return response.data
}

export async function updateDraftApi(id, payload) {
  const response = await apiClient.put(`/drafts/${id}`, payload)
  return response.data
}

export async function deleteDraftApi(id) {
  const response = await apiClient.delete(`/drafts/${id}`)
  return response.data
}