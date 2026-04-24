<template>
  <div class="admin-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Admin Users</h2>
          <p>Manage users, status, roles, and password resets.</p>
        </div>
      </div>

      <p v-if="adminStore.error" class="error-text">
        {{ adminStore.error }}
      </p>

      <div class="form-card">
        <h3>Create User</h3>

        <div class="form-grid">
          <input v-model="createForm.name" class="input" type="text" placeholder="Name" />
          <input v-model="createForm.email" class="input" type="email" placeholder="Email" />
          <input v-model="createForm.password" class="input" type="password" placeholder="Password" />

          <select v-model="createForm.roleName" class="input">
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>

          <select v-model="createForm.status" class="input">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="primary-btn" @click="handleCreateUser">
            Create User
          </button>
        </div>
      </div>
    </div>

    <div class="page-card">
      <h3>User List</h3>

      <div v-if="adminStore.isLoading" class="empty-state">
        Loading users...
      </div>

      <div v-else-if="!adminStore.users.length" class="empty-state">
        No users found.
      </div>

      <div v-else class="admin-list">
        <div
          v-for="user in adminStore.users"
          :key="user.id"
          class="admin-list-item"
        >
          <div class="admin-thumb">
            <div class="admin-thumb-placeholder">
              {{ getInitials(user.name) }}
            </div>
          </div>

          <div class="item-info">
            <div class="item-title-row">
              <h4>{{ user.name }}</h4>
              <div class="item-badges">
                <span class="badge role">
                  {{ user.role?.name || 'user' }}
                </span>
                <span
                  v-if="user.status"
                  class="badge status"
                  :class="`status-${normalizeStatus(user.status)}`"
                >
                  {{ formatStatus(user.status) }}
                </span>
              </div>
            </div>

            <div class="item-meta">
              <span>{{ user.email }}</span>
              <span>User ID: {{ user.id }}</span>
            </div>
          </div>

          <div class="item-actions">
            <select
              class="input small-input"
              :value="user.status"
              @change="handleStatusChange(user.id, $event.target.value)"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            <button class="secondary-btn" @click="openPasswordReset(user.id)">
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="passwordResetUserId" class="page-card">
      <h3>Reset User Password</h3>

      <div class="form-grid">
        <input
          v-model="passwordResetValue"
          class="input"
          type="password"
          placeholder="New password"
        />
      </div>

      <div class="form-actions">
        <button class="primary-btn" @click="handleResetPassword">
          Save New Password
        </button>
        <button class="ghost-btn" @click="closePasswordReset">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

const createForm = reactive({
  name: '',
  email: '',
  password: '',
  roleName: 'user',
  status: 'ACTIVE',
})

const passwordResetUserId = ref(null)
const passwordResetValue = ref('')

async function handleCreateUser() {
  const result = await adminStore.createUser({
    name: createForm.name,
    email: createForm.email,
    password: createForm.password,
    roleName: createForm.roleName,
    status: createForm.status,
  })

  if (result.success) {
    createForm.name = ''
    createForm.email = ''
    createForm.password = ''
    createForm.roleName = 'user'
    createForm.status = 'ACTIVE'
  }
}

async function handleStatusChange(userId, status) {
  await adminStore.updateUserStatus(userId, status)
}

function openPasswordReset(userId) {
  passwordResetUserId.value = userId
  passwordResetValue.value = ''
}

function closePasswordReset() {
  passwordResetUserId.value = null
  passwordResetValue.value = ''
}

async function handleResetPassword() {
  if (!passwordResetUserId.value || !passwordResetValue.value) return

  const result = await adminStore.resetUserPassword(
    passwordResetUserId.value,
    passwordResetValue.value
  )

  if (result.success) {
    closePasswordReset()
  }
}

onMounted(() => {
  adminStore.fetchUsers()
})

function getInitials(name) {
  if (!name) return 'US'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((word) => word[0]?.toUpperCase()).join('') || 'US'
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

.page-header h2,
.page-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  line-height: 1.3;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.form-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: #fafafa;
  margin-top: 12px !important;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
}

.small-input {
  min-width: 140px;
}

.form-actions,
.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
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

.error-text {
  color: #dc2626;
}

.empty-state {
  color: #6b7280;
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

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-suspended {
  background: #fef3c7;
  color: #92400e;
}

.badge.role {
  background: #eef2ff;
  color: #3730a3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .admin-list-item {
    grid-template-columns: 1fr;
  }

  .admin-thumb {
    width: 100%;
    height: 140px;
  }
}
</style>
