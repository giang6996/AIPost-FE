import apiClient from './client'

export async function getSiteCategoriesApi(siteId) {
  const response = await apiClient.get(`/sites/${siteId}/categories`)
  return response.data
}

export async function getSiteTagsApi(siteId) {
  const response = await apiClient.get(`/sites/${siteId}/tags`)
  return response.data
}

export async function getDraftCategoriesApi(draftId) {
  const response = await apiClient.get(`/drafts/${draftId}/categories`)
  return response.data
}

export async function createSiteCategoryApi(siteId, payload) {
  const response = await apiClient.post(`/sites/${siteId}/categories`, payload)
  return response.data
}

export async function createSiteTagApi(siteId, payload) {
  const response = await apiClient.post(`/sites/${siteId}/tags`, payload)
  return response.data
}

export async function replaceDraftCategoriesApi(draftId, payload) {
  const response = await apiClient.put(`/drafts/${draftId}/categories`, payload)
  return response.data
}

export async function getDraftTagsApi(draftId) {
  const response = await apiClient.get(`/drafts/${draftId}/tags`)
  return response.data
}

export async function replaceDraftTagsApi(draftId, payload) {
  const response = await apiClient.put(`/drafts/${draftId}/tags`, payload)
  return response.data
}