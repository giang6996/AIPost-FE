<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-brand">
        <h1>WP AI Post</h1>
        <p>AI-assisted WordPress publishing web app</p>
      </div>

      <div class="auth-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f3f5f7;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.auth-brand {
  margin-bottom: 24px;
  text-align: center;
}

.auth-brand h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.auth-brand p {
  margin: 0;
  color: #6b7280;
}

.auth-content {
  margin-top: 12px;
}
</style>
