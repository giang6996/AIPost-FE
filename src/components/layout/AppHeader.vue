<template>
  <header class="app-header">
    <div>
      <h1 class="title">WP AI Post</h1>
      <p class="subtitle">Desktop publishing workspace</p>
    </div>

    <div class="header-actions">
      <div class="user-info" v-if="authStore.user">
        <strong>{{ authStore.userName }}</strong>
        <span>{{ authStore.userEmail }}</span>
      </div>

      <button class="header-btn logout-btn" @click="handleLogout" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.title {
  margin: 0;
  font-size: 20px;
}

.subtitle {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
}

.user-info span {
  color: #6b7280;
}

.header-btn {
  border: 1px solid #d1d5db;
  background: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>