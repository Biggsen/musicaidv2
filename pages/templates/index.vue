<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-default mb-2">Workflow Templates</h1>
        <p class="text-muted">Manage your production workflow templates</p>
      </div>
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Template
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="templates.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-dimmed mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">No templates yet</h3>
      <p class="text-muted mb-6">Create your first workflow template to get started</p>
      <UButton color="primary" icon="i-heroicons-plus" @click="showCreateModal = true">
        Create Template
      </UButton>
    </UCard>

    <!-- Templates Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="template in templates"
        :key="template.id"
        class="hover:shadow-lg transition-shadow overflow-visible cursor-pointer"
        @click.self="() => router.push(`/templates/${template.id}`)"
      >
        <div class="flex items-start justify-between">
          <div
            class="flex-1"
            @click="() => router.push(`/templates/${template.id}`)"
          >
            <h3 class="text-xl font-semibold text-default mb-2">{{ template.name }}</h3>
            <p v-if="template.description" class="text-sm text-muted mb-4">
              {{ template.description }}
            </p>
            <div class="flex items-center gap-4 text-sm text-muted">
              <UBadge v-if="template.published" color="success">Published</UBadge>
              <UBadge v-else color="neutral">Draft</UBadge>
            </div>
          </div>
          <UPopover :content="{ side: 'bottom', align: 'end' }">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
              @click.stop
            />
            <template #content="slotProps">
              <div class="p-1">
                <UButton
                  variant="ghost"
                  icon="i-heroicons-trash"
                  block
                  color="error"
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    handleDeleteTemplate(template.id, template.name);
                  }"
                >
                  Delete
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
      </UCard>
    </div>

    <!-- Create Template Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Template">
      <template #body>
        <form id="create-template-form" @submit.prevent="handleCreateTemplate" class="space-y-4">
          <div>
            <label for="template-name" class="block text-sm font-medium text-default mb-1">
              Template Name
            </label>
            <UInput
              id="template-name"
              v-model="newTemplate.name"
              placeholder="e.g., Standard Production"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="template-description" class="block text-sm font-medium text-default mb-1">
              Description
            </label>
            <UTextarea
              id="template-description"
              v-model="newTemplate.description"
              placeholder="Describe this workflow template..."
              :rows="3"
              :disabled="creating"
            />
          </div>

          <UAlert v-if="error" color="error" variant="soft" :title="error" />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="showCreateModal = false"
            :disabled="creating"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            form="create-template-form"
            color="primary"
            :loading="creating"
          >
            Create Template
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Template, TemplateInsert } from '~/composables/useWorkflow'

const router = useRouter()
const { getTemplates, createTemplate, deleteTemplate } = useWorkflow()

const templates = ref<Template[]>([])
const loading = ref(true)
const creating = ref(false)
const showCreateModal = ref(false)
const error = ref('')

const newTemplate = ref<TemplateInsert>({
  name: '',
  description: null,
})

// Load templates
onMounted(async () => {
  await loadTemplates()
})

const loadTemplates = async () => {
  loading.value = true
  try {
    templates.value = await getTemplates()
  } catch (err: any) {
    console.error('Failed to load templates:', err)
    templates.value = []
  } finally {
    loading.value = false
  }
}

const handleCreateTemplate = async () => {
  error.value = ''
  creating.value = true

  try {
    const template = await createTemplate(newTemplate.value)
    showCreateModal.value = false
    newTemplate.value = { name: '', description: null }
    await loadTemplates()
    // Navigate to the new template's detail page
    router.push(`/templates/${template.id}`)
  } catch (err: any) {
    error.value = err.message || 'Failed to create template'
  } finally {
    creating.value = false
  }
}

const handleDeleteTemplate = async (templateId: string, templateName: string) => {
  if (
    !confirm(
      `Are you sure you want to delete "${templateName}"? This action cannot be undone and will remove the template from all tracks using it.`
    )
  ) {
    return
  }

  try {
    await deleteTemplate(templateId)
    await loadTemplates()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete template'
    console.error('Failed to delete template:', err)
  }
}

useSeoMeta({
  title: 'Workflow Templates - MusicAid',
  description: 'Manage your production workflow templates',
})
</script>

