import { defineStore } from 'pinia'
import {
  getSitesApi,
  createSiteApi,
  updateSiteApi,
  deleteSiteApi,
  testSiteConnectionApi,
} from '@api/sites'

function normalizeSite(site) {
  return {
    id: site.id,
    userId: site.userId,
    name: site.siteName || '',
    baseUrl: site.siteUrl || '',
    username: site.wpUsername || '',
    status: site.status || '',
    snippetEnabled: !!site.snippetEnabled,
    createdAt: site.createdAt || null,
    updatedAt: site.updatedAt || null,

    // keep raw too in case needed later
    raw: site,
  }
}

export const useSiteStore = defineStore('sites', {
  state: () => ({
    sites: [],
    isLoading: false,
    error: '',
    connectionTestResult: null,
  }),

  getters: {
    siteCount: (state) => state.sites.length,
  },

  actions: {
    normalizeSiteList(response) {
      const rawList =
        response?.data?.sites ||
        response?.data ||
        response?.sites ||
        response ||
        []

      if (!Array.isArray(rawList)) return []

      return rawList.map(normalizeSite)
    },

    async fetchSites() {
      this.isLoading = true
      this.error = ''

      try {
        const response = await getSitesApi()
        this.sites = this.normalizeSiteList(response)
        return { success: true, data: this.sites }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch sites.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async createSite(payload) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await createSiteApi(payload)
        await this.fetchSites()

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create site.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateSite(id, payload) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await updateSiteApi(id, payload)
        await this.fetchSites()

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update site.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async deleteSite(id) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await deleteSiteApi(id)
        this.sites = this.sites.filter((site) => site.id !== id)

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete site.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async testConnection(payload) {
      this.isLoading = true
      this.error = ''
      this.connectionTestResult = null

      try {
        const response = await testSiteConnectionApi(payload)
        this.connectionTestResult = response

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Connection test failed.'
        this.connectionTestResult = null

        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    resetConnectionTest() {
      this.connectionTestResult = null
    },
  },
})
