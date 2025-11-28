<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UPageHeader
        title="Workflow Steps"
        description="Manage your workflow steps"
      >
        <template #links>
          <UButton
            color="primary"
            size="lg"
            icon="i-ph-plus"
            @click="showCreateModal = true"
          >
            Create Step
          </UButton>
        </template>
      </UPageHeader>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex items-center gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search steps..."
        icon="i-ph-magnifying-glass"
        clearable
        class="max-w-md"
      />
      <USelect
        v-model="typeFilter"
        :items="typeFilterOptions"
        placeholder="All Types"
        class="w-48"
      />
      <div class="flex gap-2">
        <UButton
          :color="viewMode === 'grid' ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-ph-grid-four"
          @click="viewMode = 'grid'"
        />
        <UButton
          :color="viewMode === 'table' ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-ph-table"
          @click="viewMode = 'table'"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredSteps.length === 0" class="text-center py-12">
      <UIcon name="i-ph-check-circle" class="w-16 h-16 text-dimmed mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">
        {{ searchQuery || typeFilter ? 'No steps match your filters' : 'No steps yet' }}
      </h3>
      <p class="text-muted mb-6">
        {{ searchQuery || typeFilter ? 'Try adjusting your search or filters' : 'Create your first workflow step to get started' }}
      </p>
      <UButton v-if="!searchQuery && !typeFilter" color="primary" icon="i-ph-plus" @click="showCreateModal = true">
        Create Step
      </UButton>
    </UCard>

    <!-- Steps Grid -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="step in filteredSteps"
        :key="step.id"
        class="hover:shadow-lg transition-shadow overflow-visible"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-default mb-2">{{ step.name }}</h3>
            <p v-if="step.description" class="text-sm text-muted mb-4">
              {{ step.description }}
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge v-if="step.published" color="success">Published</UBadge>
              <UBadge v-else color="neutral">Draft</UBadge>
              <UBadge :color="getTypeColor(step.type)">{{ step.type }}</UBadge>
              <UBadge
                v-for="tag in (step.tags || [])"
                :key="tag"
                size="sm"
                color="primary"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>
          <UDropdownMenu 
            :items="getStepMenuItems(step)" 
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ph-list"
              @click.stop
            />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>

    <!-- Steps Table -->
    <UCard v-else>
      <UTable :data="tableRows" :columns="tableColumns as any">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-default">{{ row.original.name }}</span>
            <UBadge
              v-for="tag in (row.original.tags || [])"
              :key="tag"
              size="xs"
              color="primary"
            >
              {{ tag }}
            </UBadge>
          </div>
        </template>
        <template #type-cell="{ row }">
          <UBadge :color="getTypeColor(row.original.type)">{{ row.original.type }}</UBadge>
        </template>
        <template #description-cell="{ row }">
          <span class="text-sm text-muted">{{ row.original.description || '—' }}</span>
        </template>
        <template #published-cell="{ row }">
          <UBadge v-if="row.original.published" color="success">Published</UBadge>
          <UBadge v-else color="neutral">Draft</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UDropdownMenu 
            :items="getStepMenuItemsForTable(row.original)" 
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ph-list"
              size="sm"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </UCard>

    <!-- Create Step Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Step">
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
              :disabled="creating"
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
              :disabled="creating"
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
              :disabled="creating"
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
              :disabled="creating"
            />
            <p class="mt-1 text-xs text-muted">Search and select from existing tags</p>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="newStep.published"
                :disabled="creating"
                class="rounded border-gray-300"
              />
              <span class="text-sm font-medium text-default">Published</span>
            </label>
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
            form="create-step-form"
            color="primary"
            :loading="creating"
          >
            Create Step
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Step Modal -->
    <UModal v-model:open="showEditModal" title="Edit Step">
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
              :disabled="editing"
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
              :disabled="editing"
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
              :disabled="editing"
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
              :disabled="editing"
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
              :disabled="editing"
            />
            <p class="mt-1 text-xs text-muted">Search and select from existing tags</p>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="editStepForm.published"
                :disabled="editing"
                class="rounded border-gray-300"
              />
              <span class="text-sm font-medium text-default">Published</span>
            </label>
          </div>

          <UAlert v-if="error" color="error" variant="soft" :title="error" />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="closeEditModal"
            :disabled="editing"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            form="edit-step-form"
            color="primary"
            :loading="editing"
          >
            Save Changes
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

import type { Step, StepInsert, StepUpdate } from '~/composables/useWorkflow'

const {
  getSteps,
  createStep,
  updateStep,
  deleteStep,
} = useWorkflow()

