import apiClient from './client'

export async function getSitesApi() {
  const response = await apiClient.get('/sites')
  return response.data
}

export async function createSiteApi(payload) {
  const response = await apiClient.post('/sites', payload)
  return response.data
}

export async function updateSiteApi(id, payload) {
  const response = await apiClient.put(`/sites/${id}`, payload)
  return response.data
}

export async function deleteSiteApi(id) {
  const response = await apiClient.delete(`/sites/${id}`)
  return response.data
}

export async function testSiteConnectionApi(payload) {
  const response = await apiClient.post('/sites/test-connection', payload)
  return response.data
}