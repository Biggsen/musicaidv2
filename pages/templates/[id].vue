<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Template Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/templates">Back to Templates</UButton>
    </UCard>

    <!-- Template Detail -->
    <div v-else-if="template">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            to="/templates"
          >
            Back
          </UButton>
        </div>
        <UPageHeader
          headline="Template"
          :title="template.name"
          :description="template.description || undefined"
          :ui="{ description: 'max-w-[60ch]' }"
        >
          <template #links>
            <div class="flex items-center gap-3">
              <UBadge v-if="template.published" color="success">Published</UBadge>
              <UBadge v-else color="neutral">Draft</UBadge>
              <UDropdownMenu :items="getTemplateMenuItems()" :content="{ align: 'end' }">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-ph-list"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UPageHeader>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Statuses Section -->
          <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-default">Workflow Statuses</h2>
            <UButton
              color="primary"
              size="sm"
              icon="i-ph-plus"
              @click="showAddStatusModal = true"
            >
              Add Status
            </UButton>
          </div>
        </template>

        <div v-if="statuses.length === 0" class="text-center py-8">
          <UIcon name="i-ph-list-bullet" class="w-12 h-12 text-dimmed mx-auto mb-3" />
          <p class="text-muted mb-4">No statuses yet</p>
          <UButton color="primary" size="sm" icon="i-ph-plus" @click="showAddStatusModal = true">
            Add First Status
          </UButton>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(status, index) in statuses"
            :key="status.id"
            class="p-4 border border-default rounded-lg"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-muted">#{{ index + 1 }}</span>
                  <NuxtLink
                    :to="`/statuses/${status.id}`"
                    class="text-lg font-semibold text-default hover:text-primary"
                  >
                    {{ status.name }}
                  </NuxtLink>
                </div>
                <p v-if="status.description" class="text-sm text-muted">{{ status.description }}</p>
                <div class="mt-2 flex items-center gap-2">
                  <UBadge v-if="status.non_linear" color="warning">Non-linear</UBadge>
                  <UBadge v-if="status.published" color="success">Published</UBadge>
                  <UBadge v-else color="neutral">Draft</UBadge>
                </div>
              </div>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                icon="i-ph-trash"
                @click="removeStatusFromTemplate(status.id)"
              >
                Remove
              </UButton>
            </div>

            <!-- Steps for this status -->
            <div v-if="getStepsForStatus(status.id).length > 0" class="mt-3 pl-4 border-l-2 border-default">
              <h4 class="text-sm font-medium text-default mb-2">Steps</h4>
              <div class="space-y-2">
                <div
                  v-for="(step, stepIndex) in getStepsForStatus(status.id)"
                  :key="step.id"
                  class="flex items-center gap-2 p-2 bg-muted rounded"
                >
                  <span class="text-xs font-medium text-muted">#{{ stepIndex + 1 }}</span>
                  <div class="flex items-center gap-2 flex-1 flex-wrap">
                    <UIcon name="i-ph-check-circle" class="w-4 h-4 text-dimmed" />
                    <span class="text-sm text-default">{{ step.name }}</span>
                    <UBadge size="xs" color="neutral">{{ step.type }}</UBadge>
                    <UBadge
                      v-for="tag in (step.tags || [])"
                      :key="tag"
                      size="xs"
                      color="primary"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="mt-3 pl-4 border-l-2 border-default">
              <p class="text-sm text-muted">No steps yet</p>
            </div>
          </div>
        </div>
      </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-default">Quick Actions</h3>
            </template>
            <div class="space-y-2">
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-ph-plus"
                @click="showAddStatusModal = true"
              >
                Add Status
              </UButton>
            </div>
          </UCard>

          <!-- Available Statuses -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-default">Available Statuses</h3>
                <USelect
                  v-model="statusSortBy"
                  :items="statusSortOptions"
                  size="sm"
                  class="w-32"
                />
              </div>
            </template>
            <div class="mb-4">
              <UInput
                v-model="statusSearchQuery"
                placeholder="Search statuses..."
                icon="i-ph-magnifying-glass"
                clearable
              />
            </div>
            <div v-if="availableStatusesList.length === 0" class="text-center py-4">
              <p class="text-sm text-muted">All statuses are in this template</p>
            </div>
            <div v-else-if="filteredAvailableStatuses.length === 0" class="text-center py-4">
              <p class="text-sm text-muted">No statuses match your search</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="status in filteredAvailableStatuses"
                :key="status.id"
                class="p-2 border border-default rounded text-sm flex items-start justify-between"
              >
                <div class="flex-1">
                  <NuxtLink
                    :to="`/statuses/${status.id}`"
                    class="font-medium text-default hover:text-primary"
                  >
                    {{ status.name }}
                  </NuxtLink>
                  <div v-if="status.description" class="text-xs text-muted mt-1">{{ status.description }}</div>
                  <div class="flex items-center gap-1 mt-1">
                    <UBadge v-if="status.non_linear" size="xs" color="warning">Non-linear</UBadge>
                    <UBadge v-if="status.published" size="xs" color="success">Published</UBadge>
                    <UBadge v-else size="xs" color="neutral">Draft</UBadge>
                  </div>
                </div>
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-ph-plus"
                  size="sm"
                  @click="addStatusQuick(status.id)"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Edit Template Modal -->
      <UModal v-model:open="showEditModal" title="Edit Template">
        <template #body>
          <form id="edit-template-form" @submit.prevent="handleUpdateTemplate" class="space-y-4">
            <div>
              <label for="edit-template-name" class="block text-sm font-medium text-default mb-1">
                Template Name
              </label>
              <UInput
                id="edit-template-name"
                v-model="editForm.name"
                placeholder="Template name"
                class="w-full"
                required
                :disabled="saving"
              />
            </div>
            <div>
              <label for="edit-template-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="edit-template-description"
                v-model="editForm.description"
                placeholder="Description..."
                :rows="5"
                class="w-full"
                :disabled="saving"
              />
            </div>
            <UAlert v-if="saveError" color="error" variant="soft" :title="saveError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="showEditModal = false" :disabled="saving">
              Cancel
            </UButton>
            <UButton type="submit" form="edit-template-form" color="primary" :loading="saving">
              Save Changes
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Add Status to Template Modal -->
      <UModal v-model:open="showAddStatusModal" title="Add Status to Template">
        <template #body>
          <form id="add-status-form" @submit.prevent="handleAddStatus" class="space-y-4">
            <div>
              <label for="status-select" class="block text-sm font-medium text-default mb-1">
                Select Status
              </label>
              <USelect
                id="status-select"
                v-model="selectedStatusId"
                :items="availableStatusOptions"
                placeholder="Select a status"
                required
                :disabled="addingStatus"
              />
              <p class="mt-1 text-xs text-muted">
                Select an existing status. To create a new status, go to the <NuxtLink to="/statuses" class="text-primary hover:underline">Statuses page</NuxtLink>.
              </p>
            </div>
            <UAlert v-if="statusError" color="error" variant="soft" :title="statusError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showAddStatusModal = false"
              :disabled="addingStatus"
            >
              Cancel
            </UButton>
            <UButton type="submit" form="add-status-form" color="primary" :loading="addingStatus">
              Add Status
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type {
  Template,
  TemplateUpdate,
  TrackStatus,
  Step,
} from '~/composables/useWorkflow'

