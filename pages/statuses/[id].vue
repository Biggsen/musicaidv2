<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Status Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/statuses">Back to Statuses</UButton>
    </UCard>

    <!-- Status Detail -->
    <div v-else-if="status">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            to="/statuses"
          >
            Back
          </UButton>
        </div>
        <UPageHeader
          headline="Status"
          :title="status.name"
          :description="status.description || undefined"
          :ui="{ description: 'max-w-[60ch]' }"
        >
          <template #links>
            <div class="flex items-center gap-3">
              <UBadge v-if="status.published" color="success">Published</UBadge>
              <UBadge v-else color="neutral">Draft</UBadge>
              <UBadge v-if="status.non_linear" color="warning">Non-linear</UBadge>
              <UDropdownMenu :items="getStatusMenuItems()" :content="{ align: 'end' }">
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
          <!-- Steps Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-default">Steps</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-ph-plus"
                  @click="showAddStepModal = true"
                >
                  Add Step
                </UButton>
              </div>
            </template>

            <div v-if="steps.length === 0" class="text-center py-8">
              <UIcon name="i-ph-list-bullet" class="w-12 h-12 text-dimmed mx-auto mb-3" />
              <p class="text-muted mb-4">No steps yet</p>
              <UButton color="primary" size="sm" icon="i-ph-plus" @click="showAddStepModal = true">
                Add First Step
              </UButton>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(step, index) in steps"
                :key="step.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center gap-3 flex-1">
                  <span class="text-sm font-medium text-muted">#{{ index + 1 }}</span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="font-semibold text-default">{{ step.name }}</span>
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
                    <p v-if="step.description" class="text-sm text-muted">{{ step.description }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    color="primary"
                    variant="ghost"
                    size="xs"
                    icon="i-ph-pencil"
                    @click="editStep(step)"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    size="xs"
                    icon="i-ph-x"
                    @click="removeStepFromStatus(step.id)"
                  />
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
                @click="showAddStepModal = true"
              >
                Add Step
              </UButton>
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-ph-plus"
                @click="showCreateStepModal = true"
              >
                Create Step
              </UButton>
            </div>
          </UCard>

          <!-- Available Steps -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-default">Available Steps</h3>
                <USelect
                  v-model="stepSortBy"
                  :items="stepSortOptions"
                  size="sm"
                  class="w-32"
                />
              </div>
            </template>
            <div class="mb-4">
              <UInput
                v-model="stepSearchQuery"
                placeholder="Search steps..."
                icon="i-ph-magnifying-glass"
                clearable
              />
            </div>
            <div v-if="allSteps.length === 0" class="text-center py-4">
              <p class="text-sm text-muted">No steps created yet</p>
            </div>
            <div v-else-if="filteredSteps.length === 0" class="text-center py-4">
              <p class="text-sm text-muted">No steps match your search</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="step in filteredSteps"
                :key="step.id"
                class="p-2 border border-gray-200 rounded text-sm flex items-start justify-between"
              >
                <div class="flex-1">
                  <div class="font-medium text-default">{{ step.name }}</div>
                  <div v-if="step.description" class="text-xs text-muted mt-1">{{ step.description }}</div>
                  <div class="flex items-center gap-1 mt-1 flex-wrap">
                    <span class="text-xs text-muted">{{ step.type }}</span>
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
                <div class="flex items-center gap-1">
                  <UButton
                    color="primary"
                    variant="outline"
                    size="xs"
                    icon="i-ph-plus"
                    :loading="addingStepId === step.id"
                    :disabled="addingStepId !== null"
                    @click="addStepQuick(step.id)"
                  >
                    Add
                  </UButton>
                  <UDropdownMenu 
                    :items="getStepMenuItems(step)" 
                    :content="{ align: 'end' }"
                  >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-ph-list"
                      size="sm"
                      @click.stop
                    />
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Edit Status Modal -->
      <UModal v-model:open="showEditStatusModal" title="Edit Status">
        <template #body>
          <form id="edit-status-form" @submit.prevent="handleUpdateStatus" class="space-y-4">
            <div>
              <label for="edit-status-name" class="block text-sm font-medium text-default mb-1">
                Status Name
              </label>
              <UInput
                id="edit-status-name"
                v-model="editStatusForm.name"
                placeholder="e.g., Recording"
                required
                :disabled="editingStatus"
                class="w-full"
              />
            </div>
            <div>
              <label for="edit-status-key" class="block text-sm font-medium text-default mb-1">
                Key
              </label>
              <UInput
                id="edit-status-key"
                v-model="editStatusForm.key"
                placeholder="recording"
                required
                :disabled="editingStatus"
              />
              <p class="mt-1 text-xs text-muted">Lowercase, no spaces (e.g., recording, mixing)</p>
            </div>
            <div>
              <label for="edit-status-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="edit-status-description"
                v-model="editStatusForm.description"
                placeholder="Describe this status..."
                :rows="5"
                class="w-full"
                :disabled="editingStatus"
              />
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="editStatusForm.non_linear"
                  :disabled="editingStatus"
                  class="rounded border-gray-300"
                />
                <span class="text-sm font-medium text-default">Non-linear (can skip around)</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="editStatusForm.published"
                  :disabled="editingStatus"
                  class="rounded border-gray-300"
                />
                <span class="text-sm font-medium text-default">Published</span>
              </label>
            </div>
            <UAlert v-if="statusError" color="error" variant="soft" :title="statusError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeEditStatusModal"
              :disabled="editingStatus"
            >
              Cancel
            </UButton>
            <UButton type="submit" form="edit-status-form" color="primary" :loading="editingStatus">
              Save Changes
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Add Step to Status Modal -->
      <UModal v-model:open="showAddStepModal" title="Add Step to Status">
        <template #body>
          <form id="add-step-form" @submit.prevent="handleAddStep" class="space-y-4">
            <div>
              <label for="step-select" class="block text-sm font-medium text-default mb-1">
                Select Step
              </label>
              <USelectMenu
                id="step-select"
                v-model="selectedStepId"
                :items="availableStepOptions"
                placeholder="Select a step"
                value-key="value"
                :disabled="addingStep"
                class="w-full"
              />
            </div>
            <UButton
              color="primary"
              variant="outline"
              block
              icon="i-ph-plus"
              @click="showCreateStepModal = true"
            >
              Create New Step
            </UButton>
            <UAlert v-if="stepError" color="error" variant="soft" :title="stepError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="showAddStepModal = false" :disabled="addingStep">
              Cancel
            </UButton>
            <UButton type="submit" form="add-step-form" color="primary" :loading="addingStep">
              Add Step
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Create Step Modal -->
      <UModal v-model:open="showCreateStepModal" title="Create New Step" :dismissible="false">
        <template #body>
          <form id="create-step-form" @submit.prevent="handleCreateStep" class="space-y-4">
            <div>
              <label for="step-name" class="block text-sm font-medium text-default mb-1">
                Step Name
              </label>
              <UInput
                id="step-name"
                v-model="newStep.name"
                placeholder="e.g., Record Vocals"
                required
                :disabled="creatingStep"
                class="w-full"
              />
            </div>
            <div>
              <label for="step-type" class="block text-sm font-medium text-default mb-1">
                Step Type
              </label>
              <USelect
                id="step-type"
                v-model="newStep.type"
                :items="stepTypeOptions"
                required
                :disabled="creatingStep"
              />
            </div>
            <div>
              <label for="step-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="step-description"
                v-model="newStep.description"
                placeholder="Describe this step..."
                :rows="5"
                class="w-full"
                :disabled="creatingStep"
              />
            </div>
            <div>
              <label for="step-tags" class="block text-sm font-medium text-default mb-1">
                Tags
              </label>
              <USelectMenu
                id="step-tags"
                v-model="newStep.tags"
                :items="tagOptions"
                placeholder="Select or search tags..."
                multiple
                :disabled="creatingStep"
              />
              <p class="mt-1 text-xs text-muted">Search and select from existing tags</p>
            </div>
            <UAlert v-if="stepError" color="error" variant="soft" :title="stepError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showCreateStepModal = false"
              :disabled="creatingStep"
            >
              Cancel
            </UButton>
            <UButton type="submit" form="create-step-form" color="primary" :loading="creatingStep">
              Create Step
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Edit Step Modal -->
      <UModal v-model:open="showEditStepModal" title="Edit Step" :dismissible="false">
        <template #body>
          <form id="edit-step-form" @submit.prevent="handleUpdateStep" class="space-y-4">
            <div>
              <label for="edit-step-name" class="block text-sm font-medium text-default mb-1">
                Step Name
              </label>
              <UInput
                id="edit-step-name"
                v-model="editStepForm.name"
                placeholder="e.g., Record Vocals"
                required
                :disabled="editingStep"
                class="w-full"
              />
            </div>
            <div>
              <label for="edit-step-key" class="block text-sm font-medium text-default mb-1">
                Key
              </label>
              <UInput
                id="edit-step-key"
                v-model="editStepForm.key"
                placeholder="record-vocals"
                required
                :disabled="editingStep"
              />
              <p class="mt-1 text-xs text-muted">Lowercase, no spaces (e.g., record-vocals)</p>
            </div>
            <div>
              <label for="edit-step-type" class="block text-sm font-medium text-default mb-1">
                Step Type
              </label>
              <USelect
                id="edit-step-type"
                v-model="editStepForm.type"
                :items="stepTypeOptions"
                required
                :disabled="editingStep"
              />
            </div>
            <div>
              <label for="edit-step-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="edit-step-description"
                v-model="editStepForm.description"
                placeholder="Describe this step..."
                :rows="5"
                class="w-full"
                :disabled="editingStep"
              />
            </div>
            <div>
              <label for="edit-step-tags" class="block text-sm font-medium text-default mb-1">
                Tags
              </label>
              <USelectMenu
                id="edit-step-tags"
                v-model="editStepForm.tags"
                :items="tagOptions"
                placeholder="Select or search tags..."
                multiple
                :disabled="editingStep"
              />
              <p class="mt-1 text-xs text-muted">Search and select from existing tags</p>
            </div>
            <UAlert v-if="stepError" color="error" variant="soft" :title="stepError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeEditStepModal"
              :disabled="editingStep"
            >
              Cancel
            </UButton>
            <UButton type="submit" form="edit-step-form" color="primary" :loading="editingStep">
              Save Changes
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
  TrackStatus,
  TrackStatusUpdate,
  Step,
  StepInsert,
  StepUpdate,
} from '~/composables/useWorkflow'

