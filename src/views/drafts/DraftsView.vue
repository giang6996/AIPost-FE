<template>
  <div class="drafts-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Drafts</h2>
          <p>Create a draft shell, then continue in the editor workspace.</p>
        </div>

        <button class="primary-btn" @click="toggleCreateForm">
          {{ showForm ? 'Close Form' : 'New Draft' }}
        </button>
      </div>

      <p v-if="draftStore.error" class="error-text">
        {{ draftStore.error }}
      </p>

      <div v-if="showForm" class="form-card">
        <h3>Create Draft</h3>

        <form class="draft-form" @submit.prevent="handleCreateDraft">
          <input
            v-model="form.title"
            type="text"
            placeholder="Draft title"
            class="input"
          />

          <input
            v-model="form.slug"
            type="text"
            placeholder="Slug (optional)"
            class="input"
          />

          <textarea
            v-model="form.excerpt"
            placeholder="Excerpt (optional)"
            class="textarea"
            rows="3"
          />

          <div class="form-actions">
            <button
              type="submit"
              class="primary-btn"
              :disabled="draftStore.isLoading || !form.title.trim()"
            >
              {{ draftStore.isLoading ? 'Creating...' : 'Create Draft' }}
            </button>

            <button
              type="button"
              class="ghost-btn"
              @click="resetForm"
              :disabled="draftStore.isLoading"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="page-card">
      <h3>Saved Drafts</h3>

      <div class="drafts-toolbar">
        <div class="toolbar-left">
          <input
            v-model="searchQuery"
            type="text"
            class="input search-input"
            placeholder="Search by title, slug, site, or keyword"
          />
        </div>

        <div class="toolbar-right">
          <select v-model="statusFilter" class="select small-select">
            <option value="all">All statuses</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ formatStatus(status) }}
            </option>
          </select>

          <select v-model="siteFilter" class="select small-select">
            <option value="all">All sites</option>
            <option value="none">No site</option>
            <option
              v-for="site in siteOptions"
              :key="site.id"
              :value="String(site.id)"
            >
              {{ site.siteName }}
            </option>
          </select>

          <select v-model="imageFilter" class="select small-select">
            <option value="all">All images</option>
            <option value="with">With featured image</option>
            <option value="without">No featured image</option>
          </select>

          <select v-model="seoFilter" class="select small-select">
            <option value="all">All SEO</option>
            <option value="with">Has SEO</option>
            <option value="without">No SEO</option>
          </select>

          <select v-model="sortKey" class="select small-select">
            <option value="updated_desc">Updated (newest)</option>
            <option value="updated_asc">Updated (oldest)</option>
            <option value="created_desc">Created (newest)</option>
            <option value="created_asc">Created (oldest)</option>
            <option value="title_asc">Title (A–Z)</option>
            <option value="title_desc">Title (Z–A)</option>
            <option value="status_asc">Status (A–Z)</option>
          </select>
        </div>
      </div>

      <div class="drafts-summary">
        Showing {{ filteredDrafts.length }} of {{ draftStore.drafts.length }} drafts
      </div>

      <div v-if="draftStore.isLoading && !draftStore.drafts.length" class="empty-state">
        Loading drafts...
      </div>

      <div v-else-if="!draftStore.drafts.length" class="empty-state">
        No drafts found.
      </div>

      <div v-else-if="!filteredDrafts.length" class="empty-state">
        No drafts match your filters.
      </div>

      <div v-else class="draft-list">
        <div
          v-for="draft in filteredDrafts"
          :key="draft.id"
          class="draft-item"
        >
          <div class="draft-thumb">
            <img
              v-if="draft.featuredImageUrl"
              :src="draft.featuredImageUrl"
              :alt="draft.featuredImageAlt || draft.title || 'Featured image'"
            />
            <div v-else class="draft-thumb-placeholder">
              {{ getInitials(draft.title) }}
            </div>
          </div>

          <div class="draft-info">
            <div class="draft-title-row">
              <h4>{{ draft.title || 'Untitled Draft' }}</h4>
              <div class="draft-badges">
                <span
                  v-if="draft.status"
                  class="badge status"
                  :class="`status-${normalizeStatus(draft.status)}`"
                >
                  {{ formatStatus(draft.status) }}
                </span>
                <span v-if="draft.defaultSite?.siteName" class="badge site">
                  {{ draft.defaultSite.siteName }}
                </span>
                <span v-if="draft.featuredImageUrl" class="badge image">Featured</span>
                <span v-if="draft.seoMeta" class="badge seo">SEO</span>
              </div>
            </div>

            <p class="draft-excerpt">
              {{ getExcerpt(draft) }}
            </p>

            <div class="draft-meta">
              <span>Updated {{ formatDate(draft.updatedAt) }}</span>
              <span v-if="draft.defaultSite?.siteUrl">
                Site: {{ draft.defaultSite.siteUrl }}
              </span>
              <span>
                Categories: {{ draft.categories?.length || 0 }} · Tags: {{ draft.tags?.length || 0 }}
              </span>
            </div>
          </div>

          <div class="draft-actions">
            <button class="secondary-btn" @click="openDraft(draft.id)">
              Open
            </button>
            <button class="danger-btn" @click="handleDeleteDraft(draft.id)">
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
import { useRouter } from 'vue-router'
import { useDraftStore } from '../../stores/draftStore'

const router = useRouter()
const draftStore = useDraftStore()

const showForm = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const siteFilter = ref('all')
const imageFilter = ref('all')
const seoFilter = ref('all')
const sortKey = ref('updated_desc')

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
})

