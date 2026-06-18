import { defineStore } from 'pinia'
import {
  adminListUsersApi,
  adminCreateUserApi,
  adminUpdateUserApi,
  adminUpdateUserStatusApi,
  adminResetUserPasswordApi,
  adminListDraftsApi,
  adminGetDraftApi,
  adminDeleteDraftApi,
  adminListSitesApi,
  adminGetSiteApi,
  adminDeleteSiteApi,
} from '@api/admin'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isLoading: false,
    error: '',

    users: [],
    drafts: [],
    sites: [],

    selectedDraft: null,
    selectedSite: null,
  }),

  actions: {
    clearError() {
      this.error = ''
    },

    async fetchUsers() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await adminListUsersApi()
        this.users = response?.data || response || []
        return { success: true, data: this.users }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load users.'
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },

    async createUser(payload) {
      this.error = ''
      try {
        const response = await adminCreateUserApi(payload)
        await this.fetchUsers()
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create user.'
        return { success: false }
      }
    },

    async updateUser(userId, payload) {
      this.error = ''
      try {
        const response = await adminUpdateUserApi(userId, payload)
        await this.fetchUsers()
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update user.'
        return { success: false }
      }
    },

    async updateUserStatus(userId, status) {
      this.error = ''
      try {
        const response = await adminUpdateUserStatusApi(userId, { status })
        await this.fetchUsers()
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update user status.'
        return { success: false }
      }
    },

    async resetUserPassword(userId, newPassword) {
      this.error = ''
      try {
        const response = await adminResetUserPasswordApi(userId, { newPassword })
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to reset user password.'
        return { success: false }
      }
    },

    async fetchDrafts() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await adminListDraftsApi()
        this.drafts = response?.data || response || []
        return { success: true, data: this.drafts }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load drafts.'
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },

    async fetchDraftById(draftId) {
      this.error = ''
      try {
        const response = await adminGetDraftApi(draftId)
        this.selectedDraft = response?.data || response || null
        return { success: true, data: this.selectedDraft }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load draft detail.'
        return { success: false }
      }
    },

    async deleteDraft(draftId) {
      this.error = ''
      try {
        const response = await adminDeleteDraftApi(draftId)
        await this.fetchDrafts()
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete draft.'
        return { success: false }
      }
    },

    async fetchSites() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await adminListSitesApi()
        this.sites = response?.data || response || []
        return { success: true, data: this.sites }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load sites.'
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },

    async fetchSiteById(siteId) {
      this.error = ''
      try {
        const response = await adminGetSiteApi(siteId)
        this.selectedSite = response?.data || response || null
        return { success: true, data: this.selectedSite }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load site detail.'
        return { success: false }
      }
    },

    async deleteSite(siteId) {
      this.error = ''
      try {
        const response = await adminDeleteSiteApi(siteId)
        await this.fetchSites()
        return { success: true, data: response?.data || response }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete site.'
        return { success: false }
      }
    },
  },
})