const route = useRoute()
const router = useRouter()
const {
  getTrackStatus,
  getTrackStatusWithSteps,
  updateTrackStatus,
  deleteTrackStatus,
  getSteps,
  createStep,
  updateStep,
  deleteStep,
  addStepToTrackStatus,
  removeStepFromTrackStatus,
} = useWorkflow()

const status = ref<TrackStatus | null>(null)
const steps = ref<Step[]>([])
const allSteps = ref<Step[]>([])
const loading = ref(true)
const error = ref('')
const statusError = ref('')
const stepError = ref('')

// Modals
const showEditStatusModal = ref(false)
const showAddStepModal = ref(false)
const showCreateStepModal = ref(false)
const showEditStepModal = ref(false)

// Form states
const editingStatus = ref(false)
const addingStep = ref(false)
const creatingStep = ref(false)
const editingStep = ref(false)
const addingStepId = ref<string | null>(null)

// Selected values
const selectedStepId = ref<string | undefined>(undefined)
const editingStepId = ref<string | null>(null)
const stepSearchQuery = ref('')
const stepSortBy = ref<'name' | 'type' | 'created'>('name')

const stepSortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Type', value: 'type' },
  { label: 'Created', value: 'created' },
]

const editStatusForm = ref<TrackStatusUpdate>({
  name: '',
  key: '',
  description: null,
  non_linear: false,
  published: false,
})

