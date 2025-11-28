<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UPageHeader
        title="Workflow Statuses"
        description="Manage your workflow statuses"
      >
        <template #links>
          <UButton
            color="primary"
            size="lg"
            icon="i-heroicons-plus"
            @click="showCreateModal = true"
          >
            Create Status
          </UButton>
        </template>
      </UPageHeader>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex items-center gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search statuses..."
        icon="i-heroicons-magnifying-glass"
        clearable
        class="max-w-md"
      />
      <div class="flex gap-2">
        <UButton
          :color="viewMode === 'grid' ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-heroicons-squares-2x2"
          @click="viewMode = 'grid'"
        />
        <UButton
          :color="viewMode === 'table' ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-heroicons-table-cells"
          @click="viewMode = 'table'"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredStatuses.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-list-bullet" class="w-16 h-16 text-dimmed mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">
        {{ searchQuery ? 'No statuses match your search' : 'No statuses yet' }}
      </h3>
      <p class="text-muted mb-6">
        {{ searchQuery ? 'Try a different search term' : 'Create your first workflow status to get started' }}
      </p>
      <UButton v-if="!searchQuery" color="primary" icon="i-heroicons-plus" @click="showCreateModal = true">
        Create Status
      </UButton>
    </UCard>

    <!-- Statuses Grid -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="status in filteredStatuses"
        :key="status.id"
        class="hover:shadow-lg transition-shadow overflow-visible"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-default mb-2">{{ status.name }}</h3>
            <p v-if="status.description" class="text-sm text-muted mb-4">
              {{ status.description }}
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge v-if="status.published" color="success">Published</UBadge>
              <UBadge v-else color="neutral">Draft</UBadge>
              <UBadge v-if="status.non_linear" color="warning">Non-linear</UBadge>
            </div>
          </div>
          <UDropdownMenu 
            :items="getStatusMenuItems(status)" 
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-bars-3"
              @click.stop
            />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>

    <!-- Statuses Table -->
    <UCard v-else>
      <UTable :data="tableRows" :columns="tableColumns as any">
        <template #name-cell="{ row }">
          <span class="font-semibold text-default">{{ row.original.name }}</span>
        </template>
        <template #description-cell="{ row }">
          <span class="text-sm text-muted">{{ row.original.description || '—' }}</span>
        </template>
        <template #published-cell="{ row }">
          <UBadge v-if="row.original.published" color="success">Published</UBadge>
          <UBadge v-else color="neutral">Draft</UBadge>
        </template>
        <template #non_linear-cell="{ row }">
          <UBadge v-if="row.original.non_linear" color="warning">Non-linear</UBadge>
          <span v-else class="text-dimmed">Linear</span>
        </template>
        <template #actions-cell="{ row }">
          <UDropdownMenu 
            :items="getStatusMenuItemsForTable(row.original)" 
            :content="{ align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-bars-3"
              size="sm"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </UCard>

    <!-- Create Status Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Status">
      <template #body>
        <form id="create-status-form" @submit.prevent="handleCreateStatus" class="space-y-4">
          <div>
            <label for="status-name" class="block text-sm font-medium text-default mb-1">
              Status Name
            </label>
            <UInput
              id="status-name"
              v-model="newStatus.name"
              placeholder="e.g., Recording"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="status-description" class="block text-sm font-medium text-default mb-1">
              Description
            </label>
            <UTextarea
              id="status-description"
              v-model="newStatus.description"
              placeholder="Describe this status..."
              :rows="5"
              class="w-full"
              :disabled="creating"
            />
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="newStatus.non_linear"
                :disabled="creating"
                class="rounded border-gray-300"
              />
              <span class="text-sm font-medium text-default">Non-linear (can skip around)</span>
            </label>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="newStatus.published"
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
            form="create-status-form"
            color="primary"
            :loading="creating"
          >
            Create Status
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Status Modal -->
    <UModal v-model:open="showEditModal" title="Edit Status">
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
              :disabled="editing"
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
              :disabled="editing"
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
              :disabled="editing"
            />
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="editStatusForm.non_linear"
                :disabled="editing"
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
            form="edit-status-form"
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

