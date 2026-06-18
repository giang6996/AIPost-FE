<template>
  <div class="sites-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Sites</h2>
          <p>Manage your connected WordPress sites.</p>
        </div>

        <button class="primary-btn" @click="startCreateMode">
          Add Site
        </button>
      </div>

      <p v-if="siteStore.error" class="error-text">
        {{ siteStore.error }}
      </p>

      <div v-if="showForm" class="form-card">
        <h3>{{ editingSiteId ? 'Edit Site' : 'Create Site' }}</h3>

        <form class="site-form" @submit.prevent="handleSubmit">
          <input
            v-model="form.name"
            type="text"
            placeholder="Site name"
            class="input"
          />

          <input
            v-model="form.baseUrl"
            type="text"
            placeholder="Base URL (e.g. https://example.com)"
            class="input"
          />

          <input
            v-model="form.username"
            type="text"
            placeholder="WordPress username"
            class="input"
          />

          <input
            v-model="form.appPassword"
            type="password"
            placeholder="Application password"
            class="input"
          />

          <div class="form-actions">
            <button
              type="button"
              class="secondary-btn"
              @click="handleTestConnection"
              :disabled="siteStore.isLoading"
            >
              Test Connection
            </button>

            <button
              type="submit"
              class="primary-btn"
              :disabled="siteStore.isLoading"
            >
              {{ siteStore.isLoading
                ? 'Saving...'
                : editingSiteId
                  ? 'Update Site'
                  : 'Create Site' }}
            </button>

            <button
              type="button"
              class="ghost-btn"
              @click="cancelForm"
              :disabled="siteStore.isLoading"
            >
              Cancel
            </button>
          </div>
        </form>

        <div v-if="connectionMessage" class="test-result">
          {{ connectionMessage }}
        </div>
      </div>
    </div>

    <div class="page-card">
      <h3>Saved Sites</h3>

      <div v-if="siteStore.isLoading && !siteStore.sites.length" class="empty-state">
        Loading sites...
      </div>

      <div v-else-if="!siteStore.sites.length" class="empty-state">
        No sites connected yet.
      </div>

      <div v-else class="site-list">
        <div
          v-for="site in siteStore.sites"
          :key="site.id"
          class="site-item"
        >
          <div class="site-info">
            <h4>{{ site.name || 'Unnamed Site' }}</h4>
            <p>{{ site.baseUrl || site.url || 'No URL available' }}</p>
            <small v-if="site.username">User: {{ site.username }}</small>
          </div>

          <div class="site-actions">
            <button class="secondary-btn" @click="startEditMode(site)">
              Edit
            </button>
            <button class="danger-btn" @click="handleDelete(site.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useSiteStore } from '@stores/siteStore'

const siteStore = useSiteStore()

const showForm = ref(false)
const editingSiteId = ref(null)

const form = reactive({
  name: '',
  baseUrl: '',
  username: '',
  appPassword: '',
})

const connectionMessage = computed(() => {
  if (!siteStore.connectionTestResult) return ''

  const result = siteStore.connectionTestResult

  if (result?.success === true) {
    return result?.message || 'Connection successful.'
  }

  return result?.message || 'Connection test completed.'
})

function resetForm() {
  form.name = ''
  form.baseUrl = ''
  form.username = ''
  form.appPassword = ''
  editingSiteId.value = null
  siteStore.resetConnectionTest()
}

function startCreateMode() {
  resetForm()
  showForm.value = true
}

function startEditMode(site) {
  form.name = site.name || ''
  form.baseUrl = site.baseUrl || site.url || ''
  form.username = site.username || ''
  form.appPassword = ''
  editingSiteId.value = site.id
  showForm.value = true
  siteStore.resetConnectionTest()
}

function cancelForm() {
  resetForm()
  showForm.value = false
}

async function handleSubmit() {
  const payload = {
    siteName: form.name,
    siteUrl: form.baseUrl,
    wpUsername: form.username,
    wpApplicationPassword: form.appPassword,
    snippetEnabled: true,
  }

  let result

  if (editingSiteId.value) {
    result = await siteStore.updateSite(editingSiteId.value, payload)
  } else {
    result = await siteStore.createSite(payload)
  }

  if (result.success) {
    cancelForm()
  }
}

async function handleDelete(siteId) {
  const confirmed = window.confirm('Are you sure you want to delete this site?')
  if (!confirmed) return

  await siteStore.deleteSite(siteId)
}

async function handleTestConnection() {
  await siteStore.testConnection({
    siteUrl: form.baseUrl,
    wpUsername: form.username,
    wpApplicationPassword: form.appPassword,
  })
}

onMounted(() => {
  siteStore.fetchSites()
})
</script>

<style scoped>
.sites-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.form-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  background: #fafafa;
}

.site-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.ghost-btn,
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

.secondary-btn {
  background: #e5e7eb;
  color: #111827;
}

.ghost-btn {
  background: transparent;
  border: 1px solid #d1d5db;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.site-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.site-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.site-info h4 {
  margin: 0 0 6px;
}

.site-info p {
  margin: 0 0 4px;
  color: #4b5563;
}

.site-info small {
  color: #6b7280;
}

.site-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.error-text {
  color: #dc2626;
  margin-bottom: 14px;
}

.empty-state {
  color: #6b7280;
  padding: 16px 0;
}

.test-result {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #eef6ff;
  color: #1d4ed8;
}
</style>