const newStep = ref<StepInsert>({
  name: '',
  type: 'NORMAL',
  description: null,
  tags: [] as string[],
})

const editStepForm = ref<StepUpdate>({
  name: '',
  key: '',
  type: 'NORMAL',
  description: null,
  tags: [] as string[],
})

const stepTypeOptions = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Text', value: 'TEXT' },
  { label: 'List', value: 'LIST' },
  { label: 'Record', value: 'RECORD' },
]

const availableStepOptions = computed(() => {
  const usedStepIds = new Set(steps.value.map(s => s.id))
  return allSteps.value
    .filter(s => !usedStepIds.has(s.id))
    .map(s => ({
      label: `${s.name} (${s.type})`,
      value: s.id,
    }))
})

// Collect all unique tags from existing steps for autocomplete
const tagOptions = computed<string[]>(() => {
  const tagSet = new Set<string>()
  allSteps.value.forEach(step => {
    if (step.tags && step.tags.length > 0) {
      step.tags.forEach(tag => {
        if (tag && tag.trim()) {
          tagSet.add(tag.trim())
        }
      })
    }
  })
  return Array.from(tagSet).sort()
})

// Load data
onMounted(async () => {
  await Promise.all([loadStatus(), loadAllSteps()])
})

const loadStatus = async () => {
  loading.value = true
  try {
    const statusId = route.params.id as string
    const statusData = await getTrackStatusWithSteps(statusId)
    if (!statusData) {
      error.value = 'Status not found'
      return
    }

    status.value = statusData
    steps.value = statusData.steps || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load status'
  } finally {
    loading.value = false
  }
}

