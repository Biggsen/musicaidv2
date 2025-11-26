<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Template Not Found</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <UButton color="primary" to="/templates">Back to Templates</UButton>
    </UCard>

    <!-- Template Detail -->
    <div v-else-if="template">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            to="/templates"
          >
            Back
          </UButton>
          <h1 class="text-3xl font-bold text-gray-900">{{ template.name }}</h1>
          <UBadge v-if="template.published" color="success">Published</UBadge>
          <UBadge v-else color="neutral">Draft</UBadge>
        </div>
        <p v-if="template.description" class="text-gray-600">{{ template.description }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Template Info -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Template Information</h2>
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  @click="showEditModal = true"
                >
                  Edit
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p class="text-gray-900">{{ template.name }}</p>
              </div>
              <div v-if="template.description">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p class="text-gray-900">{{ template.description }}</p>
              </div>
            </div>
          </UCard>

          <!-- Statuses Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Workflow Statuses</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="showAddStatusModal = true"
                >
                  Add Status
                </UButton>
              </div>
            </template>

            <div v-if="statuses.length === 0" class="text-center py-8">
              <UIcon name="i-heroicons-list-bullet" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600 mb-4">No statuses yet</p>
              <UButton color="primary" size="sm" icon="i-heroicons-plus" @click="showAddStatusModal = true">
                Add First Status
              </UButton>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(status, index) in statuses"
                :key="status.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-500">#{{ index + 1 }}</span>
                      <h3 class="text-lg font-semibold text-gray-900">{{ status.name }}</h3>
                    </div>
                    <p v-if="status.description" class="text-sm text-gray-600">{{ status.description }}</p>
                    <div class="mt-2 flex items-center gap-2">
                      <UBadge v-if="status.non_linear" color="warning">Non-linear</UBadge>
                      <span class="text-xs text-gray-500">
                        {{ getStepCount(status.id) }} step{{ getStepCount(status.id) !== 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      color="primary"
                      variant="ghost"
                      size="sm"
                      icon="i-heroicons-pencil"
                      @click="editStatus(status)"
                    >
                      Edit
                    </UButton>
                    <UButton
                      color="error"
                      variant="ghost"
                      size="sm"
                      icon="i-heroicons-trash"
                      @click="removeStatusFromTemplate(status.id)"
                    >
                      Remove
                    </UButton>
                  </div>
                </div>

                <!-- Steps for this status -->
                <div v-if="getStepsForStatus(status.id).length > 0" class="mt-3 pl-4 border-l-2 border-gray-200">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Steps</h4>
                    <UButton
                      color="primary"
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-plus"
                      @click="showAddStepModal = true; selectedStatusId = status.id"
                    >
                      Add Step
                    </UButton>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="step in getStepsForStatus(status.id)"
                      :key="step.id"
                      class="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-900">{{ step.name }}</span>
                        <UBadge size="xs" color="neutral">{{ step.type }}</UBadge>
                      </div>
                      <div class="flex items-center gap-1">
                        <UButton
                          color="primary"
                          variant="ghost"
                          size="xs"
                          icon="i-heroicons-pencil"
                          @click="editStep(step)"
                        />
                        <UButton
                          color="error"
                          variant="ghost"
                          size="xs"
                          icon="i-heroicons-x-mark"
                          @click="removeStepFromStatus(status.id, step.id)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="mt-3 pl-4 border-l-2 border-gray-200">
                  <p class="text-sm text-gray-500 mb-2">No steps yet</p>
                  <UButton
                    color="primary"
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-plus"
                    @click="showAddStepModal = true; selectedStatusId = status.id"
                  >
                    Add Step
                  </UButton>
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
              <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </template>
            <div class="space-y-2">
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-heroicons-plus"
                @click="showAddStatusModal = true"
              >
                Add Status
              </UButton>
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-heroicons-plus"
                @click="showCreateStepModal = true"
              >
                Create Step
              </UButton>
            </div>
          </UCard>

          <!-- Available Steps -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900">Available Steps</h3>
            </template>
            <div v-if="allSteps.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-500">No steps created yet</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="step in allSteps"
                :key="step.id"
                class="p-2 border border-gray-200 rounded text-sm"
              >
                <div class="font-medium text-gray-900">{{ step.name }}</div>
                <div class="text-xs text-gray-500">{{ step.type }}</div>
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
              <label for="edit-template-name" class="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <UInput
                id="edit-template-name"
                v-model="editForm.name"
                placeholder="Template name"
                required
                :disabled="saving"
              />
            </div>
            <div>
              <label for="edit-template-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                id="edit-template-description"
                v-model="editForm.description"
                placeholder="Description..."
                :rows="3"
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
              <label for="status-select" class="block text-sm font-medium text-gray-700 mb-1">
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
              <p class="mt-1 text-xs text-gray-500">
                Select an existing status or create a new one
              </p>
            </div>
            <UButton
              color="primary"
              variant="outline"
              block
              icon="i-heroicons-plus"
              @click="showCreateStatusModal = true"
            >
              Create New Status
            </UButton>
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

      <!-- Edit Status Modal -->
      <UModal v-model:open="showEditStatusModal" title="Edit Status">
        <template #body>
          <form id="edit-status-form" @submit.prevent="handleUpdateStatus" class="space-y-4">
            <div>
              <label for="edit-status-name" class="block text-sm font-medium text-gray-700 mb-1">
                Status Name
              </label>
              <UInput
                id="edit-status-name"
                v-model="editStatusForm.name"
                placeholder="e.g., Recording"
                required
                :disabled="editingStatus"
              />
            </div>
            <div>
              <label for="edit-status-key" class="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <UInput
                id="edit-status-key"
                v-model="editStatusForm.key"
                placeholder="recording"
                required
                :disabled="editingStatus"
              />
              <p class="mt-1 text-xs text-gray-500">Lowercase, no spaces (e.g., recording, mixing)</p>
            </div>
            <div>
              <label for="edit-status-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                id="edit-status-description"
                v-model="editStatusForm.description"
                placeholder="Describe this status..."
                :rows="2"
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
                <span class="text-sm font-medium text-gray-700">Non-linear (can skip around)</span>
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

      <!-- Create Status Modal -->
      <UModal v-model:open="showCreateStatusModal" title="Create New Status">
        <template #body>
          <form id="create-status-form" @submit.prevent="handleCreateStatus" class="space-y-4">
            <div>
              <label for="status-name" class="block text-sm font-medium text-gray-700 mb-1">
                Status Name
              </label>
              <UInput
                id="status-name"
                v-model="newStatus.name"
                placeholder="e.g., Recording"
                required
                :disabled="creatingStatus"
              />
            </div>
            <div>
              <label for="status-key" class="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <UInput
                id="status-key"
                v-model="newStatus.key"
                placeholder="recording"
                required
                :disabled="creatingStatus"
              />
              <p class="mt-1 text-xs text-gray-500">Lowercase, no spaces (e.g., recording, mixing)</p>
            </div>
            <div>
              <label for="status-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                id="status-description"
                v-model="newStatus.description"
                placeholder="Describe this status..."
                :rows="2"
                :disabled="creatingStatus"
              />
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="newStatus.non_linear"
                  :disabled="creatingStatus"
                  class="rounded border-gray-300"
                />
                <span class="text-sm font-medium text-gray-700">Non-linear (can skip around)</span>
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
              @click="showCreateStatusModal = false"
              :disabled="creatingStatus"
            >
              Cancel
            </UButton>
            <UButton type="submit" form="create-status-form" color="primary" :loading="creatingStatus">
              Create Status
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Add Step to Status Modal -->
      <UModal v-model:open="showAddStepModal" title="Add Step to Status">
        <template #body>
          <form id="add-step-form" @submit.prevent="handleAddStep" class="space-y-4">
            <div>
              <label for="step-select" class="block text-sm font-medium text-gray-700 mb-1">
                Select Step
              </label>
              <USelect
                id="step-select"
                v-model="selectedStepId"
                :items="availableStepOptions"
                placeholder="Select a step"
                required
                :disabled="addingStep"
              />
            </div>
            <UButton
              color="primary"
              variant="outline"
              block
              icon="i-heroicons-plus"
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
      <UModal v-model:open="showCreateStepModal" title="Create New Step">
        <template #body>
          <form id="create-step-form" @submit.prevent="handleCreateStep" class="space-y-4">
            <div>
              <label for="step-name" class="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <UInput
                id="step-name"
                v-model="newStep.name"
                placeholder="e.g., Record Vocals"
                required
                :disabled="creatingStep"
              />
            </div>
            <div>
              <label for="step-key" class="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <UInput
                id="step-key"
                v-model="newStep.key"
                placeholder="record-vocals"
                required
                :disabled="creatingStep"
              />
              <p class="mt-1 text-xs text-gray-500">Lowercase, no spaces (e.g., record-vocals)</p>
            </div>
            <div>
              <label for="step-type" class="block text-sm font-medium text-gray-700 mb-1">
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
              <label for="step-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                id="step-description"
                v-model="newStep.description"
                placeholder="Describe this step..."
                :rows="2"
                :disabled="creatingStep"
              />
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
      <UModal v-model:open="showEditStepModal" title="Edit Step">
        <template #body>
          <form id="edit-step-form" @submit.prevent="handleUpdateStep" class="space-y-4">
            <div>
              <label for="edit-step-name" class="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <UInput
                id="edit-step-name"
                v-model="editStepForm.name"
                placeholder="e.g., Record Vocals"
                required
                :disabled="editingStep"
              />
            </div>
            <div>
              <label for="edit-step-key" class="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <UInput
                id="edit-step-key"
                v-model="editStepForm.key"
                placeholder="record-vocals"
                required
                :disabled="editingStep"
              />
              <p class="mt-1 text-xs text-gray-500">Lowercase, no spaces (e.g., record-vocals)</p>
            </div>
            <div>
              <label for="edit-step-type" class="block text-sm font-medium text-gray-700 mb-1">
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
              <label for="edit-step-description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <UTextarea
                id="edit-step-description"
                v-model="editStepForm.description"
                placeholder="Describe this step..."
                :rows="2"
                :disabled="editingStep"
              />
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
  Template,
  TemplateUpdate,
  TrackStatus,
  TrackStatusInsert,
  TrackStatusUpdate,
  Step,
  StepInsert,
  StepUpdate,
} from '~/composables/useWorkflow'

const route = useRoute()
const router = useRouter()
const {
  getTemplateWithStatuses,
  updateTemplate,
  getTrackStatuses,
  getTrackStatusWithSteps,
  createTrackStatus,
  updateTrackStatus,
  getSteps,
  createStep,
  updateStep,
  addStatusToTemplate,
  removeStatusFromTemplate: removeStatusFromTemplateFunc,
  addStepToTrackStatus,
  removeStepFromTrackStatus,
} = useWorkflow()

const template = ref<Template | null>(null)
const statuses = ref<TrackStatus[]>([])
const allStatuses = ref<TrackStatus[]>([])
const allSteps = ref<Step[]>([])
const stepStatusMap = ref<Map<string, Step[]>>(new Map())
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveError = ref('')
const statusError = ref('')
const stepError = ref('')

// Modals
const showEditModal = ref(false)
const showAddStatusModal = ref(false)
const showCreateStatusModal = ref(false)
const showEditStatusModal = ref(false)
const showAddStepModal = ref(false)
const showCreateStepModal = ref(false)
const showEditStepModal = ref(false)

// Form states
const addingStatus = ref(false)
const creatingStatus = ref(false)
const editingStatus = ref(false)
const addingStep = ref(false)
const creatingStep = ref(false)
const editingStep = ref(false)

// Selected values
const selectedStatusId = ref<string | undefined>(undefined)
const selectedStepId = ref<string | undefined>(undefined)
const editingStatusId = ref<string | null>(null)
const editingStepId = ref<string | null>(null)

const editForm = ref<TemplateUpdate>({
  name: '',
  description: null,
})

const newStatus = ref<TrackStatusInsert>({
  name: '',
  key: '',
  description: null,
  non_linear: false,
})

const editStatusForm = ref<TrackStatusUpdate>({
  name: '',
  key: '',
  description: null,
  non_linear: false,
})

const newStep = ref<StepInsert>({
  name: '',
  key: '',
  type: 'NORMAL',
  description: null,
})

const editStepForm = ref<StepUpdate>({
  name: '',
  key: '',
  type: 'NORMAL',
  description: null,
})

const stepTypeOptions = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Text', value: 'TEXT' },
  { label: 'List', value: 'LIST' },
  { label: 'Record', value: 'RECORD' },
]

const availableStatusOptions = computed(() => {
  const usedStatusIds = new Set(statuses.value.map(s => s.id))
  return allStatuses.value
    .filter(s => !usedStatusIds.has(s.id))
    .map(s => ({
      label: s.name,
      value: s.id,
    }))
})

const availableStepOptions = computed(() => {
  if (!selectedStatusId.value) return []
  const usedStepIds = new Set(getStepsForStatus(selectedStatusId.value).map(s => s.id))
  return allSteps.value
    .filter(s => !usedStepIds.has(s.id))
    .map(s => ({
      label: `${s.name} (${s.type})`,
      value: s.id,
    }))
})

// Load data
onMounted(async () => {
  await Promise.all([loadTemplate(), loadAllStatuses(), loadAllSteps()])
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

const loadAllStatuses = async () => {
  try {
    allStatuses.value = await getTrackStatuses()
  } catch (err: any) {
    console.error('Failed to load statuses:', err)
  }
}

const loadAllSteps = async () => {
  try {
    allSteps.value = await getSteps()
  } catch (err: any) {
    console.error('Failed to load steps:', err)
  }
}

const getStepsForStatus = (statusId: string): Step[] => {
  return stepStatusMap.value.get(statusId) || []
}

const getStepCount = (statusId: string): number => {
  return getStepsForStatus(statusId).length
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

const handleCreateStatus = async () => {
  statusError.value = ''
  creatingStatus.value = true

  try {
    if (!/^[a-z0-9-]+$/.test(newStatus.value.key)) {
      statusError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    const status = await createTrackStatus(newStatus.value)
    await loadAllStatuses()
    selectedStatusId.value = status.id
    showCreateStatusModal.value = false
    // Auto-add to template
    if (template.value) {
      await handleAddStatus()
    }
  } catch (err: any) {
    statusError.value = err.message || 'Failed to create status'
  } finally {
    creatingStatus.value = false
  }
}

const removeStatusFromTemplate = async (statusId: string) => {
  if (!template.value) return
  if (!confirm('Are you sure you want to remove this status from the template?')) return

  try {
    await removeStatusFromTemplateFunc(template.value.id, statusId)
    await loadTemplate()
  } catch (err: any) {
    console.error('Failed to remove status:', err)
  }
}

const editStatus = (status: TrackStatus) => {
  editingStatusId.value = status.id
  editStatusForm.value = {
    name: status.name,
    key: status.key,
    description: status.description,
    non_linear: status.non_linear,
  }
  showEditStatusModal.value = true
}

const handleUpdateStatus = async () => {
  if (!editingStatusId.value) return

  statusError.value = ''
  editingStatus.value = true

  try {
    if (editStatusForm.value.key && !/^[a-z0-9-]+$/.test(editStatusForm.value.key)) {
      statusError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateTrackStatus(editingStatusId.value, editStatusForm.value)
    closeEditStatusModal()
    await loadTemplate()
    await loadAllStatuses()
  } catch (err: any) {
    statusError.value = err.message || 'Failed to update status'
  } finally {
    editingStatus.value = false
  }
}

const closeEditStatusModal = () => {
  showEditStatusModal.value = false
  editingStatusId.value = null
  editStatusForm.value = { name: '', key: '', description: null, non_linear: false }
  statusError.value = ''
}

const handleAddStep = async () => {
  if (!selectedStatusId.value || !selectedStepId.value) return

  stepError.value = ''
  addingStep.value = true

  try {
    const currentSteps = getStepsForStatus(selectedStatusId.value)
    const orderIndex = currentSteps.length
    await addStepToTrackStatus(selectedStatusId.value, selectedStepId.value, orderIndex)
    await loadTemplate()
    await loadAllSteps()
    showAddStepModal.value = false
    selectedStepId.value = undefined
    selectedStatusId.value = undefined
  } catch (err: any) {
    stepError.value = err.message || 'Failed to add step'
  } finally {
    addingStep.value = false
  }
}

const handleCreateStep = async () => {
  stepError.value = ''
  creatingStep.value = true

  try {
    if (!/^[a-z0-9-]+$/.test(newStep.value.key)) {
      stepError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    const step = await createStep(newStep.value)
    await loadAllSteps()
    selectedStepId.value = step.id
    showCreateStepModal.value = false
    // Auto-add to selected status if one is selected
    if (selectedStatusId.value) {
      await handleAddStep()
    }
  } catch (err: any) {
    stepError.value = err.message || 'Failed to create step'
  } finally {
    creatingStep.value = false
    newStep.value = { name: '', key: '', type: 'NORMAL', description: null }
  }
}

const editStep = (step: Step) => {
  editingStepId.value = step.id
  editStepForm.value = {
    name: step.name,
    key: step.key,
    type: step.type,
    description: step.description,
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
    await loadTemplate()
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
  editStepForm.value = { name: '', key: '', type: 'NORMAL', description: null }
  stepError.value = ''
}

const removeStepFromStatus = async (statusId: string, stepId: string) => {
  if (!confirm('Are you sure you want to remove this step from the status?')) return

  try {
    await removeStepFromTrackStatus(statusId, stepId)
    await loadTemplate()
  } catch (err: any) {
    console.error('Failed to remove step:', err)
  }
}

useSeoMeta({
  title: () => (template.value ? `${template.value.name} - MusicAid` : 'Template - MusicAid'),
})
</script>

