<template>
  <div class="admin-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Admin Sites</h2>
          <p>Inspect connected WordPress sites and delete them if required.</p>
        </div>
      </div>

      <p v-if="adminStore.error" class="error-text">
        {{ adminStore.error }}
      </p>

      <div v-if="adminStore.isLoading" class="empty-state">
        Loading sites...
      </div>

      <div v-else-if="!adminStore.sites.length" class="empty-state">
        No sites found.
      </div>

      <div v-else class="admin-list">
        <div
          v-for="site in adminStore.sites"
          :key="site.id"
          class="admin-list-item"
        >
          <div class="admin-thumb">
            <div class="admin-thumb-placeholder">
              {{ getInitials(site.siteName) }}
            </div>
          </div>

          <div class="item-info">
            <div class="item-title-row">
              <h4>{{ site.siteName }}</h4>
              <div class="item-badges">
                <span
                  v-if="site.status"
                  class="badge status"
                  :class="`status-${normalizeStatus(site.status)}`"
                >
                  {{ formatStatus(site.status) }}
                </span>
                <span v-if="site.snippetEnabled" class="badge info">Snippet Enabled</span>
              </div>
            </div>

            <div class="item-meta">
              <span>{{ site.siteUrl }}</span>
              <span>Owner: {{ site.user?.name || 'Unknown' }} ({{ site.user?.email || 'No email' }})</span>
              <span>Updated {{ formatDate(site.updatedAt) }}</span>
            </div>
          </div>

          <div class="item-actions">
            <button class="secondary-btn" @click="handleViewSite(site.id)">
              View Detail
            </button>
            <button class="danger-btn" @click="handleDeleteSite(site.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="adminStore.selectedSite" class="page-card">
      <h3>Site Detail</h3>
      <pre class="detail-box">{{ adminStore.selectedSite }}</pre>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

async function handleViewSite(siteId) {
  await adminStore.fetchSiteById(siteId)
}

async function handleDeleteSite(siteId) {
  const confirmed = window.confirm('Delete this site?')
  if (!confirmed) return
  await adminStore.deleteSite(siteId)
}

onMounted(() => {
  adminStore.fetchSites()
})

function getInitials(name) {
  if (!name) return 'WS'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0]?.toUpperCase()).join('') || 'WS'
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
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
}

.admin-thumb {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-thumb-placeholder {
  font-weight: 700;
  color: #6b7280;
  font-size: 18px;
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

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive,
.status-disabled {
  background: #fee2e2;
  color: #991b1b;
}

.badge.info {
  background: #e0f2fe;
  color: #075985;
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
