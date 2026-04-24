<template>
  <div class="admin-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Admin Drafts</h2>
          <p>Review draft ownership, site, and delete drafts when needed.</p>
        </div>
      </div>

      <p v-if="adminStore.error" class="error-text">
        {{ adminStore.error }}
      </p>

      <div v-if="adminStore.isLoading" class="empty-state">
        Loading drafts...
      </div>

      <div v-else-if="!adminStore.drafts.length" class="empty-state">
        No drafts found.
      </div>

      <div v-else class="admin-list">
        <div
          v-for="draft in adminStore.drafts"
          :key="draft.id"
          class="admin-list-item"
        >
          <div class="admin-thumb">
            <img
              v-if="draft.featuredImageUrl"
              :src="draft.featuredImageUrl"
              :alt="draft.featuredImageAlt || draft.title || 'Featured image'"
            />
            <div v-else class="admin-thumb-placeholder">
              {{ getInitials(draft.title) }}
            </div>
          </div>

          <div class="item-info">
            <div class="item-title-row">
              <h4>{{ draft.title || 'Untitled Draft' }}</h4>
              <div class="item-badges">
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
              </div>
            </div>

            <div class="item-meta">
              <span>Owner: {{ draft.user?.name || 'Unknown' }} ({{ draft.user?.email || 'No email' }})</span>
              <span>Site: {{ draft.defaultSite?.siteName || 'No site' }}</span>
              <span>Updated {{ formatDate(draft.updatedAt) }}</span>
            </div>
          </div>

          <div class="item-actions">
            <button class="secondary-btn" @click="handleViewDraft(draft.id)">
              View Detail
            </button>
            <button class="danger-btn" @click="handleDeleteDraft(draft.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="adminStore.selectedDraft" class="page-card">
      <h3>Draft Detail</h3>
      <pre class="detail-box">{{ adminStore.selectedDraft }}</pre>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

async function handleViewDraft(draftId) {
  await adminStore.fetchDraftById(draftId)
}

async function handleDeleteDraft(draftId) {
  const confirmed = window.confirm('Delete this draft?')
  if (!confirmed) return
  await adminStore.deleteDraft(draftId)
}

onMounted(() => {
  adminStore.fetchDrafts()
})

function getInitials(title) {
  if (!title) return 'DR'
  const words = title.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0]?.toUpperCase()).join('') || 'DR'
}

function formatStatus(status) {
  if (!status) return ''
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeStatus(status) {
  return status ? status.toLowerCase().replace(/_/g, '-') : 'unknown'
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
</script>

<style scoped>
.admin-page {
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
  margin-bottom: 14px;
}

.page-header h2 {
  margin: 0 0 8px;
  line-height: 1.3;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.admin-list-item {
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

.admin-thumb {
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

.admin-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-thumb-placeholder {
  font-weight: 700;
  color: #6b7280;
  font-size: 20px;
}

.item-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.item-info h4 {
  margin: 0;
  font-size: 16px;
  line-height: 1.35;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #6b7280;
  font-size: 12px;
  margin-top: 6px;
}

.item-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

.secondary-btn,
.danger-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.secondary-btn {
  background: #e5e7eb;
  color: #111827;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.detail-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 12px;
}

.error-text {
  color: #dc2626;
}

.empty-state {
  color: #6b7280;
}

@media (max-width: 900px) {
  .admin-list-item {
    grid-template-columns: 1fr;
  }

  .admin-thumb {
    width: 100%;
    height: 140px;
  }
}
</style>