const statusOptions = computed(() => {
  const statuses = new Set()
  draftStore.drafts.forEach((draft) => {
    if (draft.status) statuses.add(draft.status)
  })
  return Array.from(statuses)
})

const siteOptions = computed(() => {
  const map = new Map()
  draftStore.drafts.forEach((draft) => {
    const site = draft.defaultSite
    if (site?.id && !map.has(site.id)) {
      map.set(site.id, site)
    }
  })
  return Array.from(map.values())
})

const filteredDrafts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  let result = draftStore.drafts.filter((draft) => {
    if (statusFilter.value !== 'all' && draft.status !== statusFilter.value) {
      return false
    }

    if (siteFilter.value !== 'all') {
      const siteId = draft.defaultSite?.id ?? draft.defaultSiteId ?? null
      if (siteFilter.value === 'none' && siteId) return false
      if (siteFilter.value !== 'none' && String(siteId) !== siteFilter.value) {
        return false
      }
    }

    if (imageFilter.value === 'with' && !draft.featuredImageUrl) return false
    if (imageFilter.value === 'without' && draft.featuredImageUrl) return false

    if (seoFilter.value === 'with' && !draft.seoMeta) return false
    if (seoFilter.value === 'without' && draft.seoMeta) return false

    if (!query) return true

    const haystack = [
      draft.title,
      draft.slug,
      draft.excerpt,
      draft.defaultSite?.siteName,
      draft.defaultSite?.siteUrl,
      draft.seoMeta?.focusKeyword,
      stripHtml(draft.contentHtml),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })

  result = [...result].sort((a, b) => {
    switch (sortKey.value) {
      case 'updated_asc':
        return toDate(a.updatedAt) - toDate(b.updatedAt)
      case 'updated_desc':
        return toDate(b.updatedAt) - toDate(a.updatedAt)
      case 'created_asc':
        return toDate(a.createdAt) - toDate(b.createdAt)
      case 'created_desc':
        return toDate(b.createdAt) - toDate(a.createdAt)
      case 'title_desc':
        return (b.title || '').localeCompare(a.title || '')
      case 'title_asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'status_asc':
        return (a.status || '').localeCompare(b.status || '')
      default:
        return toDate(b.updatedAt) - toDate(a.updatedAt)
    }
  })

  return result
})

function toggleCreateForm() {
  showForm.value = !showForm.value
}

function resetForm() {
  form.title = ''
  form.slug = ''
  form.excerpt = ''
}

async function handleCreateDraft() {
  const payload = {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    contentHtml: '<p></p>',
  }

  const result = await draftStore.createDraft(payload)

  if (result.success) {
    resetForm()
    showForm.value = false

    if (result.data?.id) {
      router.push(`/app/drafts/${result.data.id}`)
    }
  }
}

function openDraft(id) {
  router.push(`/app/drafts/${id}`)
}

async function handleDeleteDraft(id) {
  const confirmed = window.confirm('Are you sure you want to delete this draft?')
  if (!confirmed) return

  await draftStore.deleteDraft(id)
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getExcerpt(draft) {
  if (draft.excerpt?.trim()) return draft.excerpt.trim()

  const text = stripHtml(draft.contentHtml || '')
  if (!text) return 'No excerpt available.'

  const maxLength = 180
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function getInitials(title) {
  if (!title) return 'DR'
  const words = title.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0]?.toUpperCase()).join('') || 'DR'
}

function formatStatus(status) {
  if (!status) return ''
  return status.toLowerCase().replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeStatus(status) {
  return status ? status.toLowerCase().replace(/_/g, '-') : 'unknown'
}

function toDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

onMounted(() => {
  draftStore.fetchDrafts()
})
</script>

<style scoped>
.drafts-page {
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

.draft-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input,
.textarea {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
}

.select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
  background: white;
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

.draft-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.drafts-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1.2fr) minmax(240px, 2fr);
  gap: 12px;
  align-items: center;
  margin: 14px 0 10px;
  padding: 12px;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.toolbar-left {
  width: 90%;
  min-width: 0;
}

.toolbar-right {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 100%;
  background: white;
}

.small-select {
  min-width: 160px;
}

.drafts-summary {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 14px;
}

.draft-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
}

.draft-thumb {
  width: 88px;
  height: 88px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}

.draft-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.draft-thumb-placeholder {
  font-weight: 700;
  color: #6b7280;
  font-size: 20px;
}

.draft-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.draft-info h4 {
  margin: 0;
  font-size: 16px;
}

.draft-excerpt {
  margin: 6px 0 8px;
  color: #4b5563;
  line-height: 1.5;
}

.draft-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7280;
  font-size: 12px;
}

.draft-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1;
  background: #f3f4f6;
  color: #4b5563;
}

.badge.status {
  font-weight: 600;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-published,
.status-publish {
  background: #dcfce7;
  color: #166534;
}

.status-scheduled {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge.site {
  background: #eef2ff;
  color: #3730a3;
}

.badge.image {
  background: #e0f2fe;
  color: #075985;
}

.badge.seo {
  background: #f3e8ff;
  color: #6b21a8;
}

.draft-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.error-text {
  color: #dc2626;
  margin-bottom: 14px;
}

.empty-state {
  color: #6b7280;
  padding: 16px 0;
}

@media (max-width: 900px) {
  .drafts-toolbar {
    grid-template-columns: 1fr;
  }

  .draft-item {
    grid-template-columns: 1fr;
  }

  .draft-thumb {
    width: 100%;
    height: 140px;
  }

  .draft-actions {
    justify-content: flex-start;
  }
}
</style>
