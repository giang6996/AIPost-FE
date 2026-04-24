import apiClient from './client'

export async function publishDraftApi(draftId, payload) {
  const response = await apiClient.post(`/drafts/${draftId}/publish`, payload)
  return response.data
}

export async function deleteRemoteDraftPostApi(draftId, siteId, options = {}) {
  const params = new URLSearchParams({
    syncRemote: 'true',
  })

  if (options.force) {
    params.set('force', 'true')
  }

  const response = await apiClient.delete(
    `/drafts/${draftId}/sites/${siteId}?${params.toString()}`
  )
  return response.data
}