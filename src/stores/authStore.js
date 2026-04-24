import { defineStore } from 'pinia'
import {
  loginApi,
  registerApi,
  getMeApi,
  logoutApi,
} from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || '',
    user: null,
    isLoading: false,
    isInitialized: false,
    error: '',
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userRole: (state) => state.user?.role?.name || '',
  },

  actions: {
    setToken(token) {
      this.token = token || ''

      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    },

    clearAuth() {
      this.token = ''
      this.user = null
      this.error = ''
      localStorage.removeItem('auth_token')
    },

    async login(credentials) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await loginApi(credentials)

        const token =
          response?.data?.token ||
          response?.sessionToken ||
          response?.token ||
          response?.accessToken ||
          ''

        if (!token) {
          throw new Error('No session token returned from login API.')
        }

        this.setToken(token)
        this.user = response?.data?.user || null

        await this.fetchMe()

        return { success: true }
      } catch (error) {
        this.clearAuth()
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Login failed.'

        return {
          success: false,
          message: this.error,
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(payload) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await registerApi(payload)

        const token =
          response?.data?.token ||
          response?.sessionToken ||
          response?.token ||
          response?.accessToken ||
          ''

        if (token) {
          this.setToken(token)
          this.user = response?.data?.user || null
          await this.fetchMe()
        }

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Registration failed.'

        return {
          success: false,
          message: this.error,
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchMe() {
      if (!this.token) {
        this.user = null
        this.isInitialized = true
        return null
      }

      try {
        const response = await getMeApi()
        this.user =
          response?.data?.user ||
          response?.user ||
          response?.data ||
          response ||
          null

        return this.user
      } catch (error) {
        this.clearAuth()
        throw error
      } finally {
        this.isInitialized = true
      }
    },

    async logout() {
      this.isLoading = true

      try {
        if (this.token) {
          await logoutApi()
        }
      } catch (error) {
        console.error('Logout request failed:', error)
      } finally {
        this.clearAuth()
        this.isLoading = false
      }
    },

    async initAuth() {
      if (this.isInitialized) return

      if (!this.token) {
        this.isInitialized = true
        return
      }

      this.isLoading = true

      try {
        await this.fetchMe()
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        this.isLoading = false
        this.isInitialized = true
      }
    },
  },
})