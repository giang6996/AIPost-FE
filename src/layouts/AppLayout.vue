<template>
  <div class="app-layout">
    <AppSidebar />

    <div class="app-main">
      <AppHeader />

      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppHeader from '../components/layout/AppHeader.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background: #f5f6f8;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>