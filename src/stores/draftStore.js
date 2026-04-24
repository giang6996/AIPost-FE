import { defineStore } from 'pinia'
import {
  getDraftsApi,
  getDraftByIdApi,
  createDraftApi,
  updateDraftApi,
  deleteDraftApi,
} from '../api/drafts'

function normalizeDraft(draft) {
  if (!draft || typeof draft !== 'object') {
    return {
      id: null,
      title: '',
      slug: '',
      excerpt: '',
      contentHtml: '',
      status: '',
      createdAt: null,
      updatedAt: null,
      raw: draft,
    }
  }

  return {
    id: draft.id ?? null,
    title: draft.title ?? draft.postTitle ?? draft.draftTitle ?? '',
    slug: draft.slug ?? draft.postSlug ?? '',
    excerpt: draft.excerpt ?? draft.summary ?? '',
    contentHtml:
      draft.contentHtml ??
      draft.content ??
      draft.htmlContent ??
      draft.bodyHtml ??
      '',
    status: draft.status ?? draft.draftStatus ?? '',
    featuredImageUrl: draft.featuredImageUrl ?? null,
    featuredImageAlt: draft.featuredImageAlt ?? null,
    featuredImageId: draft.featuredImageId ?? null,
    defaultSite: draft.defaultSite ?? null,
    seoMeta: draft.seoMeta ?? null,
    categories: Array.isArray(draft.categories) ? draft.categories : [],
    tags: Array.isArray(draft.tags) ? draft.tags : [],
    defaultSiteId: draft.defaultSiteId ?? null,
    createdAt: draft.createdAt ?? null,
    updatedAt: draft.updatedAt ?? null,
    raw: draft,
  }
}

export const useDraftStore = defineStore('drafts', {
  state: () => ({
    drafts: [],
    currentDraft: null,
    isLoading: false,
    error: '',
  }),

  getters: {
    draftCount: (state) => state.drafts.length,
    hasCurrentDraft: (state) => !!state.currentDraft?.id,
  },

  actions: {
    normalizeDraftList(response) {
      const rawList =
        response?.data?.drafts ||
        response?.data ||
        response?.drafts ||
        response ||
        []

      if (!Array.isArray(rawList)) return []

      return rawList.map(normalizeDraft)
    },

    normalizeSingleDraft(response) {
      const rawDraft =
        response?.data?.draft ||
        response?.data ||
        response?.draft ||
        response ||
        null

      return rawDraft ? normalizeDraft(rawDraft) : null
    },

    async fetchDrafts() {
      this.isLoading = true
      this.error = ''

      try {
        const response = await getDraftsApi()
        this.drafts = this.normalizeDraftList(response)
        return { success: true, data: this.drafts }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch drafts.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async fetchDraftById(id) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await getDraftByIdApi(id)
        this.currentDraft = this.normalizeSingleDraft(response)
        return { success: true, data: this.currentDraft }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch draft.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async createDraft(payload) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await createDraftApi(payload)
        const createdDraft = this.normalizeSingleDraft(response)

        await this.fetchDrafts()

        return {
          success: true,
          data: createdDraft,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create draft.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateDraft(id, payload) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await updateDraftApi(id, payload)
        const updatedDraft = this.normalizeSingleDraft(response)

        if (updatedDraft?.id) {
          this.currentDraft = updatedDraft
        }

        this.drafts = this.drafts.map((draft) =>
          draft.id === id ? { ...draft, ...updatedDraft } : draft
        )

        return {
          success: true,
          data: updatedDraft,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update draft.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async deleteDraft(id) {
      this.isLoading = true
      this.error = ''

      try {
        const response = await deleteDraftApi(id)
        this.drafts = this.drafts.filter((draft) => draft.id !== id)

        if (this.currentDraft?.id === id) {
          this.currentDraft = null
        }

        return {
          success: true,
          data: response,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete draft.'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    clearCurrentDraft() {
      this.currentDraft = null
    },
  },
})