import type { TrackStatus, TrackStatusInsert, TrackStatusUpdate } from '~/composables/useWorkflow'

const {
  getTrackStatuses,
  createTrackStatus,
  updateTrackStatus,
  deleteTrackStatus,
} = useWorkflow()

const statuses = ref<TrackStatus[]>([])
const loading = ref(true)
const creating = ref(false)
const editing = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const error = ref('')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'table'>('grid')
const editingStatusId = ref<string | null>(null)

const newStatus = ref<TrackStatusInsert>({
  name: '',
  description: null,
  non_linear: false,
  published: false,
})

const editStatusForm = ref<TrackStatusUpdate>({
  name: '',
  key: '',
  description: null,
  non_linear: false,
  published: false,
})

const filteredStatuses = computed(() => {
  if (!searchQuery.value.trim()) {
    return statuses.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return statuses.value.filter(status =>
    status.name.toLowerCase().includes(query) ||
    (status.description && status.description.toLowerCase().includes(query))
  )
})

interface TableRow extends TrackStatus {
  // TableRow is the same as TrackStatus, just used for table display
}

const tableColumns = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'description', accessorKey: 'description', header: 'Description' },
  { id: 'published', accessorKey: 'published', header: 'Status' },
  { id: 'non_linear', accessorKey: 'non_linear', header: 'Type' },
  { id: 'actions', accessorKey: 'actions', header: '' },
]

const tableRows = computed<TableRow[]>(() => {
  return filteredStatuses.value as TableRow[]
})

// Load statuses
onMounted(async () => {
  await loadStatuses()
})

const loadStatuses = async () => {
  loading.value = true
  try {
    statuses.value = await getTrackStatuses()
  } catch (err: any) {
    // Failed to load statuses
    statuses.value = []
  } finally {
    loading.value = false
  }
}

const handleCreateStatus = async () => {
  error.value = ''
  creating.value = true

  try {
    await createTrackStatus(newStatus.value)
    showCreateModal.value = false
    newStatus.value = { name: '', description: null, non_linear: false, published: false }
    await loadStatuses()
  } catch (err: any) {
    error.value = err.message || 'Failed to create status'
  } finally {
    creating.value = false
  }
}

const getStatusMenuItems = (status: TrackStatus) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        onSelect: () => editStatus(status)
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteStatus(status.id, status.name)
      }
    ]
  ]
}

const getStatusMenuItemsForTable = (status: TrackStatus) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        onSelect: () => editStatus(status)
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        color: 'error' as const,
        onSelect: () => handleDeleteStatus(status.id, status.name)
      }
    ]
  ]
}

const editStatus = (status: TrackStatus) => {
  editingStatusId.value = status.id
  editStatusForm.value = {
    name: status.name,
    key: status.key,
    description: status.description,
    non_linear: status.non_linear,
    published: status.published,
  }
  showEditModal.value = true
}

const handleUpdateStatus = async () => {
  if (!editingStatusId.value) return

  error.value = ''
  editing.value = true

  try {
    if (editStatusForm.value.key && !/^[a-z0-9-]+$/.test(editStatusForm.value.key)) {
      error.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateTrackStatus(editingStatusId.value, editStatusForm.value)
    closeEditModal()
    await loadStatuses()
  } catch (err: any) {
    error.value = err.message || 'Failed to update status'
  } finally {
    editing.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingStatusId.value = null
  editStatusForm.value = { name: '', key: '', description: null, non_linear: false, published: false }
  error.value = ''
}

const handleDeleteStatus = async (statusId: string, statusName: string) => {
  if (
    !confirm(
      `Are you sure you want to delete "${statusName}"? This action cannot be undone and may affect templates using this status.`
    )
  ) {
    return
  }

  try {
    await deleteTrackStatus(statusId)
    await loadStatuses()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete status'
    // Failed to delete status
  }
}

useSeoMeta({
  title: 'Workflow Statuses - MusicAid',
  description: 'Manage your workflow statuses',
})
</script>

