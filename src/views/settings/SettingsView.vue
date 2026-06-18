<template>
  <div class="settings-page">
    <div class="settings-card">
      <div class="card-header">
        <div>
          <h3>OpenAI Configuration</h3>
          <p class="muted-note">
            Manage the API key and default models used for AI features.
          </p>
        </div>

        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
      </div>

      <p v-if="openAiConfig.isLoading" class="muted-note">
        Loading configuration...
      </p>
      <p v-if="openAiConfig.message" class="success-text">
        {{ openAiConfig.message }}
      </p>
      <p v-if="openAiConfig.error" class="error-text">
        {{ openAiConfig.error }}
      </p>

      <div class="field-group">
        <label class="field-label">API Key</label>
        <input
          v-model="openAiConfig.apiKey"
          type="password"
          class="input"
          placeholder="Enter a new API key to save or replace"
        />
        <p class="muted-note">
          {{
            openAiConfig.hasApiKey
              ? 'A key is already saved. Leave this blank to keep the current key.'
              : 'No API key is currently saved. A key is required for first-time setup.'
          }}
        </p>
      </div>

      <div class="field-group">
        <label class="field-label">Default Text Model</label>
        <select v-model="openAiConfig.defaultTextModel" class="input select">
          <option value="" disabled>Select a text model</option>
          <option v-for="model in textModelOptions" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">Default Image Model</label>
        <select v-model="openAiConfig.defaultImageModel" class="input select">
          <option value="" disabled>Select an image model</option>
          <option v-for="model in imageModelOptions" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </div>

      <div class="field-group checkbox-row">
        <label class="field-label">Active</label>
        <input v-model="openAiConfig.isActive" type="checkbox" />
      </div>

      <div class="form-actions">
        <button
          class="primary-btn"
          @click="handleSaveOpenAiConfig"
          :disabled="openAiConfig.isSaving || openAiConfig.isLoading"
        >
          {{ openAiConfig.isSaving ? 'Saving...' : 'Save Configuration' }}
        </button>

        <button
          class="danger-btn"
          @click="handleDeleteOpenAiConfig"
          :disabled="openAiConfig.isDeleting || openAiConfig.isLoading || !openAiConfig.hasApiKey"
        >
          {{ openAiConfig.isDeleting ? 'Deleting...' : 'Delete Configuration' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import {
  getOpenAiConfigApi,
  saveOpenAiConfigApi,
  deleteOpenAiConfigApi,
} from '@api/aiConfig'

const openAiConfig = reactive({
  provider: 'openai',
  apiKey: '',
  defaultTextModel: '',
  defaultImageModel: '',
  isActive: true,
  hasApiKey: false,

  isLoading: false,
  isSaving: false,
  isDeleting: false,
  message: '',
  error: '',
})

const baseTextModels = [
  'gpt-5.4',
  'gpt-5.4-pro',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
]

const baseImageModels = [
  'gpt-image-2',
  'gpt-image-1.5',
  'gpt-image-1',
  'gpt-image-1-mini',
  'chatgpt-image-latest',
]

const textModelOptions = computed(() => {
  const current = openAiConfig.defaultTextModel?.trim()
  if (current && !baseTextModels.includes(current)) {
    return [current, ...baseTextModels]
  }
  return baseTextModels
})

const imageModelOptions = computed(() => {
  const current = openAiConfig.defaultImageModel?.trim()
  if (current && !baseImageModels.includes(current)) {
    return [current, ...baseImageModels]
  }
  return baseImageModels
})

const statusText = computed(() => {
  if (openAiConfig.isLoading) return 'Loading'
  if (!openAiConfig.hasApiKey) return 'Not configured'
  if (!openAiConfig.isActive) return 'Inactive'
  return 'Configured'
})

const statusClass = computed(() => {
  if (openAiConfig.isLoading) return 'status-loading'
  if (!openAiConfig.hasApiKey) return 'status-missing'
  if (!openAiConfig.isActive) return 'status-inactive'
  return 'status-ready'
})

async function loadOpenAiConfig() {
  openAiConfig.isLoading = true
  openAiConfig.error = ''
  openAiConfig.message = ''

  try {
    const response = await getOpenAiConfigApi()
    const data = response?.data || response || {}

    openAiConfig.provider = data.provider || 'openai'
    openAiConfig.defaultTextModel = data.defaultTextModel || ''
    openAiConfig.defaultImageModel = data.defaultImageModel || ''
    openAiConfig.isActive = !!data.isActive
    openAiConfig.hasApiKey = !!data.hasApiKey
    openAiConfig.apiKey = ''
  } catch (error) {
    openAiConfig.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load OpenAI config.'
  } finally {
    openAiConfig.isLoading = false
  }
}

async function handleSaveOpenAiConfig() {
  openAiConfig.isSaving = true
  openAiConfig.error = ''
  openAiConfig.message = ''

  try {
    if (!openAiConfig.hasApiKey && !openAiConfig.apiKey.trim()) {
      throw new Error('API key is required for first-time setup.')
    }

    const payload = {
      isActive: openAiConfig.isActive,
      defaultTextModel: openAiConfig.defaultTextModel.trim() || undefined,
      defaultImageModel: openAiConfig.defaultImageModel.trim() || undefined,
    }

    if (openAiConfig.apiKey.trim()) {
      payload.apiKey = openAiConfig.apiKey.trim()
    }

    const response = await saveOpenAiConfigApi(payload)
    const data = response?.data || response || {}

    openAiConfig.provider = data.provider || 'openai'
    openAiConfig.defaultTextModel = data.defaultTextModel || ''
    openAiConfig.defaultImageModel = data.defaultImageModel || ''
    openAiConfig.isActive = !!data.isActive
    openAiConfig.hasApiKey = !!data.hasApiKey
    openAiConfig.apiKey = ''
    openAiConfig.message = 'OpenAI configuration saved.'
  } catch (error) {
    openAiConfig.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save OpenAI config.'
  } finally {
    openAiConfig.isSaving = false
  }
}

async function handleDeleteOpenAiConfig() {
  const confirmed = window.confirm('Delete the saved OpenAI configuration?')
  if (!confirmed) return

  openAiConfig.isDeleting = true
  openAiConfig.error = ''
  openAiConfig.message = ''

  try {
    await deleteOpenAiConfigApi()

    openAiConfig.provider = 'openai'
    openAiConfig.apiKey = ''
    openAiConfig.defaultTextModel = ''
    openAiConfig.defaultImageModel = ''
    openAiConfig.isActive = false
    openAiConfig.hasApiKey = false
    openAiConfig.message = 'OpenAI configuration deleted.'
  } catch (error) {
    openAiConfig.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete OpenAI config.'
  } finally {
    openAiConfig.isDeleting = false
  }
}

onMounted(async () => {
  await loadOpenAiConfig()
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0 0 6px;
}

.status-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-ready {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fef3c7;
  color: #92400e;
}

.status-missing {
  background: #fee2e2;
  color: #991b1b;
}

.status-loading {
  background: #e5e7eb;
  color: #374151;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
  background: white;
}

.checkbox-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.primary-btn,
.danger-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.primary-btn {
  background: #2563eb;
  color: white;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.primary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.muted-note {
  color: #6b7280;
  margin: 0;
}

.success-text {
  color: #059669;
}

.error-text {
  color: #dc2626;
}
</style>
