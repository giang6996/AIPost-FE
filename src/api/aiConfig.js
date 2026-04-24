import apiClient from './client'

// Replace these paths with your real backend routes
export async function getOpenAiConfigApi() {
  const response = await apiClient.get('ai/config')
  return response.data
}

export async function saveOpenAiConfigApi(payload) {
  const response = await apiClient.put('ai/config', payload)
  return response.data
}

export async function deleteOpenAiConfigApi() {
  const response = await apiClient.delete('ai/config')
  return response.data
}