const route = useRoute()
const router = useRouter()
const {
  getTemplateWithStatuses,
  updateTemplate,
  deleteTemplate,
  getTrackStatuses,
  getTrackStatusWithSteps,
  addStatusToTemplate,
  removeStatusFromTemplate: removeStatusFromTemplateFunc,
} = useWorkflow()

const template = ref<Template | null>(null)
const statuses = ref<TrackStatus[]>([])
const allStatuses = ref<TrackStatus[]>([])
const stepStatusMap = ref<Map<string, Step[]>>(new Map())
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveError = ref('')
const statusError = ref('')

// Modals
const showEditModal = ref(false)
const showAddStatusModal = ref(false)

// Form states
const addingStatus = ref(false)

// Selected values
const selectedStatusId = ref<string | undefined>(undefined)
const statusSearchQuery = ref('')
const statusSortBy = ref<'name' | 'created'>('name')

const statusSortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Created', value: 'created' },
]

const editForm = ref<TemplateUpdate>({
  name: '',
  description: null,
})

const availableStatusOptions = computed(() => {
  const usedStatusIds = new Set(statuses.value.map(s => s.id))
  return allStatuses.value
    .filter(s => !usedStatusIds.has(s.id))
    .map(s => ({
      label: s.name,
      value: s.id,
    }))
})

