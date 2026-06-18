<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <h2>WP AI Post</h2>
      <span>Made by Jebdev</span>
    </div>

    <div class="sidebar-user" v-if="authStore.user">
      <strong>{{ authStore.userName }}</strong>
      <span>{{ authStore.userEmail }}</span>
      <small v-if="authStore.userRole">{{ authStore.userRole }}</small>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/app/dashboard" class="nav-link">Dashboard</RouterLink>
      <RouterLink to="/app/sites" class="nav-link">Sites</RouterLink>
      <RouterLink to="/app/drafts" class="nav-link">Drafts</RouterLink>
      <RouterLink to="/app/settings" class="nav-link">Settings</RouterLink>
      <RouterLink to="/app/profile" class="nav-link">Profile</RouterLink>



      <div v-if="authStore.user?.role?.name === 'admin'">
        <p class="nav-section-title">Admin</p>
        <div class="nav-section">
          <RouterLink to="/app/admin/users" class="nav-link">
            Users
          </RouterLink>

          <RouterLink to="/app/admin/drafts" class="nav-link">
            Drafts
          </RouterLink>

          <RouterLink to="/app/admin/sites" class="nav-link">
            Sites
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '@stores/authStore'

const authStore = useAuthStore()

</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  border-right: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
}

.sidebar-brand {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.sidebar-brand h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.5px;
}

.sidebar-brand span {
  font-size: 13px;
  color: #9ca3af;
}

.sidebar-user {
  margin-bottom: 24px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-user span,
.sidebar-user small {
  color: #d1d5db;
  font-size: 12px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-link {
  color: #d1d5db;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 12px;
  transition: 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-section{
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.router-link-active {
  background: rgba(59, 130, 246, 0.18);
  color: white;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.35);
}

.nav-section-title {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #94a3b8;
  margin: 16px 0 6px;
}

.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: #60a5fa;
}
</style>
