import apiClient from './client'

export async function uploadDraftImageApi(draftId, file, payload = {}) {
  const formData = new FormData()
  formData.append('image', file)

  if (payload.altText) {
    formData.append('altText', payload.altText)
  }

  if (payload.caption) {
    formData.append('caption', payload.caption)
  }

  if (payload.positionMarker) {
    formData.append('positionMarker', payload.positionMarker)
  }

  const response = await apiClient.post(
    `/drafts/${draftId}/images/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

export async function getDraftImagesApi(draftId) {
  const response = await apiClient.get(`/drafts/${draftId}/images`)
  return response.data
}

export async function saveGeneratedDraftImageApi(draftId, payload) {
  const response = await apiClient.post(
    `/drafts/${draftId}/images/save-generated`,
    payload
  )
  return response.data
}

export async function uploadDraftImageToWpApi(draftId, imageId, payload = {}) {
  const response = await apiClient.post(
    `/drafts/${draftId}/images/${imageId}/upload-to-wp`,
    payload
  )
  return response.data
}

export async function insertDraftImageApi(draftId, imageId, payload) {
  const response = await apiClient.post(
    `/drafts/${draftId}/images/${imageId}/insert`,
    payload
  )
  return response.data
}

export async function setFeaturedDraftImageApi(draftId, imageId, payload = {}) {
  const response = await apiClient.post(
    `/drafts/${draftId}/images/${imageId}/set-featured`,
    payload
  )
  return response.data
}

export async function updateDraftImageApi(draftId, imageId, payload) {
  const response = await apiClient.put(
    `/drafts/${draftId}/images/${imageId}`,
    payload
  )
  return response.data
}

export async function deleteDraftImageApi(draftId, imageId) {
  const response = await apiClient.delete(
    `/drafts/${draftId}/images/${imageId}`
  )
  return response.data
}