const availableStatusesList = computed(() => {
  const usedStatusIds = new Set(statuses.value.map(s => s.id))
  return allStatuses.value.filter(s => !usedStatusIds.has(s.id))
})

const filteredAvailableStatuses = computed(() => {
  let statusList = availableStatusesList.value

  // Apply search filter
  if (statusSearchQuery.value.trim()) {
    const query = statusSearchQuery.value.toLowerCase().trim()
    statusList = statusList.filter(status => 
      status.name.toLowerCase().includes(query) ||
      (status.description && status.description.toLowerCase().includes(query))
    )
  }

  // Apply sorting
  const sorted = [...statusList].sort((a, b) => {
    switch (statusSortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  return sorted
})

// Load data
onMounted(async () => {
  await Promise.all([loadTemplate(), loadAllStatuses()])
})

const loadTemplate = async () => {
  loading.value = true
  try {
    const templateId = route.params.id as string
    const templateData = await getTemplateWithStatuses(templateId)
    if (!templateData) {
      error.value = 'Template not found'
      return
    }

    template.value = templateData
    statuses.value = templateData.statuses || []
    editForm.value = {
      name: templateData.name,
      description: templateData.description,
    }

    // Load steps for each status
    for (const status of statuses.value) {
      const statusWithSteps = await getTrackStatusWithSteps(status.id)
      if (statusWithSteps && statusWithSteps.steps) {
        stepStatusMap.value.set(status.id, statusWithSteps.steps)
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load template'
  } finally {
    loading.value = false
  }
}

const getStepsForStatus = (statusId: string): Step[] => {
  return stepStatusMap.value.get(statusId) || []
}

const loadAllStatuses = async () => {
  try {
    allStatuses.value = await getTrackStatuses()
  } catch (err: any) {
    // Failed to load statuses
  }
}

const getTemplateMenuItems = () => {
  if (!template.value) return []
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => {
          editForm.value = {
            name: template.value!.name,
            description: template.value!.description,
          }
          showEditModal.value = true
        }
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteTemplate()
      }
    ]
  ]
}

const handleDeleteTemplate = async () => {
  if (!template.value) return

  if (!confirm(`Are you sure you want to delete "${template.value.name}"? This action cannot be undone and will remove the template from all tracks using it.`)) {
    return
  }

  try {
    await deleteTemplate(template.value.id)
    router.push('/templates')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete template'
    // Failed to delete template
  }
}

const handleUpdateTemplate = async () => {
  if (!template.value) return

  saveError.value = ''
  saving.value = true

  try {
    await updateTemplate(template.value.id, editForm.value)
    template.value = { ...template.value, ...editForm.value }
    showEditModal.value = false
  } catch (err: any) {
    saveError.value = err.message || 'Failed to update template'
  } finally {
    saving.value = false
  }
}

const handleAddStatus = async () => {
  if (!template.value || !selectedStatusId.value) return

  statusError.value = ''
  addingStatus.value = true

  try {
    const orderIndex = statuses.value.length
    await addStatusToTemplate(template.value.id, selectedStatusId.value, orderIndex)
    await loadTemplate()
    await loadAllStatuses()
    showAddStatusModal.value = false
    selectedStatusId.value = undefined
  } catch (err: any) {
    statusError.value = err.message || 'Failed to add status'
  } finally {
    addingStatus.value = false
  }
}

const removeStatusFromTemplate = async (statusId: string) => {
  if (!template.value) return
  if (!confirm('Are you sure you want to remove this status from the template?')) return

  try {
    await removeStatusFromTemplateFunc(template.value.id, statusId)
    await loadTemplate()
    await loadAllStatuses()
  } catch (err: any) {
    statusError.value = err.message || 'Failed to remove status'
  }
}

const addStatusQuick = async (statusId: string) => {
  if (!template.value) return

  statusError.value = ''
  addingStatus.value = true

  try {
    const orderIndex = statuses.value.length
    await addStatusToTemplate(template.value.id, statusId, orderIndex)
    await loadTemplate()
    await loadAllStatuses()
  } catch (err: any) {
    statusError.value = err.message || 'Failed to add status'
  } finally {
    addingStatus.value = false
  }
}

useSeoMeta({
  title: () => (template.value ? `${template.value.name} - MusicAid` : 'Template - MusicAid'),
})
</script>