const steps = ref<Step[]>([])
const loading = ref(true)
const creating = ref(false)
const editing = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const error = ref('')
const searchQuery = ref('')
const typeFilter = ref<string | null>(null)
const viewMode = ref<'grid' | 'table'>('grid')
const editingStepId = ref<string | null>(null)

const newStep = ref<StepInsert>({
  name: '',
  type: 'NORMAL',
  description: null,
  tags: [] as string[],
  published: false,
})

const editStepForm = ref<StepUpdate>({
  name: '',
  key: '',
  type: 'NORMAL',
  description: null,
  tags: [] as string[],
  published: false,
})

const stepTypeOptions = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Text', value: 'TEXT' },
  { label: 'List', value: 'LIST' },
  { label: 'Record', value: 'RECORD' },
]

const typeFilterOptions = [
  { label: 'All Types', value: null },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Text', value: 'TEXT' },
  { label: 'List', value: 'LIST' },
  { label: 'Record', value: 'RECORD' },
]

// Collect all unique tags from existing steps for autocomplete
const tagOptions = computed<string[]>(() => {
  const tagSet = new Set<string>()
  steps.value.forEach(step => {
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

const getTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  switch (type) {
    case 'NORMAL':
      return 'neutral'
    case 'TEXT':
      return 'primary'
    case 'LIST':
      return 'success'
    case 'RECORD':
      return 'warning'
    default:
      return 'neutral'
  }
}

const filteredSteps = computed(() => {
  let filtered = steps.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(step =>
      step.name.toLowerCase().includes(query) ||
      step.type.toLowerCase().includes(query) ||
      (step.description && step.description.toLowerCase().includes(query)) ||
      (step.tags && step.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(step => step.type === typeFilter.value)
  }

  return filtered
})

interface TableRow extends Step {
  // TableRow is the same as Step, just used for table display
}

const tableColumns = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'type', accessorKey: 'type', header: 'Type' },
  { id: 'description', accessorKey: 'description', header: 'Description' },
  { id: 'published', accessorKey: 'published', header: 'Status' },
  { id: 'actions', accessorKey: 'actions', header: '' },
]

const tableRows = computed<TableRow[]>(() => {
  return filteredSteps.value as TableRow[]
})

// Load steps
onMounted(async () => {
  await loadSteps()
})

const loadSteps = async () => {
  loading.value = true
  try {
    steps.value = await getSteps()
  } catch (err: any) {
    // Failed to load steps
    steps.value = []
  } finally {
    loading.value = false
  }
}

const handleCreateStep = async () => {
  error.value = ''
  creating.value = true

  try {
    await createStep(newStep.value)
    showCreateModal.value = false
    newStep.value = { name: '', type: 'NORMAL', description: null, tags: [] as string[], published: false }
    await loadSteps()
  } catch (err: any) {
    error.value = err.message || 'Failed to create step'
  } finally {
    creating.value = false
  }
}

const getStepMenuItems = (step: Step) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => editStep(step)
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteStep(step.id, step.name)
      }
    ]
  ]
}

const getStepMenuItemsForTable = (step: Step) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => editStep(step)
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteStep(step.id, step.name)
      }
    ]
  ]
}

const editStep = (step: Step) => {
  editingStepId.value = step.id
  editStepForm.value = {
    name: step.name,
    key: step.key,
    type: step.type,
    description: step.description,
    tags: (step.tags || []) as string[],
    published: step.published,
  }
  showEditModal.value = true
}

const handleUpdateStep = async () => {
  if (!editingStepId.value) return

  error.value = ''
  editing.value = true

  try {
    if (editStepForm.value.key && !/^[a-z0-9-]+$/.test(editStepForm.value.key)) {
      error.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateStep(editingStepId.value, editStepForm.value)
    closeEditModal()
    await loadSteps()
  } catch (err: any) {
    error.value = err.message || 'Failed to update step'
  } finally {
    editing.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingStepId.value = null
  editStepForm.value = { name: '', key: '', type: 'NORMAL', description: null, tags: [] as string[], published: false }
  error.value = ''
}

const handleDeleteStep = async (stepId: string, stepName: string) => {
  if (
    !confirm(
      `Are you sure you want to delete "${stepName}"? This action cannot be undone and may affect statuses using this step.`
    )
  ) {
    return
  }

  try {
    await deleteStep(stepId)
    await loadSteps()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete step'
    // Failed to delete step
  }
}

useSeoMeta({
  title: 'Workflow Steps - MusicAid',
  description: 'Manage your workflow steps',
})
</script>

