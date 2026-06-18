<template>
  <div class="draft-editor-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2>Draft Editor</h2>
          <p>Edit content here, then continue through the workflow sections below.</p>
        </div>

        <div class="header-actions">
          <div class="save-status">
            <span v-if="saveState.isSaving">Saving...</span>
            <span v-else-if="saveState.error" class="error-text">Save failed</span>
            <span v-else-if="saveState.hasUnsavedChanges">Unsaved changes</span>
            <span v-else-if="saveState.lastSavedAt">
              Saved {{ formatDate(saveState.lastSavedAt) }}
            </span>
          </div>
          <button class="ghost-btn" @click="goBack">
            Back to Drafts
          </button>
          <button class="danger-btn" @click="handleDelete" :disabled="draftStore.isLoading || !draftId">
            Delete
          </button>
          <button class="primary-btn" @click="handleSave" :disabled="draftStore.isLoading || !draftId">
            {{ draftStore.isLoading ? 'Saving...' : 'Save Draft' }}
          </button>
        </div>
      </div>

      <p v-if="draftStore.error" class="error-text">
        {{ draftStore.error }}
      </p>

      <div v-if="isInitialLoading" class="empty-state">
        Loading draft...
      </div>

      <div v-else-if="!draftId" class="empty-state">
        Invalid draft id.
      </div>

      <template v-else>
        <div class="editor-layout">
          <div class="editor-main">
            <div class="field-group">
              <label class="field-label">Title</label>
              <input v-model="form.title" type="text" class="input" placeholder="Draft title" />
            </div>

            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Slug</label>
                <input v-model="form.slug" type="text" class="input" placeholder="draft-slug" />
              </div>

              <div class="field-group">
                <label class="field-label">Status</label>
                <input :value="currentDraft?.status || 'N/A'" type="text" class="input" disabled />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Excerpt</label>
              <textarea v-model="form.excerpt" class="textarea" rows="4" placeholder="Short summary or excerpt" />
            </div>

            <div class="editor-tabs">
              <button class="tab-btn" :class="{ active: activeTab === 'visual' }" @click="activeTab = 'visual'">
                Visual
              </button>
              <button class="tab-btn" :class="{ active: activeTab === 'html' }" @click="activeTab = 'html'">
                HTML
              </button>
              <button class="tab-btn" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
                Preview
              </button>
            </div>

            <div v-if="activeTab === 'visual'" class="editor-panel">
              <Editor v-model="form.contentHtml" :api-key="tinyMceApiKey" :init="tinyMceConfig" />
            </div>

            <div v-else-if="activeTab === 'html'" class="editor-panel">
              <textarea v-model="form.contentHtml" class="textarea content-area" style="width: 98%;" rows="30"
                placeholder="<p>Write HTML here...</p>" />
            </div>

            <div v-else class="editor-panel preview-panel">
              <div class="preview-content" v-html="form.contentHtml"></div>
            </div>
          </div>

          <aside class="editor-side">
            <div class="side-card">
              <h3>Site</h3>

              <select v-model="draftSiteId" class="select">
                <option value="">No site assigned</option>
                <option v-for="site in siteStore.sites" :key="site.id" :value="String(site.id)">
                  {{ site.name }} — {{ site.baseUrl }}
                </option>
              </select>

              <div class="side-note" v-if="draftSite">
                <strong>{{ draftSite.name }}</strong><br />
                {{ draftSite.baseUrl }}
              </div>

              <div class="side-note" v-else>
                This draft has no assigned site yet.
              </div>
            </div>

            <div class="side-card">
              <h3>Draft Info</h3>
              <p><strong>ID:</strong> {{ draftId }}</p>
              <p><strong>Created:</strong> {{ formatDate(currentDraft?.createdAt) }}</p>
              <p><strong>Updated:</strong> {{ formatDate(currentDraft?.updatedAt) }}</p>
            </div>

            <div class="side-card">
              <h3>Quick Actions</h3>
              <div class="panel-actions">
                <button class="panel-btn secondary-btn">Preview Post</button>
                <button class="panel-btn success-btn">Publish / Update</button>
              </div>
            </div>
          </aside>
        </div>

        <div class="workflow-sections">

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('taxonomy')">
              <span>Categories & Tags</span>
              <span>{{ openSections.taxonomy ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.taxonomy" class="workflow-body">
              <div class="workflow-form">
                <p v-if="taxonomyState.error" class="error-text">
                  {{ taxonomyState.error }}
                </p>
                <p v-if="taxonomyState.message" class="success-text">
                  {{ taxonomyState.message }}
                </p>

                <p v-if="!draftSite" class="muted-note">
                  Select a site to load categories and tags.
                </p>

                <div v-else-if="taxonomyState.isLoading" class="empty-state">
                  Loading categories and tags...
                </div>

                <template v-else>
                  <div class="source-toggle taxonomy-toggle">
                    <button type="button" class="source-btn" :class="{ active: taxonomyTab === 'assign' }"
                      @click="taxonomyTab = 'assign'">
                      Assign to Draft
                    </button>
                    <button type="button" class="source-btn" :class="{ active: taxonomyTab === 'create' }"
                      @click="taxonomyTab = 'create'">
                      Create New
                    </button>
                  </div>

                  <div v-if="taxonomyTab === 'assign'" class="taxonomy-panel">
                    <div class="taxonomy-panel-header">
                      <h4>Assign to Draft</h4>
                      <p class="muted-note">Pick existing categories and tags for this draft.</p>
                    </div>

                    <div class="taxonomy-block">
                      <label class="field-label">Categories</label>

                      <div class="taxonomy-picker-row">
                        <select v-model="taxonomyPicker.categoryToAdd" class="select">
                          <option value="">Select a category</option>
                          <option v-for="category in availableCategoryOptions" :key="category.id" :value="category.id">
                            {{ category.name }}
                          </option>
                        </select>

                        <button class="secondary-btn" type="button" @click="addSelectedCategory"
                          :disabled="!taxonomyPicker.categoryToAdd">
                          Add
                        </button>
                      </div>

                      <div v-if="taxonomyState.selectedCategoryIds.length" class="selected-term-list">
                        <div v-for="id in taxonomyState.selectedCategoryIds" :key="`cat-${id}`"
                          class="selected-term-item">
                          <span>{{ getCategoryNameById(id) }}</span>
                          <button type="button" class="ghost-btn small-btn" @click="removeSelectedCategory(id)">
                            Remove
                          </button>
                        </div>
                      </div>

                      <div v-else class="muted-note">
                        No categories selected.
                      </div>
                    </div>

                    <div class="taxonomy-block">
                      <label class="field-label">Tags</label>

                      <div class="taxonomy-picker-row">
                        <select v-model="taxonomyPicker.tagToAdd" class="select">
                          <option value="">Select a tag</option>
                          <option v-for="tag in availableTagOptions" :key="tag.id" :value="tag.id">
                            {{ tag.name }}
                          </option>
                        </select>

                        <button class="secondary-btn" type="button" @click="addSelectedTag"
                          :disabled="!taxonomyPicker.tagToAdd">
                          Add
                        </button>
                      </div>

                      <div v-if="taxonomyState.selectedTagIds.length" class="selected-term-list">
                        <div v-for="id in taxonomyState.selectedTagIds" :key="`tag-${id}`" class="selected-term-item">
                          <span>{{ getTagNameById(id) }}</span>
                          <button type="button" class="ghost-btn small-btn" @click="removeSelectedTag(id)">
                            Remove
                          </button>
                        </div>
                      </div>

                      <div v-else class="muted-note">
                        No tags selected.
                      </div>
                    </div>

                    <div class="workflow-actions">
                      <button class="primary-btn" @click="handleSaveTaxonomy"
                        :disabled="taxonomyState.isSaving || !draftSite">
                        {{ taxonomyState.isSaving ? 'Saving...' : 'Save Categories & Tags' }}
                      </button>
                    </div>
                  </div>

                  <div v-else class="taxonomy-panel taxonomy-panel-muted">
                    <div class="taxonomy-panel-header">
                      <h4>Create New</h4>
                      <p class="muted-note">Add new categories or tags to the connected site.</p>
                    </div>

                    <div class="taxonomy-create-grid">
                      <div class="taxonomy-create-card">
                        <h4>Create Category</h4>

                        <div class="field-group">
                          <label class="field-label">Name</label>
                          <input v-model="taxonomyCreate.category.name" type="text" class="input"
                            placeholder="Category name" />
                        </div>

                        <div class="field-group">
                          <label class="field-label">Slug</label>
                          <input v-model="taxonomyCreate.category.slug" type="text" class="input"
                            placeholder="optional-category-slug" />
                        </div>

                        <div class="field-group">
                          <label class="field-label">Description</label>
                          <textarea v-model="taxonomyCreate.category.description" class="textarea" rows="3"
                            placeholder="Optional description" />
                        </div>

                        <div class="workflow-actions">
                          <button class="secondary-btn" type="button" @click="handleCreateCategory"
                            :disabled="taxonomyCreate.category.isSubmitting || !draftSite">
                            {{ taxonomyCreate.category.isSubmitting ? 'Creating...' : 'Create Category' }}
                          </button>
                        </div>

                        <p v-if="taxonomyCreate.category.message" class="success-text">
                          {{ taxonomyCreate.category.message }}
                        </p>
                        <p v-if="taxonomyCreate.category.error" class="error-text">
                          {{ taxonomyCreate.category.error }}
                        </p>
                      </div>

                      <div class="taxonomy-create-card">
                        <h4>Create Tag</h4>

                        <div class="field-group">
                          <label class="field-label">Name</label>
                          <input v-model="taxonomyCreate.tag.name" type="text" class="input" placeholder="Tag name" />
                        </div>

                        <div class="field-group">
                          <label class="field-label">Slug</label>
                          <input v-model="taxonomyCreate.tag.slug" type="text" class="input"
                            placeholder="optional-tag-slug" />
                        </div>

                        <div class="field-group">
                          <label class="field-label">Description</label>
                          <textarea v-model="taxonomyCreate.tag.description" class="textarea" rows="3"
                            placeholder="Optional description" />
                        </div>

                        <div class="workflow-actions">
                          <button class="secondary-btn" type="button" @click="handleCreateTag"
                            :disabled="taxonomyCreate.tag.isSubmitting || !draftSite">
                            {{ taxonomyCreate.tag.isSubmitting ? 'Creating...' : 'Create Tag' }}
                          </button>
                        </div>

                        <p v-if="taxonomyCreate.tag.message" class="success-text">
                          {{ taxonomyCreate.tag.message }}
                        </p>
                        <p v-if="taxonomyCreate.tag.error" class="error-text">
                          {{ taxonomyCreate.tag.error }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('aiContent')">
              <span>AI Content</span>
              <span>{{ openSections.aiContent ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.aiContent" class="workflow-body">
              <div class="workflow-form">
                <div class="field-group">
                  <label class="field-label">Prompt</label>
                  <textarea v-model="aiContent.prompt" class="textarea" rows="4"
                    placeholder="Describe the article you want to generate" />
                </div>

                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">Tone</label>
                    <input v-model="aiContent.tone" type="text" class="input"
                      placeholder="Professional, friendly, persuasive..." />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Structure</label>
                    <input v-model="aiContent.structure" type="text" class="input"
                      placeholder="Intro, benefits, steps, conclusion..." />
                  </div>
                </div>

                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">Estimated Words</label>
                    <input v-model.number="aiContent.maxEstimatedWords" type="number" min="200" max="5000" step="50"
                      class="input" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Insert Mode</label>
                    <select v-model="aiContent.mode" class="select">
                      <option value="replace">Replace current content</option>
                      <option value="append">Append to current content</option>
                    </select>
                  </div>
                </div>

                <div class="workflow-actions">
                  <button class="primary-btn" @click="handleGenerateContent"
                    :disabled="aiContent.isGenerating || !draftId">
                    {{ aiContent.isGenerating ? 'Generating...' : 'Generate Content' }}
                  </button>
                </div>

                <p v-if="aiContent.message" class="success-text">
                  {{ aiContent.message }}
                </p>
                <p v-if="aiContent.error" class="error-text">
                  {{ aiContent.error }}
                </p>
              </div>
            </div>
          </div>

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('aiImage')">
              <span>AI Image</span>
              <span>{{ openSections.aiImage ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.aiImage" class="workflow-body">
              <div class="workflow-form">
                <div class="source-toggle">
                  <button type="button" class="source-btn" :class="{ active: imageSourceTab === 'ai' }"
                    @click="imageSourceTab = 'ai'">
                    AI Image
                  </button>
                  <button type="button" class="source-btn" :class="{ active: imageSourceTab === 'upload' }"
                    @click="imageSourceTab = 'upload'">
                    Upload Media
                  </button>
                </div>

                <div v-if="imageSourceTab === 'ai'" class="source-panel">
                  <div class="field-group">
                    <label class="field-label">Prompt</label>
                    <textarea v-model="aiImage.prompt" class="textarea" rows="3"
                      placeholder="Describe the image you want to generate" />
                  </div>

                  <div class="workflow-row">
                    <div class="field-group">
                      <label class="field-label">Size</label>
                      <select v-model="aiImage.size" class="select">
                        <option value="1024x1024">1024x1024</option>
                        <option value="1536x1024">1536x1024</option>
                        <option value="1024x1536">1024x1536</option>
                        <option value="auto">auto</option>
                      </select>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Background</label>
                      <select v-model="aiImage.background" class="select">
                        <option value="auto">auto</option>
                        <option value="opaque">opaque</option>
                        <option value="transparent">transparent</option>
                      </select>
                    </div>
                  </div>

                  <div class="workflow-actions">
                    <button class="primary-btn" @click="handleGenerateImage"
                      :disabled="aiImage.isGenerating || !draftId">
                      {{ aiImage.isGenerating ? 'Generating...' : 'Generate Image' }}
                    </button>

                    <button class="ghost-btn" @click="loadDraftImages" :disabled="aiImage.isLoadingSaved">
                      Refresh Saved Images
                    </button>
                  </div>

                  <p v-if="aiImage.message" class="success-text">{{ aiImage.message }}</p>
                  <p v-if="aiImage.error" class="error-text">{{ aiImage.error }}</p>
                </div>

                <div v-else class="source-panel">
                  <div class="field-group">
                    <label class="field-label">Choose Image File</label>
                    <input type="file" accept="image/*" class="input" @change="handleManualFileChange" />
                    <p v-if="manualMedia.fileName" class="muted-note">
                      Selected: {{ manualMedia.fileName }}
                    </p>
                  </div>

                  <div class="field-group">
                    <label class="field-label">Alt Text</label>
                    <input v-model="manualMedia.altText" type="text" class="input" placeholder="Optional alt text" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Caption</label>
                    <textarea v-model="manualMedia.caption" class="textarea" rows="3" placeholder="Optional caption" />
                  </div>

                  <div class="workflow-actions">
                    <button class="primary-btn" type="button" @click="handleUploadManualMedia"
                      :disabled="manualMedia.isUploading || !manualMedia.file">
                      {{ manualMedia.isUploading ? 'Uploading...' : 'Upload to Draft Images' }}
                    </button>
                  </div>

                  <p v-if="manualMedia.message" class="success-text">
                    {{ manualMedia.message }}
                  </p>
                  <p v-if="manualMedia.error" class="error-text">
                    {{ manualMedia.error }}
                  </p>
                </div>
              </div>

              <div class="image-section-block">
                <h4>Generated Candidates</h4>

                <div v-if="aiImage.tempImages.length" class="image-grid">
                  <button v-for="image in aiImage.tempImages" :key="image.id" class="image-card"
                    :class="{ selected: String(aiImage.selectedTempImageId) === String(image.id) }"
                    @click="aiImage.selectedTempImageId = image.id">
                    <img :src="image.previewUrl" alt="Generated image candidate" />
                    <div class="image-meta">
                      <span>{{ image.modelName || 'Generated image' }}</span>
                    </div>
                  </button>
                </div>

                <div v-else class="empty-state">
                  No generated candidates yet.
                </div>

                <div v-if="selectedTempImage" class="workflow-actions">
                  <button class="secondary-btn" @click="handleSaveGeneratedImage" :disabled="aiImage.isWorking">
                    {{ aiImage.isWorking ? 'Saving...' : 'Save to Draft Image' }}
                  </button>

                  <button class="ghost-btn" @click="removeTempImage(selectedTempImage.id)"
                    :disabled="aiImage.isWorking">
                    Remove Candidate
                  </button>
                </div>
              </div>

              <div class="image-section-block">
                <h4>Saved Draft Images</h4>

                <div v-if="aiImage.savedImages.length" class="image-grid">
                  <button v-for="image in aiImage.savedImages" :key="image.id" class="image-card"
                    :class="{ selected: String(aiImage.selectedSavedImageId) === String(image.id) }"
                    @click="aiImage.selectedSavedImageId = image.id">
                    <img v-if="image.remoteUrl || image.previewUrl" :src="image.remoteUrl || image.previewUrl"
                      alt="Saved draft image" />
                    <div v-else class="image-placeholder">
                      No preview available
                    </div>

                    <div class="image-meta">
                      <strong class="image-title">{{ getImageDisplayLabel(image) }}</strong>

                      <div class="image-badges">
                        <span class="image-badge muted">ID: {{ image.id }}</span>
                        <span v-if="image.remoteUrl" class="image-badge uploaded">WP uploaded</span>
                        <span v-if="image.isFeatured" class="image-badge featured">Featured</span>
                      </div>
                    </div>
                  </button>
                </div>

                <div v-else class="empty-state">
                  No saved draft images yet.
                </div>

                <div v-if="selectedSavedImage" class="image-section-block">
                  <h4>Selected Image Actions</h4>

                  <div class="workflow-row">
                    <div class="field-group">
                      <label class="field-label">Insert Type</label>
                      <select v-model="mediaInsert.insertType" class="select">
                        <option value="END_OF_ARTICLE">End of article</option>
                        <option value="AFTER_HEADING">After heading</option>
                        <option value="INSIDE_SECTION_START">Inside section start</option>
                        <option value="INSIDE_SECTION_END">Inside section end</option>
                        <option value="AFTER_PARAGRAPH_IN_SECTION">After paragraph in section</option>
                      </select>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Heading Level (optional)</label>
                      <select v-model="mediaInsert.targetHeadingLevel" class="select">
                        <option value="">Any heading level</option>
                        <option value="1">H1</option>
                        <option value="2">H2</option>
                        <option value="3">H3</option>
                        <option value="4">H4</option>
                        <option value="5">H5</option>
                        <option value="6">H6</option>
                      </select>
                    </div>
                  </div>

                  <div v-if="requiresHeadingTarget" class="field-group">
                    <label class="field-label">Target Heading Text</label>
                    <input v-model="mediaInsert.targetHeadingText" type="text" class="input"
                      placeholder="Enter the exact heading text to target" />
                  </div>

                  <div v-if="requiresParagraphIndex" class="field-group narrow-field">
                    <label class="field-label">Paragraph Index in Section</label>
                    <input v-model.number="mediaInsert.paragraphIndexInSection" type="number" min="1" step="1"
                      class="input" />
                  </div>

                  <div class="workflow-actions">
                    <button class="primary-btn" @click="handleInsertImageIntoPost"
                      :disabled="mediaInsert.isInserting || !draftSite || !selectedSavedImage">
                      {{ mediaInsert.isInserting ? 'Inserting...' : 'Insert Into Post' }}
                    </button>

                    <button class="secondary-btn" @click="handleSetFeaturedImage"
                      :disabled="aiImage.isWorking || !draftSite || !selectedSavedImage">
                      Set as Featured
                    </button>
                  </div>

                  <p v-if="mediaInsert.message" class="success-text">
                    {{ mediaInsert.message }}
                  </p>
                  <p v-if="mediaInsert.error" class="error-text">
                    {{ mediaInsert.error }}
                  </p>

                  <p v-if="!draftSite" class="muted-note">
                    Select a site to insert media or set a featured image.
                  </p>
                </div>

                <div v-if="selectedSavedImage" class="image-section-block">
                  <h4>Edit Saved Image Metadata</h4>

                  <div class="field-group">
                    <label class="field-label">Alt Text</label>
                    <input v-model="imageMetaEditor.altText" type="text" class="input"
                      placeholder="Describe the image for accessibility" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Caption</label>
                    <textarea v-model="imageMetaEditor.caption" class="textarea" rows="3"
                      placeholder="Optional image caption" />
                  </div>

                  <div class="workflow-actions">
                    <button class="secondary-btn" @click="handleUpdateDraftImageMeta"
                      :disabled="imageMetaEditor.isSaving || imageMetaEditor.isDeleting">
                      {{ imageMetaEditor.isSaving ? 'Saving...' : 'Save Image Metadata' }}
                    </button>

                    <button class="danger-btn" @click="handleDeleteDraftImage"
                      :disabled="imageMetaEditor.isDeleting || imageMetaEditor.isSaving">
                      {{ imageMetaEditor.isDeleting ? 'Deleting...' : 'Delete Draft Image (Local)' }}
                    </button>
                  </div>

                  <p v-if="imageMetaEditor.message" class="success-text">
                    {{ imageMetaEditor.message }}
                  </p>
                  <p v-if="imageMetaEditor.error" class="error-text">
                    {{ imageMetaEditor.error }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('aiTitle')">
              <span>AI Title</span>
              <span>{{ openSections.aiTitle ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.aiTitle" class="workflow-body">
              <div class="workflow-form">
                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">Tone</label>
                    <input v-model="aiTitle.tone" type="text" class="input" placeholder="professional but simple" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Suggestion Count</label>
                    <input v-model.number="aiTitle.count" type="number" min="1" max="10" class="input" />
                  </div>
                </div>

                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">Max Title Length</label>
                    <input v-model.number="aiTitle.maxTitleLength" type="number" min="20" max="150" class="input" />
                  </div>
                </div>

                <div class="workflow-actions">
                  <button class="primary-btn" @click="handleGenerateTitles" :disabled="aiTitle.isGenerating">
                    {{ aiTitle.isGenerating ? 'Generating...' : 'Generate Titles' }}
                  </button>
                </div>

                <p v-if="aiTitle.message" class="success-text">
                  {{ aiTitle.message }}
                </p>
                <p v-if="aiTitle.error" class="error-text">
                  {{ aiTitle.error }}
                </p>

                <div v-if="aiTitle.suggestions.length" class="title-suggestion-list">
                  <div v-for="(title, index) in aiTitle.suggestions" :key="`${index}-${title}`"
                    class="title-suggestion-card">
                    <div class="title-suggestion-text">{{ title }}</div>
                    <button class="secondary-btn" @click="applyGeneratedTitle(title)">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('seo')">
              <span>SEO</span>
              <span>{{ openSections.seo ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.seo" class="workflow-body">
              <div class="workflow-form">

                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">Tone</label>
                    <input v-model="aiSeo.tone" type="text" class="input" placeholder="professional but simple" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Max Meta Description Length</label>
                    <input v-model.number="aiSeo.maxMetaDescriptionLength" type="number" min="120" max="200"
                      class="input" />
                  </div>
                </div>

                <div class="workflow-actions">
                  <button class="primary-btn" @click="handleGenerateSeo" :disabled="aiSeo.isGenerating">
                    {{ aiSeo.isGenerating ? 'Generating...' : 'Generate SEO' }}
                  </button>

                  <button class="secondary-btn" @click="handleSaveSeo" :disabled="aiSeo.isSaving || aiSeo.isGenerating">
                    {{ aiSeo.isSaving ? 'Saving...' : 'Save SEO' }}
                  </button>
                </div>

                <p v-if="aiSeo.message" class="success-text">
                  {{ aiSeo.message }}
                </p>
                <p v-if="aiSeo.error" class="error-text">
                  {{ aiSeo.error }}
                </p>

                <div class="seo-result-grid">
                  <div class="field-group">
                    <label class="field-label">SEO Title</label>
                    <input v-model="aiSeo.seoTitle" type="text" class="input" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Focus Keyword</label>
                    <input v-model="aiSeo.focusKeyword" type="text" class="input" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Canonical URL</label>
                    <input v-model="aiSeo.canonicalUrl" type="text" class="input" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">Meta Description</label>
                    <textarea v-model="aiSeo.metaDescription" class="textarea" rows="4" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">OG Title</label>
                    <input v-model="aiSeo.ogTitle" type="text" class="input" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">OG Description</label>
                    <textarea v-model="aiSeo.ogDescription" class="textarea" rows="4" />
                  </div>

                  <div class="field-group">
                    <label class="field-label">OG Image URL</label>
                    <input v-model="aiSeo.ogImageUrl" type="text" class="input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="workflow-card">
            <button class="workflow-header" @click="toggleSection('publish')">
              <span>Publish</span>
              <span>{{ openSections.publish ? '−' : '+' }}</span>
            </button>

            <div v-if="openSections.publish" class="workflow-body">
              <div class="workflow-form">
                <div class="workflow-row">
                  <div class="field-group">
                    <label class="field-label">site</label>
                    <div class="media-selected-box">
                      <template v-if="draftSite">
                        <div class="media-selected-title">{{ draftSite.name }}</div>
                        <div class="media-selected-meta">{{ draftSite.baseUrl }}</div>
                      </template>
                      <template v-else>
                        No site selected.
                      </template>
                    </div>
                  </div>

                  <div class="field-group narrow-field">
                    <label class="field-label">Publish Status</label>
                    <select v-model="publishState.status" class="select">
                      <option value="draft">WordPress Draft</option>
                      <option value="publish">Publish Live</option>
                    </select>
                  </div>
                </div>

                <div class="workflow-actions">
                  <button class="primary-btn" @click="handlePublishDraft"
                    :disabled="publishState.isPublishing || !draftSite">
                    {{ publishState.isPublishing ? 'Publishing...' : 'Publish / Update' }}
                  </button>

                  <button class="secondary-btn" @click="activeTab = 'preview'">
                    Preview In Editor
                  </button>
                </div>

                <div v-if="publishState.wpPostUrl || publishState.message" class="publish-result-box">
                  <p v-if="publishState.message" class="success-text">
                    {{ publishState.message }}
                  </p>

                  <p v-if="publishState.action">
                    <strong>Action:</strong> {{ publishState.action }}
                  </p>

                  <p v-if="publishState.syncStatus">
                    <strong>Sync Status:</strong> {{ publishState.syncStatus }}
                  </p>

                  <p v-if="publishState.wpPostId">
                    <strong>WP Post ID:</strong> {{ publishState.wpPostId }}
                  </p>

                  <p v-if="publishState.wpPostUrl">
                    <strong>Remote URL:</strong>
                    <a :href="publishState.wpPostUrl" target="_blank" rel="noreferrer">
                      {{ publishState.wpPostUrl }}
                    </a>
                  </p>
                </div>

                <p v-if="publishState.error" class="error-text">
                  {{ publishState.error }}
                </p>

                <div class="workflow-actions">
                  <button class="ghost-btn" @click="handleDeleteRemotePost(false)"
                    :disabled="publishState.isDeletingRemote || !draftSite">
                    {{ publishState.isDeletingRemote ? 'Processing...' : 'Trash Remote Post' }}
                  </button>

                  <button class="danger-btn" @click="handleDeleteRemotePost(true)"
                    :disabled="publishState.isDeletingRemote || !draftSite">
                    {{ publishState.isDeletingRemote ? 'Processing...' : 'Delete Remote Post' }}
                  </button>
                </div>

                <p class="muted-note" v-if="!draftSite">
                  Select a site before publishing or deleting the remote post.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Editor from '@tinymce/tinymce-vue'
import { useDraftStore } from '@stores/draftStore'
import { useSiteStore } from '@stores/siteStore'
import {
  publishDraftApi,
  deleteRemoteDraftPostApi,
} from '@api/publish'
import {
  generateImageApi,
  generatePostApi,
  generateTitleApi,
  generateSeoApi,
  updateDraftSeoApi,
  getDraftSeoApi,
} from '@api/ai'

import {
  getDraftImagesApi,
  saveGeneratedDraftImageApi,
  uploadDraftImageApi,
  uploadDraftImageToWpApi,
  insertDraftImageApi,
  setFeaturedDraftImageApi,
  updateDraftImageApi,
  deleteDraftImageApi,
} from '@api/media'

import {
  getSiteCategoriesApi,
  getSiteTagsApi,
  getDraftCategoriesApi,
  createSiteCategoryApi,
  createSiteTagApi,
  replaceDraftCategoriesApi,
  getDraftTagsApi,
  replaceDraftTagsApi,
} from '@api/taxonomy'

const route = useRoute()
const router = useRouter()
const draftStore = useDraftStore()
const siteStore = useSiteStore()

const draftId = computed(() => Number(route.params.id))
const isInitialLoading = ref(true)
const activeTab = ref('visual')
const draftSiteId = ref('')
const imageSourceTab = ref('ai')
const taxonomyTab = ref('assign')
const draftFocusKeyword = ref('')

const openSections = reactive({
  aiImage: true,
  aiContent: true,
  aiTitle: false,
  seo: false,
  taxonomy: false,
  publish: false,
})

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
})

const aiImage = reactive({
  prompt: '',
  stylePrompt: '',
  size: '1024x1024',
  background: 'auto',

  isGenerating: false,
  isLoadingSaved: false,
  isWorking: false,

  tempImages: [],
  savedImages: [],

  selectedTempImageId: null,
  selectedSavedImageId: null,

  message: '',
  error: '',
})

const aiContent = reactive({
  prompt: '',
  tone: '',
  structure: '',
  maxEstimatedWords: 800,
  mode: 'replace', // replace | append
  isGenerating: false,
  message: '',
  error: '',
})

const aiTitle = reactive({
  tone: 'professional but simple',
  count: 3,
  maxTitleLength: 70,
  isGenerating: false,
  suggestions: [],
  message: '',
  error: '',
})

const aiSeo = reactive({
  prompt: '',
  tone: 'professional but simple',
  maxMetaDescriptionLength: 160,

  seoTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  focusKeyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',

  isGenerating: false,
  isSaving: false,
  isLoading: false,
  message: '',
  error: '',
})

const manualMedia = reactive({
  file: null,
  fileName: '',
  altText: '',
  caption: '',
  isUploading: false,
  message: '',
  error: '',
})

const mediaInsert = reactive({
  insertType: 'END_OF_ARTICLE',
  targetHeadingText: '',
  targetHeadingLevel: '',
  paragraphIndexInSection: 1,
  isInserting: false,
  message: '',
  error: '',
})

const imageMetaEditor = reactive({
  altText: '',
  caption: '',
  positionMarker: '',
  isSaving: false,
  isDeleting: false,
  message: '',
  error: '',
})

const publishState = reactive({
  status: 'draft', // draft | publish
  isPublishing: false,
  isDeletingRemote: false,
  message: '',
  error: '',
  action: '',
  syncStatus: '',
  wpPostId: null,
  wpPostUrl: '',
})

const taxonomyCreate = reactive({
  category: {
    name: '',
    slug: '',
    description: '',
    isSubmitting: false,
    error: '',
    message: '',
  },
  tag: {
    name: '',
    slug: '',
    description: '',
    isSubmitting: false,
    error: '',
    message: '',
  },
})

const taxonomyState = reactive({
  isLoading: false,
  isSaving: false,
  error: '',
  message: '',

  availableCategories: [],
  availableTags: [],

  selectedCategoryIds: [],
  selectedTagIds: [],
})

const taxonomyPicker = reactive({
  categoryToAdd: '',
  tagToAdd: '',
})

const saveState = reactive({
  isSaving: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  error: '',
})

const lastSavedSnapshot = ref({
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  defaultSiteId: '',
})

let autosaveTimer = null


const currentDraft = computed(() => draftStore.currentDraft)

const draftSite = computed(() => {
  if (!draftSiteId.value) return null
  return siteStore.sites.find((site) => String(site.id) === String(draftSiteId.value)) || null
})

const tinyMceApiKey = import.meta.env.VITE_TINYMCE_API_KEY

const tinyMceConfig = {
  height: 520,
  menubar: true,
  branding: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'preview', 'anchor', 'searchreplace', 'visualblocks',
    'code', 'fullscreen', 'insertdatetime', 'media',
    'table', 'wordcount'
  ],
  toolbar:
    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image media table | code preview fullscreen',
  content_style: `
    body {
      font-family: Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 16px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  `,
}

function toggleSection(sectionKey) {
  openSections[sectionKey] = !openSections[sectionKey]
}

function populateForm(draft) {
  form.title = draft?.title || ''
  form.slug = draft?.slug || ''
  form.excerpt = draft?.excerpt || ''
  form.contentHtml = draft?.contentHtml || '<p></p>'

  if (draft?.defaultSiteId) {
    draftSiteId.value = String(draft.defaultSiteId)
  }

  updateSavedSnapshot()
}

function normalizeDraftSeo(response) {
  const data =
    response?.data?.seoMeta ||
    response?.data ||
    response?.seoMeta ||
    response ||
    null

  if (!data || typeof data !== 'object') return null

  return {
    seoTitle: typeof data.seoTitle === 'string' ? data.seoTitle : '',
    metaDescription:
      typeof data.metaDescription === 'string' ? data.metaDescription : '',
    canonicalUrl:
      typeof data.canonicalUrl === 'string' ? data.canonicalUrl : '',
    focusKeyword:
      typeof data.focusKeyword === 'string' ? data.focusKeyword : '',
    ogTitle: typeof data.ogTitle === 'string' ? data.ogTitle : '',
    ogDescription:
      typeof data.ogDescription === 'string' ? data.ogDescription : '',
    ogImageUrl:
      typeof data.ogImageUrl === 'string' ? data.ogImageUrl : '',
  }
}

async function loadDraftSeo() {
  if (!draftId.value) return

  aiSeo.isLoading = true
  aiSeo.error = ''

  try {
    const response = await getDraftSeoApi(draftId.value)
    const seo = normalizeDraftSeo(response)

    if (!seo) return

    aiSeo.seoTitle = seo.seoTitle
    aiSeo.metaDescription = seo.metaDescription
    aiSeo.canonicalUrl = seo.canonicalUrl
    aiSeo.focusKeyword = seo.focusKeyword
    aiSeo.ogTitle = seo.ogTitle
    aiSeo.ogDescription = seo.ogDescription
    aiSeo.ogImageUrl = seo.ogImageUrl

    if (seo.focusKeyword) {
      draftFocusKeyword.value = seo.focusKeyword
    }
  } catch (error) {
    const status = error?.response?.status
    if (status !== 404) {
      aiSeo.error =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load draft SEO metadata.'
    }
  } finally {
    aiSeo.isLoading = false
  }
}

function normalizeSiteCategories(response) {
  const raw =
    response?.data?.categories ||
    response?.data ||
    response?.categories ||
    response ||
    []

  if (!Array.isArray(raw)) return []

  return raw.map((item) => ({
    id: item.id,
    name: item.name || '',
    slug: item.slug || '',
    raw: item,
  }))
}

function normalizeSiteTags(response) {
  const raw =
    response?.data?.tags ||
    response?.data ||
    response?.tags ||
    response ||
    []

  if (!Array.isArray(raw)) return []

  return raw.map((item) => ({
    id: item.id,
    name: item.name || '',
    slug: item.slug || '',
    raw: item,
  }))
}

function normalizeDraftCategories(response) {
  const raw =
    response?.data?.categories ||
    response?.data ||
    response?.categories ||
    response ||
    []

  if (!Array.isArray(raw)) return []

  return raw.map((item) => ({
    id: item.id,
    siteId: item.siteId,
    wpCategoryId: item.wpCategoryId,
    categoryName: item.categoryName || '',
    slug: item.slug || '',
    raw: item,
  }))
}

function normalizeDraftTags(response) {
  const raw =
    response?.data?.tags ||
    response?.data ||
    response?.tags ||
    response ||
    []

  if (!Array.isArray(raw)) return []

  return raw.map((item) => ({
    id: item.id,
    siteId: item.siteId,
    wpTagId: item.wpTagId,
    tagName: item.tagName || '',
    slug: item.slug || '',
    raw: item,
  }))
}

const availableCategoryOptions = computed(() => {
  return taxonomyState.availableCategories.filter(
    (item) => !taxonomyState.selectedCategoryIds.includes(item.id)
  )
})

const availableTagOptions = computed(() => {
  return taxonomyState.availableTags.filter(
    (item) => !taxonomyState.selectedTagIds.includes(item.id)
  )
})

async function loadTaxonomyFordraftSite() {
  taxonomyState.error = ''
  taxonomyState.message = ''

  if (!draftId.value || !draftSite.value) {
    taxonomyState.availableCategories = []
    taxonomyState.availableTags = []
    taxonomyState.selectedCategoryIds = []
    taxonomyState.selectedTagIds = []
    return
  }

  taxonomyState.isLoading = true

  try {
    const [
      siteCategoriesResponse,
      siteTagsResponse,
      draftCategoriesResponse,
      draftTagsResponse,
    ] = await Promise.all([
      getSiteCategoriesApi(draftSite.value.id),
      getSiteTagsApi(draftSite.value.id),
      getDraftCategoriesApi(draftId.value),
      getDraftTagsApi(draftId.value),
    ])

    taxonomyState.availableCategories = normalizeSiteCategories(siteCategoriesResponse)
    taxonomyState.availableTags = normalizeSiteTags(siteTagsResponse)

    const draftCategories = normalizeDraftCategories(draftCategoriesResponse)
    const draftTags = normalizeDraftTags(draftTagsResponse)

    taxonomyState.selectedCategoryIds = draftCategories
      .filter((item) => Number(item.siteId) === Number(draftSite.value.id))
      .map((item) => item.wpCategoryId)

    taxonomyState.selectedTagIds = draftTags
      .filter((item) => Number(item.siteId) === Number(draftSite.value.id))
      .map((item) => item.wpTagId)
  } catch (error) {
    taxonomyState.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load categories and tags.'
  } finally {
    taxonomyState.isLoading = false
  }
}

function addSelectedCategory() {
  const id = Number(taxonomyPicker.categoryToAdd)
  if (!id || taxonomyState.selectedCategoryIds.includes(id)) return

  taxonomyState.selectedCategoryIds.push(id)
  taxonomyPicker.categoryToAdd = ''
}

function removeSelectedCategory(id) {
  taxonomyState.selectedCategoryIds = taxonomyState.selectedCategoryIds.filter(
    (item) => item !== id
  )
}

function addSelectedTag() {
  const id = Number(taxonomyPicker.tagToAdd)
  if (!id || taxonomyState.selectedTagIds.includes(id)) return

  taxonomyState.selectedTagIds.push(id)
  taxonomyPicker.tagToAdd = ''
}

function removeSelectedTag(id) {
  taxonomyState.selectedTagIds = taxonomyState.selectedTagIds.filter(
    (item) => item !== id
  )
}

function getCategoryNameById(id) {
  return (
    taxonomyState.availableCategories.find((item) => item.id === id)?.name ||
    `Category #${id}`
  )
}

function getTagNameById(id) {
  return (
    taxonomyState.availableTags.find((item) => item.id === id)?.name ||
    `Tag #${id}`
  )
}

function removeTempImage(tempId) {
  aiImage.tempImages = aiImage.tempImages.filter((img) => img.id !== tempId)

  if (String(aiImage.selectedTempImageId) === String(tempId)) {
    aiImage.selectedTempImageId = aiImage.tempImages[0]?.id || null
  }
}

const requiresHeadingTarget = computed(() => {
  return [
    'AFTER_HEADING',
    'INSIDE_SECTION_START',
    'INSIDE_SECTION_END',
    'AFTER_PARAGRAPH_IN_SECTION',
  ].includes(mediaInsert.insertType)
})

const requiresParagraphIndex = computed(() => {
  return mediaInsert.insertType === 'AFTER_PARAGRAPH_IN_SECTION'
})

async function loadDraft() {
  if (!draftId.value || Number.isNaN(draftId.value)) {
    isInitialLoading.value = false
    return
  }

  isInitialLoading.value = true

  const result = await draftStore.fetchDraftById(draftId.value)

  if (result.success && result.data) {
    populateForm(result.data)
  }

  isInitialLoading.value = false
}

async function loadSites() {
  if (!siteStore.sites.length) {
    await siteStore.fetchSites()
  }
}

function goBack() {
  router.push('/app/drafts')
}

function formatDate(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleString()
}

async function handleSave() {
  if (!draftId.value) return

  try {
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      contentHtml: form.contentHtml,
      defaultSiteId: draftSiteId.value ? Number(draftSiteId.value) : null,
    }

    const result = await draftStore.updateDraft(draftId.value, payload)

    if (result.success && result.data) {
      populateForm(result.data)
    } else {
      throw new Error(result.message || 'Failed to save draft.')
    }
  } catch (error) {
    saveState.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save draft.'
  } finally {
    saveState.isSaving = false
  }
}

function getCurrentDraftSnapshot() {
  return {
    title: form.title || '',
    slug: form.slug || '',
    excerpt: form.excerpt || '',
    contentHtml: form.contentHtml || '',
    defaultSiteId: draftSiteId.value || '',
  }
}

function updateSavedSnapshot() {
  lastSavedSnapshot.value = getCurrentDraftSnapshot()
  saveState.hasUnsavedChanges = false
  saveState.lastSavedAt = new Date()
}

function checkUnsavedChanges() {
  const current = getCurrentDraftSnapshot()
  const saved = lastSavedSnapshot.value

  saveState.hasUnsavedChanges =
    current.title !== saved.title ||
    current.slug !== saved.slug ||
    current.excerpt !== saved.excerpt ||
    current.contentHtml !== saved.contentHtml
}

async function runAutosave() {
  if (!draftId.value || !saveState.hasUnsavedChanges || saveState.isSaving) return

  saveState.isSaving = true
  saveState.error = ''

  try {
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      contentHtml: form.contentHtml,
      defaultSiteId: draftSiteId.value ? Number(draftSiteId.value) : null,
    }

    const result = await draftStore.updateDraft(draftId.value, payload)

    if (result.success && result.data) {
      updateSavedSnapshot()
    } else {
      throw new Error(result.message || 'Autosave failed.')
    }
  } catch (error) {
    saveState.error =
      error?.response?.data?.message ||
      error?.message ||
      'Autosave failed.'
  } finally {
    saveState.isSaving = false
  }
}

function handleBeforeUnload(event) {
  if (saveState.hasUnsavedChanges || saveState.isSaving) {
    event.preventDefault()
    event.returnValue = ''
  }
}

function normalizePublishResult(response) {
  const data = response?.data || response || null

  if (!data || typeof data !== 'object') return null

  return {
    action: typeof data.action === 'string' ? data.action : '',
    syncStatus: typeof data.sync?.syncStatus === 'string' ? data.sync.syncStatus : '',
    wpPostId: data.sync?.wpPostId ?? data.publishResult?.wpPostId ?? null,
    wpPostUrl:
      data.sync?.wpPostUrl ||
      data.publishResult?.wpPostUrl ||
      '',
    syncMessage:
      data.sync?.syncMessage ||
      data.publishResult?.message ||
      '',
  }
}

async function handleDelete() {
  if (!draftId.value) return

  const confirmed = window.confirm('Are you sure you want to delete this draft?')
  if (!confirmed) return

  const result = await draftStore.deleteDraft(draftId.value)

  if (result.success) {
    router.push('/app/drafts')
  }
}

const selectedTempImage = computed(() => {
  const tempImages = Array.isArray(aiImage.tempImages) ? aiImage.tempImages : []

  return tempImages.find(
    (img) => String(img.id) === String(aiImage.selectedTempImageId)
  ) || null
})
const selectedSavedImage = computed(() => {
  const savedImages = Array.isArray(aiImage.savedImages) ? aiImage.savedImages : []

  return savedImages.find(
    (img) => String(img.id) === String(aiImage.selectedSavedImageId)
  ) || null
})

function extractGeneratedPost(response) {
  const data = response?.data || response || {}

  return {
    contentHtml:
      data.contentHtml ||
      data.html ||
      data.content ||
      '',
    focusKeyword:
      typeof data.focusKeyword === 'string' ? data.focusKeyword.trim() : '',
    estimatedWords:
      typeof data.estimatedWords === 'number' ? data.estimatedWords : null,
    modelName:
      typeof data.modelName === 'string' ? data.modelName : '',
  }
}

async function handleGenerateContent() {
  if (!draftId.value) return

  aiContent.isGenerating = true
  aiContent.error = ''
  aiContent.message = ''

  try {
    const payload = {
      prompt: aiContent.prompt?.trim() || form.title?.trim() || 'Generate article content',
      draftId: draftId.value,
      tone: aiContent.tone?.trim() || undefined,
      structure: aiContent.structure?.trim() || undefined,
      maxEstimatedWords: Number(aiContent.maxEstimatedWords) || undefined,
    }

    const response = await generatePostApi(payload)
    const result = extractGeneratedPost(response)

    if (!result.contentHtml) {
      throw new Error('No generated content was returned.')
    }

    if (aiContent.mode === 'append') {
      const current = form.contentHtml?.trim() || ''
      form.contentHtml = current
        ? `${current}\n\n${result.contentHtml}`
        : result.contentHtml
    } else {
      form.contentHtml = result.contentHtml
    }

    if (result.focusKeyword) {
      draftFocusKeyword.value = result.focusKeyword
      aiSeo.focusKeyword = result.focusKeyword
    }

    activeTab.value = 'visual'
    aiContent.message = result.focusKeyword
      ? `Content generated. Focus keyword: ${result.focusKeyword}`
      : 'Content generated and inserted into the editor.'
  } catch (error) {
    aiContent.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to generate content.'
  } finally {
    aiContent.isGenerating = false
  }
}

function extractGeneratedTitles(response) {
  const titles =
    response?.data?.titles ||
    response?.data?.suggestions ||
    response?.data ||
    response?.titles ||
    response?.suggestions ||
    []

  if (Array.isArray(titles)) {
    return titles.filter((item) => typeof item === 'string' && item.trim())
  }

  if (typeof titles === 'string' && titles.trim()) {
    return [titles.trim()]
  }

  return []
}

async function handleGenerateTitles() {
  aiTitle.isGenerating = true
  aiTitle.error = ''
  aiTitle.message = ''

  try {
    const contentHtml = form.contentHtml?.trim()

    if (!contentHtml) {
      throw new Error('Content is required before generating titles.')
    }

    const payload = {
      prompt: form.title?.trim() || 'Generate SEO-friendly title suggestions for this article',
      contentHtml,
      count: Number(aiTitle.count) || 3,
      tone: aiTitle.tone?.trim() || undefined,
      maxTitleLength: Number(aiTitle.maxTitleLength) || undefined,
    }

    const response = await generateTitleApi(payload)
    const titles = extractGeneratedTitles(response)

    if (!titles.length) {
      throw new Error('No title suggestions were returned.')
    }

    aiTitle.suggestions = titles
    aiTitle.message = 'Title suggestions generated.'
  } catch (error) {
    aiTitle.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to generate title suggestions.'
  } finally {
    aiTitle.isGenerating = false
  }
}

function applyGeneratedTitle(title) {
  form.title = title
  aiTitle.message = 'Title applied to draft.'
}

async function handleCreateCategory() {
  if (!draftSite.value) return

  taxonomyCreate.category.isSubmitting = true
  taxonomyCreate.category.error = ''
  taxonomyCreate.category.message = ''

  try {
    const payload = {
      name: taxonomyCreate.category.name.trim(),
      slug: taxonomyCreate.category.slug.trim() || undefined,
      description: taxonomyCreate.category.description.trim() || undefined,
    }

    if (!payload.name) {
      throw new Error('Category name is required.')
    }

    const response = await createSiteCategoryApi(draftSite.value.id, payload)
    const created =
      response?.data?.term ||
      response?.data ||
      response?.term ||
      response ||
      null

    await loadTaxonomyFordraftSite()

    if (created?.id && !taxonomyState.selectedCategoryIds.includes(created.id)) {
      taxonomyState.selectedCategoryIds.push(created.id)
    }

    taxonomyCreate.category.name = ''
    taxonomyCreate.category.slug = ''
    taxonomyCreate.category.description = ''
    taxonomyCreate.category.message = 'Category created.'
  } catch (error) {
    taxonomyCreate.category.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create category.'
  } finally {
    taxonomyCreate.category.isSubmitting = false
  }
}

async function handleCreateTag() {
  if (!draftSite.value) return

  taxonomyCreate.tag.isSubmitting = true
  taxonomyCreate.tag.error = ''
  taxonomyCreate.tag.message = ''

  try {
    const payload = {
      name: taxonomyCreate.tag.name.trim(),
      slug: taxonomyCreate.tag.slug.trim() || undefined,
      description: taxonomyCreate.tag.description.trim() || undefined,
    }

    if (!payload.name) {
      throw new Error('Tag name is required.')
    }

    const response = await createSiteTagApi(draftSite.value.id, payload)
    const created =
      response?.data?.term ||
      response?.data ||
      response?.term ||
      response ||
      null

    await loadTaxonomyFordraftSite()

    if (created?.id && !taxonomyState.selectedTagIds.includes(created.id)) {
      taxonomyState.selectedTagIds.push(created.id)
    }

    taxonomyCreate.tag.name = ''
    taxonomyCreate.tag.slug = ''
    taxonomyCreate.tag.description = ''
    taxonomyCreate.tag.message = 'Tag created.'
  } catch (error) {
    taxonomyCreate.tag.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create tag.'
  } finally {
    taxonomyCreate.tag.isSubmitting = false
  }
}

async function handleSaveTaxonomy() {
  if (!draftId.value || !draftSite.value) return

  taxonomyState.isSaving = true
  taxonomyState.error = ''
  taxonomyState.message = ''

  try {
    await Promise.all([
      replaceDraftCategoriesApi(draftId.value, {
        siteId: draftSite.value.id,
        categoryIds: taxonomyState.selectedCategoryIds,
      }),
      replaceDraftTagsApi(draftId.value, {
        siteId: draftSite.value.id,
        tagIds: taxonomyState.selectedTagIds,
      }),
    ])

    taxonomyState.message = 'Categories and tags saved.'
  } catch (error) {
    taxonomyState.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save categories and tags.'
  } finally {
    taxonomyState.isSaving = false
  }
}

function normalizeDraftImages(response) {
  const raw =
    response?.data?.images ||
    response?.data ||
    response?.images ||
    response ||
    []

  if (!Array.isArray(raw)) return []

  return raw.map((img) => ({
    id: img.id,
    localPath: img.localPath || '',
    previewUrl: img.previewUrl || '',
    localUrl: img.localUrl || img.fileUrl || img.url || '',
    remoteUrl: img.remoteUrl || '',
    wpMediaId: img.wpMediaId || null,
    altText: img.altText || '',
    caption: img.caption || '',
    isFeatured: !!img.isFeatured,
    raw: img,
  }))
}

async function loadDraftImages() {
  if (!draftId.value) return

  aiImage.isLoadingSaved = true
  aiImage.error = ''

  try {
    const response = await getDraftImagesApi(draftId.value)
    aiImage.savedImages = normalizeDraftImages(response)

    if (!aiImage.selectedSavedImageId && aiImage.savedImages.length) {
      aiImage.selectedSavedImageId = aiImage.savedImages[0].id
    }
  } catch (error) {
    aiImage.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load saved draft images.'
  } finally {
    aiImage.isLoadingSaved = false
  }
}

async function handleUploadManualMedia() {
  if (!draftId.value || !manualMedia.file) return

  manualMedia.isUploading = true
  manualMedia.error = ''
  manualMedia.message = ''

  try {
    const response = await uploadDraftImageApi(draftId.value, manualMedia.file, {
      altText: manualMedia.altText?.trim() || undefined,
      caption: manualMedia.caption?.trim() || undefined,
      positionMarker: undefined,
    })

    await loadDraftImages()

    const savedImageId =
      response?.data?.id ||
      response?.id ||
      null

    if (savedImageId) {
      aiImage.selectedSavedImageId = savedImageId
    }

    manualMedia.file = null
    manualMedia.fileName = ''
    manualMedia.altText = ''
    manualMedia.caption = ''
    manualMedia.message = 'Media uploaded to draft images.'
  } catch (error) {
    manualMedia.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to upload media.'
  } finally {
    manualMedia.isUploading = false
  }
}

async function handleUpdateDraftImageMeta() {
  if (!draftId.value || !selectedSavedImage.value) return

  imageMetaEditor.isSaving = true
  imageMetaEditor.error = ''
  imageMetaEditor.message = ''

  try {
    await updateDraftImageApi(draftId.value, selectedSavedImage.value.id, {
      altText: imageMetaEditor.altText?.trim() || '',
      caption: imageMetaEditor.caption?.trim() || '',
      positionMarker: imageMetaEditor.positionMarker?.trim() || '',
    })

    await loadDraftImages()
    imageMetaEditor.message = 'Image metadata updated.'
  } catch (error) {
    imageMetaEditor.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update image metadata.'
  } finally {
    imageMetaEditor.isSaving = false
  }
}

async function handleDeleteDraftImage() {
  if (!draftId.value || !selectedSavedImage.value) return

  const confirmed = window.confirm(
    'Delete this draft image from the local draft asset list? This will not remove already inserted HTML from the article.'
  )

  if (!confirmed) return

  imageMetaEditor.isDeleting = true
  imageMetaEditor.error = ''
  imageMetaEditor.message = ''

  try {
    const deletingId = selectedSavedImage.value.id

    const response = await deleteDraftImageApi(draftId.value, deletingId)

    await loadDraftImages()

    if (String(aiImage.selectedSavedImageId) === String(deletingId)) {
      aiImage.selectedSavedImageId = aiImage.savedImages[0]?.id || null
    }

    if (response?.data?.wasFeaturedImage || response?.wasFeaturedImage) {
      aiImage.message = 'Image deleted. It was previously the featured image.'
    }

    imageMetaEditor.altText = ''
    imageMetaEditor.caption = ''
    imageMetaEditor.positionMarker = ''
    imageMetaEditor.message = 'Draft image deleted.'
  } catch (error) {
    imageMetaEditor.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete draft image.'
  } finally {
    imageMetaEditor.isDeleting = false
  }
}

async function handleGenerateImage() {
  if (!draftId.value) return

  aiImage.isGenerating = true
  aiImage.error = ''
  aiImage.message = ''

  try {
    const payload = {
      draftId: draftId.value,
      prompt: aiImage.prompt || form.title || 'Generate a featured image',
      title: form.title?.trim() || undefined,
      contentHtml: form.contentHtml?.trim() || undefined,
      size: aiImage.size,
      background: aiImage.background,
    }

    const response = await generateImageApi(payload)
    const generated = response?.data || {}

    if (!generated.imageBase64 || !generated.mimeType) {
      throw new Error('Image data was not returned.')
    }

    const tempId = `temp-${Date.now()}`
    const previewUrl = `data:${generated.mimeType};base64,${generated.imageBase64}`

    aiImage.tempImages.unshift({
      id: tempId,
      previewUrl,
      imageBase64: generated.imageBase64,
      mimeType: generated.mimeType,
      modelName: generated.modelName || '',
      revisedPrompt: generated.revisedPrompt || '',
      prompt: aiImage.prompt,
    })

    aiImage.selectedTempImageId = tempId
    aiImage.message = 'Image generated.'
  } catch (error) {
    aiImage.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to generate image.'
  } finally {
    aiImage.isGenerating = false
  }
}

function handleManualFileChange(event) {
  const file = event?.target?.files?.[0] || null

  manualMedia.file = file
  manualMedia.fileName = file?.name || ''
  manualMedia.error = ''
  manualMedia.message = ''

  if (!manualMedia.altText && file?.name) {
    const baseName = file.name.replace(/\.[^.]+$/, '')
    manualMedia.altText = baseName
  }
}

async function handleSaveGeneratedImage() {
  if (!draftId.value || !selectedTempImage.value) return

  aiImage.isWorking = true
  aiImage.error = ''
  aiImage.message = ''

  try {
    const payload = {
      imageBase64: selectedTempImage.value.imageBase64,
      mimeType: selectedTempImage.value.mimeType,
      altText: form.title || '',
      caption: '',
      positionMarker: '',
      prompt: selectedTempImage.value.prompt || aiImage.prompt || '',
      revisedPrompt: selectedTempImage.value.revisedPrompt || '',
    }

    const response = await saveGeneratedDraftImageApi(draftId.value, payload)

    await loadDraftImages()

    const savedImageId =
      response?.data?.id ||
      response?.id ||
      null

    if (savedImageId) {
      aiImage.selectedSavedImageId = savedImageId
    }

    removeTempImage(selectedTempImage.value.id)

    aiImage.message = 'Image saved to draft images.'
  } catch (error) {
    aiImage.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save generated image.'
  } finally {
    aiImage.isWorking = false
  }
}

function getImageDisplayLabel(image) {
  if (!image) return 'Unnamed image'

  if (image.altText?.trim()) return image.altText.trim()
  if (image.caption?.trim()) return image.caption.trim()
  if (image.raw?.prompt?.trim()) return image.raw.prompt.trim()
  if (image.raw?.revisedPrompt?.trim()) return image.raw.revisedPrompt.trim()

  if (image.localPath) {
    const parts = image.localPath.split(/[\\/]/)
    const fileName = parts[parts.length - 1]
    if (fileName) return fileName
  }

  return `Image #${image.id}`
}

async function ensureImageUploadedFordraftSite() {
  if (!draftId.value || !selectedSavedImage.value) return null

  if (!draftSite.value) {
    throw new Error('Select a site first.')
  }

  if (selectedSavedImage.value.remoteUrl) {
    return selectedSavedImage.value
  }

  await uploadDraftImageToWpApi(
    draftId.value,
    selectedSavedImage.value.id,
    {
      siteId: draftSite.value.id,
    }
  )

  await loadDraftImages()

  return aiImage.savedImages.find(
    (img) => String(img.id) === String(selectedSavedImage.value.id)
  ) || null
}

async function handleInsertImageIntoPost() {
  if (!draftId.value || !selectedSavedImage.value) return

  mediaInsert.isInserting = true
  mediaInsert.error = ''
  mediaInsert.message = ''

  try {
    if (!draftSite.value) {
      throw new Error('Select a site before inserting an image.')
    }

    if (!selectedSavedImage.value) {
      throw new Error('Select a saved draft image first.')
    }

    await ensureImageUploadedFordraftSite()

    const payload = {
      siteId: draftSite.value.id,
      insertType: mediaInsert.insertType,
    }

    if (requiresHeadingTarget.value) {
      if (!mediaInsert.targetHeadingText.trim()) {
        throw new Error('Target heading text is required for this insert type.')
      }

      payload.targetHeadingText = mediaInsert.targetHeadingText.trim()

      if (mediaInsert.targetHeadingLevel !== '' && mediaInsert.targetHeadingLevel !== null) {
        payload.targetHeadingLevel = Number(mediaInsert.targetHeadingLevel)
      }
    }

    if (requiresParagraphIndex.value) {
      const paragraphIndex = Number(mediaInsert.paragraphIndexInSection)

      if (!Number.isInteger(paragraphIndex) || paragraphIndex < 1) {
        throw new Error('Paragraph index must be a positive integer.')
      }

      payload.paragraphIndexInSection = paragraphIndex
    }

    const response = await insertDraftImageApi(
      draftId.value,
      selectedSavedImage.value.id,
      payload
    )

    const updatedHtml =
      response?.data?.contentHtml ||
      response?.contentHtml ||
      null

    if (updatedHtml) {
      form.contentHtml = updatedHtml
    } else {
      await loadDraft()
    }

    activeTab.value = 'visual'
    mediaInsert.message = 'Image inserted into post.'
  } catch (error) {
    mediaInsert.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to insert image into post.'
  } finally {
    mediaInsert.isInserting = false
  }
}

async function handleSetFeaturedImage() {
  if (!draftId.value || !selectedSavedImage.value) return

  aiImage.isWorking = true
  aiImage.error = ''
  aiImage.message = ''

  try {
    if (!draftSite.value) {
      throw new Error('Select a site before setting featured image.')
    }

    await ensureImageUploadedFordraftSite()

    await setFeaturedDraftImageApi(draftId.value, selectedSavedImage.value.id, {
      siteId: draftSite.value.id,
    })

    await loadDraftImages()
    aiImage.message = 'Featured image set.'
  } catch (error) {
    aiImage.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to set featured image.'
  } finally {
    aiImage.isWorking = false
  }
}

function extractGeneratedSeo(response) {
  const data = response?.data || response || null

  if (!data || typeof data !== 'object') return null

  return {
    seoTitle: typeof data.seoTitle === 'string' ? data.seoTitle : '',
    metaDescription:
      typeof data.metaDescription === 'string' ? data.metaDescription : '',
    focusKeyword:
      typeof data.focusKeyword === 'string' ? data.focusKeyword : '',
    ogTitle: typeof data.ogTitle === 'string' ? data.ogTitle : '',
    ogDescription:
      typeof data.ogDescription === 'string' ? data.ogDescription : '',
    ogImageUrl:
      typeof data.ogImageUrl === 'string' ? data.ogImageUrl : '',
  }
}

async function handleGenerateSeo() {
  aiSeo.isGenerating = true
  aiSeo.error = ''
  aiSeo.message = ''

  try {
    const payload = {
      prompt: 'Generate SEO metadata for this article',
      draftId: draftId.value || undefined,
      title: form.title?.trim() || undefined,
      contentHtml: form.contentHtml?.trim() || undefined,
      tone: aiSeo.tone?.trim() || undefined,
      maxMetaDescriptionLength:
        Number(aiSeo.maxMetaDescriptionLength) || undefined,
    }

    const response = await generateSeoApi(payload)
    const seo = extractGeneratedSeo(response)

    if (
      !seo ||
      !seo.seoTitle ||
      !seo.metaDescription ||
      !seo.focusKeyword ||
      !seo.ogTitle ||
      !seo.ogDescription
    ) {
      throw new Error('No valid SEO metadata was returned.')
    }

    if (seo.focusKeyword?.trim()) {
      draftFocusKeyword.value = seo.focusKeyword.trim()
    }
    aiSeo.seoTitle = seo.seoTitle
    aiSeo.metaDescription = seo.metaDescription
    aiSeo.focusKeyword = seo.focusKeyword
    aiSeo.ogTitle = seo.ogTitle
    aiSeo.ogDescription = seo.ogDescription
    aiSeo.ogImageUrl = seo.ogImageUrl || aiSeo.ogImageUrl

    aiSeo.message = 'SEO metadata generated.'
  } catch (error) {
    aiSeo.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to generate SEO metadata.'
  } finally {
    aiSeo.isGenerating = false
  }
}

async function handleSaveSeo() {
  if (!draftId.value) return

  aiSeo.isSaving = true
  aiSeo.error = ''
  aiSeo.message = ''

  try {
    const payload = {
      seoTitle: aiSeo.seoTitle?.trim() || '',
      metaDescription: aiSeo.metaDescription?.trim() || '',
      canonicalUrl: aiSeo.canonicalUrl?.trim() || '',
      focusKeyword: aiSeo.focusKeyword?.trim() || '',
      ogTitle: aiSeo.ogTitle?.trim() || '',
      ogDescription: aiSeo.ogDescription?.trim() || '',
      ogImageUrl: aiSeo.ogImageUrl?.trim() || '',
    }

    await updateDraftSeoApi(draftId.value, payload)
    aiSeo.message = 'SEO metadata saved.'
  } catch (error) {
    aiSeo.error =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save draft SEO metadata.'
  } finally {
    aiSeo.isSaving = false
  }
}

async function handlePublishDraft() {
  if (!draftId.value) return

  publishState.isPublishing = true
  publishState.error = ''
  publishState.message = ''

  try {
    if (!draftSite.value) {
      throw new Error('Select a site before publishing.')
    }

    const payload = {
      siteId: draftSite.value.id,
      status: publishState.status,
    }

    const response = await publishDraftApi(draftId.value, payload)
    const result = normalizePublishResult(response)

    if (!result) {
      throw new Error('No publish result returned.')
    }

    publishState.action = result.action
    publishState.syncStatus = result.syncStatus
    publishState.wpPostId = result.wpPostId
    publishState.wpPostUrl = result.wpPostUrl
    publishState.message =
      result.syncMessage ||
      `Draft ${result.action || 'published'} successfully.`
  } catch (error) {
    publishState.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to publish draft.'
  } finally {
    publishState.isPublishing = false
  }
}

async function handleDeleteRemotePost(force = false) {
  if (!draftId.value) return

  publishState.isDeletingRemote = true
  publishState.error = ''
  publishState.message = ''

  try {
    if (!draftSite.value) {
      throw new Error('Select a site first.')
    }

    const response = await deleteRemoteDraftPostApi(
      draftId.value,
      draftSite.value.id,
      { force }
    )

    publishState.action = ''
    publishState.syncStatus = ''
    publishState.wpPostId = null
    publishState.wpPostUrl = ''
    publishState.message =
      response?.message ||
      (force
        ? 'Remote WordPress post deleted.'
        : 'Remote WordPress post moved to trash.')
  } catch (error) {
    publishState.error =
      error?.response?.data?.message ||
      error?.response?.data?.error?.details ||
      error?.message ||
      'Failed to delete remote WordPress post.'
  } finally {
    publishState.isDeletingRemote = false
  }
}

watch(
  () => route.params.id,
  async () => {
    await loadDraft()
  }
)

watch(
  () => draftSiteId.value,
  () => {
    checkUnsavedChanges()
  }
)

watch(
  () => draftSite.value?.id,
  async () => {
    await loadTaxonomyFordraftSite()
  }
)

watch(
  () => selectedSavedImage.value,
  (image) => {
    imageMetaEditor.altText = image?.altText || ''
    imageMetaEditor.caption = image?.caption || ''
    imageMetaEditor.positionMarker = image?.raw?.positionMarker || ''
    imageMetaEditor.message = ''
    imageMetaEditor.error = ''
  },
  { immediate: true }
)

watch(
  () => [form.title, form.slug, form.excerpt, form.contentHtml],
  () => {
    checkUnsavedChanges()
  },
  { deep: true }
)

watch(
  () => [form.title, form.slug, form.excerpt, form.contentHtml],
  () => {
    checkUnsavedChanges()

    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }

    if (saveState.hasUnsavedChanges) {
      autosaveTimer = setTimeout(() => {
        runAutosave()
      }, 2000)
    }
  },
  { deep: true }
)

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  await Promise.all([
    loadDraft(),
    loadSites(),
    loadDraftImages(),
    loadDraftSeo(),
  ])

  await loadTaxonomyFordraftSite()
})

onBeforeUnmount(() => {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
  }

  window.removeEventListener('beforeunload', handleBeforeUnload)
  draftStore.clearCurrentDraft()
})

onMounted(async () => {
  await Promise.all([
    loadDraft(),
    loadSites(),
    loadDraftImages(),
    loadDraftSeo(),
  ])

  await loadTaxonomyFordraftSite()
})

onBeforeUnmount(() => {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
  }

  draftStore.clearCurrentDraft()
})
</script>

<style scoped>
.draft-editor-page {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  margin-bottom: 24px;
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.editor-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: #fafafa;
}

.side-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.side-note {
  margin-top: 12px;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.input,
.textarea,
.select {
  border-radius: 10px;
  font: inherit;
  background: white;
}

.input,
.select {
  padding: 12px 5px;
  border: 1px solid #d1d5db;
}

.textarea {
  padding: 12px 5px;
  border: 1px solid #d1d5db;
}

.select {
  width: 100%;
  /* Temp fixed */
}

.content-area {
  min-height: 420px;
  font-family: Consolas, Monaco, monospace;
}

.editor-tabs {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.tab-btn {
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.tab-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.editor-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}

.preview-panel {
  min-height: 520px;
  background: #fafafa;
}

.preview-content {
  max-width: 100%;
  line-height: 1.7;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.workflow-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workflow-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}

.workflow-header {
  width: 100%;
  border: none;
  background: #f9fafb;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.workflow-body {
  padding: 16px 18px 18px;
  background: white;
}

.workflow-body p {
  margin-top: 0;
  color: #4b5563;
}

.workflow-actions,
.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.workflow-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-toggle {
  display: inline-flex;
  align-self: flex-start;
  gap: 6px;
  padding: 6px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  width: fit-content;
  margin-bottom: 4px;
}

.source-btn {
  border: 1px solid transparent;
  background: transparent;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.15s ease;
}

.source-btn.active {
  background: white;
  border-color: #d1d5db;
  color: #111827;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.source-panel {
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.workflow-form .narrow {
  max-width: 220px;
}

.workflow-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.image-section-block {
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.image-section-block h4 {
  margin: 0 0 12px;
}

.image-card img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #f3f4f6;
}

.image-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  font-size: 12px;
  color: #4b5563;
}

.success-text {
  color: #059669;
  margin-top: 8px;
}

.muted-note {
  color: #6b7280;
  margin-top: 12px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.image-card {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.image-card.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 13px;
}

.image-title {
  display: block;
  font-size: 13px;
  line-height: 1.4;
  color: #111827;
  margin-bottom: 8px;
  word-break: break-word;
}

.image-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.image-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1;
}

.image-badge.muted {
  background: #f3f4f6;
  color: #4b5563;
}

.image-badge.uploaded {
  background: #dbeafe;
  color: #1d4ed8;
}

.image-badge.featured {
  background: #dcfce7;
  color: #166534;
}

.title-suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.title-suggestion-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafafa;
}

.title-suggestion-text {
  flex: 1;
  color: #111827;
  line-height: 1.5;
}

.seo-result-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.insert-helper {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.selected-image-actions {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
  margin-top: 12px;
}

.narrow-field {
  max-width: 220px;
}

.publish-result-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  background: #fafafa;
  margin-top: 12px;
}

.publish-result-box p {
  margin: 0 0 8px;
}

.publish-result-box p:last-child {
  margin-bottom: 0;
}

.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.taxonomy-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.taxonomy-panel-muted {
  background: #f9fafb;
}

.taxonomy-panel-header h4 {
  margin: 0 0 6px;
}

.taxonomy-panel-header .muted-note {
  margin: 0;
}

.taxonomy-toggle {
  margin-bottom: 10px;
}

.taxonomy-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
}

.taxonomy-block:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.taxonomy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fafafa;
}

.taxonomy-picker-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.selected-term-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.selected-term-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fafafa;
}

.save-status {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.small-btn {
  padding: 6px 10px;
  font-size: 12px;
}

.primary-btn,
.ghost-btn,
.danger-btn,
.secondary-btn,
.success-btn {
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

.danger-btn {
  background: #ef4444;
  color: white;
}

.success-btn {
  background: #10b981;
  color: white;
}

.panel-btn {
  width: 100%;
  text-align: left;
}

.error-text {
  color: #dc2626;
  margin-bottom: 14px;
}

.empty-state {
  color: #6b7280;
  padding: 16px 0;
}

@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
