<template>
  <div>
    <h2>Login</h2>
    <p class="muted">Sign in to access your WordPress publishing workspace.</p>

    <form class="form" @submit.prevent="handleLogin">
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        class="input"
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        class="input"
      />

      <button type="submit" class="primary-btn" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p v-if="authStore.error" class="error-text">
      {{ authStore.error }}
    </p>

    <p class="footer-text">
      No account?
      <RouterLink to="/register">Register</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  if (result.success) {
    router.push('/app/dashboard')
  }
}
</script>

<style scoped>
.muted {
  color: #6b7280;
  margin-bottom: 18px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.primary-btn {
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.footer-text {
  margin-top: 16px;
  font-size: 14px;
}

.error-text {
  color: #dc2626;
  margin-top: 12px;
  font-size: 14px;
}
</style>