const loadAllSteps = async () => {
  try {
    allSteps.value = await getSteps()
  } catch (err: any) {
    // Failed to load steps
  }
}

const filteredSteps = computed(() => {
  let stepList = allSteps.value

  // Apply search filter
  if (stepSearchQuery.value.trim()) {
    const query = stepSearchQuery.value.toLowerCase().trim()
    stepList = stepList.filter(step => 
      step.name.toLowerCase().includes(query) ||
      step.type.toLowerCase().includes(query) ||
      (step.description && step.description.toLowerCase().includes(query)) ||
      (step.tags && step.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Apply sorting
  const sorted = [...stepList].sort((a, b) => {
    switch (stepSortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  return sorted
})

const getStatusMenuItems = () => {
  if (!status.value) return []
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => editStatus()
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteStatus()
      }
    ]
  ]
}

const editStatus = () => {
  if (!status.value) return
  editStatusForm.value = {
    name: status.value.name,
    key: status.value.key,
    description: status.value.description,
    non_linear: status.value.non_linear,
    published: status.value.published,
  }
  showEditStatusModal.value = true
}

const handleUpdateStatus = async () => {
  if (!status.value) return

  statusError.value = ''
  editingStatus.value = true

  try {
    if (editStatusForm.value.key && !/^[a-z0-9-]+$/.test(editStatusForm.value.key)) {
      statusError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    const updated = await updateTrackStatus(status.value.id, editStatusForm.value)
    closeEditStatusModal()
    status.value = updated
  } catch (err: any) {
    statusError.value = err.message || 'Failed to update status'
  } finally {
    editingStatus.value = false
  }
}

const closeEditStatusModal = () => {
  showEditStatusModal.value = false
  editStatusForm.value = { name: '', key: '', description: null, non_linear: false, published: false }
  statusError.value = ''
}

const handleDeleteStatus = async () => {
  if (!status.value) return

  if (!confirm(`Are you sure you want to delete "${status.value.name}"? This action cannot be undone and may affect templates using this status.`)) {
    return
  }

  try {
    await deleteTrackStatus(status.value.id)
    router.push('/statuses')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete status'
  }
}

const handleAddStep = async () => {
  if (!status.value || !selectedStepId.value) return

  stepError.value = ''
  addingStep.value = true

  try {
    const orderIndex = steps.value.length
    await addStepToTrackStatus(status.value.id, selectedStepId.value, orderIndex)
    await loadStatus()
    await loadAllSteps()
    showAddStepModal.value = false
    selectedStepId.value = undefined
  } catch (err: any) {
    stepError.value = err.message || 'Failed to add step'
  } finally {
    addingStep.value = false
  }
}

const addStepQuick = async (stepId: string) => {
  if (!status.value) return

  stepError.value = ''
  addingStepId.value = stepId

  try {
    const orderIndex = steps.value.length
    await addStepToTrackStatus(status.value.id, stepId, orderIndex)
    await loadStatus()
    await loadAllSteps()
  } catch (err: any) {
    stepError.value = err.message || 'Failed to add step'
  } finally {
    addingStepId.value = null
  }
}

const handleCreateStep = async () => {
  stepError.value = ''
  creatingStep.value = true

  try {
    const step = await createStep(newStep.value)
    await loadAllSteps()
    selectedStepId.value = step.id
    showCreateStepModal.value = false
    // Auto-add to status if we're on the add step modal
    if (showAddStepModal.value && status.value) {
      await handleAddStep()
    } else if (status.value) {
      // Otherwise, add it directly to the status
      const orderIndex = steps.value.length
      await addStepToTrackStatus(status.value.id, step.id, orderIndex)
      await loadStatus()
    }
    // Reset form
    newStep.value = { name: '', type: 'NORMAL', description: null, tags: [] as string[] }
  } catch (err: any) {
    stepError.value = err.message || 'Failed to create step'
  } finally {
    creatingStep.value = false
  }
}

const getStepMenuItems = (step: Step) => {
  const stepId = step.id
  const stepName = step.name
  const stepData = step
  
  const handleEdit = () => {
    editStep(stepData)
  }
  
  const handleDelete = () => {
    handleDeleteStep(stepId, stepName)
  }
  
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: handleEdit
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: handleDelete
      }
    ]
  ]
}

const handleDeleteStep = async (stepId: string, stepName: string) => {
  if (!confirm(`Are you sure you want to delete "${stepName}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deleteStep(stepId)
    await loadAllSteps()
    await loadStatus()
  } catch (err: any) {
    stepError.value = err.message || 'Failed to delete step'
  }
}

const editStep = (step: Step) => {
  editingStepId.value = step.id
  editStepForm.value = {
    name: step.name,
    key: step.key,
    type: step.type,
    description: step.description,
    tags: (step.tags || []) as string[],
  }
  showEditStepModal.value = true
}

const handleUpdateStep = async () => {
  if (!editingStepId.value) return

  stepError.value = ''
  editingStep.value = true

  try {
    if (editStepForm.value.key && !/^[a-z0-9-]+$/.test(editStepForm.value.key)) {
      stepError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateStep(editingStepId.value, editStepForm.value)
    closeEditStepModal()
    await loadStatus()
    await loadAllSteps()
  } catch (err: any) {
    stepError.value = err.message || 'Failed to update step'
  } finally {
    editingStep.value = false
  }
}

const closeEditStepModal = () => {
  showEditStepModal.value = false
  editingStepId.value = null
  editStepForm.value = { name: '', key: '', type: 'NORMAL', description: null, tags: [] as string[] }
  stepError.value = ''
}

const removeStepFromStatus = async (stepId: string) => {
  if (!status.value) return
  if (!confirm('Are you sure you want to remove this step from the status?')) return

  try {
    await removeStepFromTrackStatus(status.value.id, stepId)
    await loadStatus()
  } catch (err: any) {
    stepError.value = err.message || 'Failed to remove step'
  }
}

useSeoMeta({
  title: () => (status.value ? `${status.value.name} - MusicAid` : 'Status - MusicAid'),
})
</script>

