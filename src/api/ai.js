import apiClient from './client'

export async function generateImageApi(payload) {
  const response = await apiClient.post('/ai/generate-image', payload)
  return response.data
}

export async function generatePostApi(payload) {
  const response = await apiClient.post('/ai/generate-post', payload)
  return response.data
}

export async function generateTitleApi(payload) {
  const response = await apiClient.post('/ai/generate-title', payload)
  return response.data
}

export async function generateSeoApi(payload) {
  const response = await apiClient.post('/ai/generate-seo', payload)
  return response.data
}

export async function getDraftSeoApi(draftId) {
  const response = await apiClient.get(`/drafts/${draftId}/seo`)
  return response.data
}

export async function updateDraftSeoApi(draftId, payload) {
  const response = await apiClient.put(`/drafts/${draftId}/seo`, payload)
  return response.data
}