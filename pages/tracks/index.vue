<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UPageHeader
        title="Tracks"
        description="Manage all your tracks"
      >
        <template #links>
          <UButton
            v-if="artists.length > 0"
            color="primary"
            size="lg"
            icon="i-ph-plus"
            @click="showCreateModal = true"
          >
            Create Track
          </UButton>
          <UButton
            v-if="artists.length > 0"
            color="primary"
            variant="outline"
            size="lg"
            icon="i-ph-upload"
            to="/tracks/batch-upload"
          >
            Batch Upload
          </UButton>
        </template>
      </UPageHeader>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-default mb-1">Filter by Artist</label>
          <USelect
            v-model="selectedArtistId"
            :items="artistOptions"
            placeholder="All artists"
            @update:model-value="loadTracks"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-default mb-1">Search</label>
          <UInput
            v-model="searchQuery"
            placeholder="Search tracks..."
            icon="i-ph-magnifying-glass"
            @input="filterTracks"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-default mb-1">Sort By</label>
          <div class="flex items-center gap-2">
            <USelect
              v-model="sortField"
              :items="sortOptions"
              @update:model-value="applySorting"
            />
            <UButton
              :icon="sortDirection === 'asc' ? 'i-ph-sort-ascending' : 'i-ph-sort-descending'"
              color="neutral"
              variant="outline"
              size="sm"
              @click="toggleSortDirection"
              :aria-label="`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-default mb-1">View</label>
          <div class="flex gap-2">
            <UButton
              :color="viewMode === 'grid' ? 'primary' : 'neutral'"
              variant="ghost"
              icon="i-ph-grid-four"
              @click="viewMode = 'grid'"
            />
            <UButton
              :color="viewMode === 'list' ? 'primary' : 'neutral'"
              variant="ghost"
              icon="i-ph-table"
              @click="viewMode = 'list'"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredTracks.length === 0" class="text-center py-12">
      <UIcon name="i-ph-music-note" class="w-16 h-16 text-dimmed mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">
        {{ artists.length === 0 ? 'No artists yet' : 'No tracks found' }}
      </h3>
      <p class="text-muted mb-6">
        {{
          artists.length === 0
            ? 'Create an artist first to add tracks'
            : searchQuery || (selectedArtistId && selectedArtistId !== 'all')
              ? 'Try adjusting your filters'
              : 'Get started by creating your first track'
        }}
      </p>
      <div v-if="artists.length > 0" class="flex gap-3">
        <UButton
          color="primary"
          icon="i-ph-plus"
          @click="showCreateModal = true"
        >
          Create Track
        </UButton>
        <UButton
          color="primary"
          variant="outline"
          icon="i-ph-upload"
          to="/tracks/batch-upload"
        >
          Batch Upload
        </UButton>
      </div>
      <UButton v-else color="primary" to="/artists">Create Artist</UButton>
    </UCard>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="track in filteredTracks"
        :key="track.id"
        class="hover:shadow-lg transition-shadow overflow-visible cursor-pointer"
        @click.self="() => router.push(`/tracks/${track.id}`)"
      >
        <div class="flex items-start justify-between mb-3">
          <div
            class="flex-1"
            @click="() => router.push(`/tracks/${track.id}`)"
          >
            <h3 class="text-lg font-semibold text-default">{{ track.name }}</h3>
            <p v-if="track.description" class="text-sm text-muted mt-1 line-clamp-2">
              {{ track.description }}
            </p>
          </div>
          <UDropdownMenu 
            :items="getTrackMenuItemsForCard(track)" 
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
        <div
          class="space-y-2 text-sm text-muted"
          @click="() => router.push(`/tracks/${track.id}`)"
        >
          <p v-if="track.tempo">Tempo: {{ track.tempo }} BPM</p>
          <p v-if="track.minutes !== null && track.seconds !== null">
            Duration: {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
          </p>
          <p v-if="track.samples">Samples: {{ track.samples }}</p>
          <div v-if="track.template_id" class="mt-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted">Progress</span>
              <span class="font-medium text-default">{{ getTrackProgress(track.id).progress }}%</span>
            </div>
            <UProgress :model-value="getTrackProgress(track.id).progress" :max="100" size="xs" />
            <p
              v-if="getTrackProgress(track.id).currentStatusName"
              class="text-sm text-muted"
            >
              Status: {{ getTrackProgress(track.id).currentStatusName }}
            </p>
            <p v-if="getTrackProgress(track.id).nextStep" class="text-sm text-muted">
              Next: {{ getTrackProgress(track.id).nextStep?.name }}
            </p>
            <p v-else-if="getTrackProgress(track.id).progress === 100" class="text-sm text-success">
              Complete
            </p>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <UBadge color="neutral">{{ getArtistName(track.artist_id) }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- List View -->
    <UCard v-else>
      <UTable :data="tableRows" :columns="tableColumns as any">
        <template #name-header>
          <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('name')">
            <span>Track Name</span>
            <UIcon 
              v-if="sortField === 'name'" 
              :name="sortDirection === 'asc' ? 'i-ph-sort-ascending' : 'i-ph-sort-descending'" 
              class="w-4 h-4"
            />
          </div>
        </template>
        <template #artist-header>
          <div class="flex items-center gap-2">
            <span>Artist</span>
          </div>
        </template>
        <template #tempo-header>
          <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('tempo')">
            <span>Tempo</span>
            <UIcon 
              v-if="sortField === 'tempo'" 
              :name="sortDirection === 'asc' ? 'i-ph-sort-ascending' : 'i-ph-sort-descending'" 
              class="w-4 h-4"
            />
          </div>
        </template>
        <template #samples-header>
          <div class="flex items-center gap-2">
            <span>Samples</span>
          </div>
        </template>
        <template #duration-header>
          <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('duration')">
            <span>Duration</span>
            <UIcon 
              v-if="sortField === 'duration'" 
              :name="sortDirection === 'asc' ? 'i-ph-sort-ascending' : 'i-ph-sort-descending'" 
              class="w-4 h-4"
            />
          </div>
        </template>
        <template #progress-header>
          <div class="flex items-center gap-2 cursor-pointer" @click="handleSort('progress')">
            <span>Progress</span>
            <UIcon 
              v-if="sortField === 'progress'" 
              :name="sortDirection === 'asc' ? 'i-ph-sort-ascending' : 'i-ph-sort-descending'" 
              class="w-4 h-4"
            />
          </div>
        </template>
        <template #status-cell="{ row }">
          <span class="text-sm text-muted">
            {{ getTrackProgress(row.original.id).currentStatusName || '—' }}
          </span>
        </template>
        <template #name-cell="{ row }">
          <NuxtLink
            :to="`/tracks/${row.original.id}`"
            class="font-semibold text-primary hover:text-primary/80"
          >
            {{ row.original.name }}
          </NuxtLink>
        </template>
        <template #artist-cell="{ row }">
          <UBadge color="neutral">{{ row.original.artist }}</UBadge>
        </template>
        <template #duration-cell="{ row }">
          <span v-if="row.original.minutes !== null && row.original.seconds !== null" class="text-sm text-muted">
            {{ row.original.minutes }}:{{ String(row.original.seconds).padStart(2, '0') }}
          </span>
          <span v-else class="text-sm text-muted">—</span>
        </template>
        <template #progress-cell="{ row }">
          <div v-if="row.original.template_id" class="text-sm">
            <span class="text-muted">{{ getTrackProgress(row.original.id).progress }}%</span>
          </div>
          <span v-else class="text-sm text-muted">—</span>
        </template>
        <template #nextStep-cell="{ row }">
          <div v-if="row.original.template_id">
            <p v-if="getTrackProgress(row.original.id).nextStep" class="text-sm text-muted truncate">
              {{ getTrackProgress(row.original.id).nextStep?.name }}
            </p>
            <p v-else-if="getTrackProgress(row.original.id).progress === 100" class="text-sm text-success">
              Complete
            </p>
            <span v-else class="text-sm text-muted">—</span>
          </div>
          <span v-else class="text-sm text-muted">—</span>
        </template>
        <template #actions-cell="{ row }">
          <UDropdownMenu 
            :items="getTrackMenuItems(row.original)" 
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

    <!-- Create Track Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Track">
      <template #body>
        <form id="create-track-form" @submit.prevent="handleCreateTrack" class="space-y-4">
          <div>
            <label for="track-artist" class="block text-sm font-medium text-default mb-1">
              Artist
            </label>
            <USelect
              id="track-artist"
              v-model="newTrack.artist_id"
              :items="artistOptionsForCreate"
              placeholder="Select an artist"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="track-name" class="block text-sm font-medium text-default mb-1">
              Track Name
            </label>
            <UInput
              id="track-name"
              v-model="newTrack.name"
              placeholder="Enter track name"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="track-description" class="block text-sm font-medium text-default mb-1">
              Description
            </label>
            <UTextarea
              id="track-description"
              v-model="newTrack.description"
              placeholder="Enter track description..."
              :rows="6"
              class="w-full"
              :disabled="creating"
            />
          </div>

          <div>
            <label for="track-template" class="block text-sm font-medium text-default mb-1">
              Workflow Template
            </label>
            <USelect
              id="track-template"
              v-model="newTrack.template_id"
              :items="templateOptions"
              placeholder="Select a template (optional)"
              :disabled="creating"
            />
            <p class="mt-1 text-xs text-muted">
              Select a workflow template to track production progress.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="track-tempo" class="block text-sm font-medium text-default mb-1">
                Tempo (BPM)
              </label>
              <UInput
                id="track-tempo"
                v-model.number="newTrack.tempo"
                type="number"
                :disabled="creating"
              />
            </div>
            <div>
              <label for="track-samples" class="block text-sm font-medium text-default mb-1">
                Samples
              </label>
              <UInput
                id="track-samples"
                v-model="newTrack.samples"
                placeholder="Soundation"
                :disabled="creating"
              />
            </div>
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
            form="create-track-form"
            color="primary"
            :loading="creating"
          >
            Create Track
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Track Modal -->
    <UModal v-model:open="showEditModal" title="Edit Track">
      <template #body>
        <form id="edit-track-form" @submit.prevent="handleUpdateTrack" class="space-y-4">
          <div>
            <label for="edit-track-name" class="block text-sm font-medium text-default mb-1">
              Track Name
            </label>
            <UInput
              id="edit-track-name"
              v-model="editTrack.name"
              placeholder="Enter track name"
              required
              :disabled="editing"
            />
          </div>

          <div>
            <label for="edit-track-key" class="block text-sm font-medium text-default mb-1">
              Track Key
            </label>
            <UInput
              id="edit-track-key"
              v-model="editTrack.key"
              placeholder="track-key"
              required
              :disabled="editing"
            />
            <p class="mt-1 text-xs text-muted">
              Unique identifier. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label for="edit-track-description" class="block text-sm font-medium text-default mb-1">
              Description
            </label>
            <UTextarea
              id="edit-track-description"
              v-model="editTrack.description"
              placeholder="Enter track description..."
              :rows="6"
              class="w-full"
              :disabled="editing"
            />
          </div>

          <div>
            <label for="edit-track-template" class="block text-sm font-medium text-default mb-1">
              Workflow Template
            </label>
            <USelect
              id="edit-track-template"
              v-model="editTrack.template_id"
              :items="templateOptions"
              placeholder="Select a template (optional)"
              :disabled="editing || loadingTemplates"
            />
            <p class="mt-1 text-xs text-muted">
              Select a workflow template to track production progress.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="edit-track-tempo" class="block text-sm font-medium text-default mb-1">
                Tempo (BPM)
              </label>
              <UInput
                id="edit-track-tempo"
                v-model.number="editTrack.tempo"
                type="number"
                :disabled="editing"
              />
            </div>
            <div>
              <label for="edit-track-samples" class="block text-sm font-medium text-default mb-1">
                Samples
              </label>
              <UInput
                id="edit-track-samples"
                v-model="editTrack.samples"
                placeholder="Soundation"
                :disabled="editing"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="edit-track-minutes" class="block text-sm font-medium text-default mb-1">
                Minutes
              </label>
              <UInput
                id="edit-track-minutes"
                v-model.number="editTrack.minutes"
                type="number"
                :disabled="editing"
              />
            </div>
            <div>
              <label for="edit-track-seconds" class="block text-sm font-medium text-default mb-1">
                Seconds
              </label>
              <UInput
                id="edit-track-seconds"
                v-model.number="editTrack.seconds"
                type="number"
                :disabled="editing"
              />
            </div>
          </div>

          <div>
            <label for="edit-track-isrc" class="block text-sm font-medium text-default mb-1">
              ISRC Code
            </label>
            <UInput
              id="edit-track-isrc"
              v-model="editTrack.isrc_code"
              placeholder="USRC17607839"
              :disabled="editing"
            />
          </div>

          <UAlert v-if="editError" color="error" variant="soft" :title="editError" />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="showEditModal = false"
            :disabled="editing"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            form="edit-track-form"
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

import type { Artist } from '~/composables/useArtists'
import type { Track, TrackInsert, TrackUpdate } from '~/composables/useTracks'
import type { Template, TrackStatusWithSteps, Step } from '~/composables/useWorkflow'

const router = useRouter()
const { getArtists } = useArtists()
const { getTracks, getTrack, createTrack, updateTrack, deleteTrack } = useTracks()
const { getTemplates, getTemplateWithStatuses, getTrackStatusWithSteps, getCompletedSteps } = useWorkflow()

const artists = ref<Artist[]>([])
const allTracks = ref<Track[]>([])
const templates = ref<Template[]>([])
const loading = ref(true)
const loadingTemplates = ref(false)
const creating = ref(false)
const editing = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const error = ref('')
const editError = ref('')
const selectedArtistId = ref('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const editingTrackId = ref<string | null>(null)
const sortField = ref('updated_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

interface TrackProgress {
  progress: number
  nextStep: Step | null
  currentStatusName: string | null
}

const trackProgressMap = ref<Map<string, TrackProgress>>(new Map())

const newTrack = ref<TrackInsert>({
  name: '',
  artist_id: '',
  template_id: null,
  samples: 'Soundation',
  tempo: null,
  description: null,
})

const editTrack = ref<TrackUpdate>({
  name: '',
  key: '',
  template_id: null,
  tempo: null,
  minutes: null,
  seconds: null,
  samples: '',
  isrc_code: null,
  description: null,
})

const artistOptions = computed(() => [
  { label: 'All artists', value: 'all' },
  ...artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  })),
])

const artistOptionsForCreate = computed(() => {
  return artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  }))
})

const templateOptions = computed(() => [
  { label: 'None', value: null },
  ...templates.value.map(template => ({
    label: template.name,
    value: template.id,
  })),
])

const sortOptions = [
  { label: 'Last Updated', value: 'updated_at' },
  { label: 'Created Date', value: 'created_at' },
  { label: 'Name', value: 'name' },
  { label: 'Tempo', value: 'tempo' },
  { label: 'Duration', value: 'duration' },
  { label: 'Progress', value: 'progress' },
]

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const filteredTracks = computed(() => {
  let filtered = allTracks.value

  if (selectedArtistId.value && selectedArtistId.value !== 'all') {
    filtered = filtered.filter(t => t.artist_id === selectedArtistId.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        getArtistName(t.artist_id).toLowerCase().includes(query)
    )
  }

  // Apply sorting
  if (sortField.value) {
    const isAscending = sortDirection.value === 'asc'
    
    filtered = [...filtered].sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField.value) {
        case 'updated_at':
          aVal = a.updated_at ? new Date(a.updated_at).getTime() : 0
          bVal = b.updated_at ? new Date(b.updated_at).getTime() : 0
          break
        case 'created_at':
          aVal = a.created_at ? new Date(a.created_at).getTime() : 0
          bVal = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'tempo':
          aVal = a.tempo ?? 0
          bVal = b.tempo ?? 0
          break
        case 'duration':
          aVal = (a.minutes ?? 0) * 60 + (a.seconds ?? 0)
          bVal = (b.minutes ?? 0) * 60 + (b.seconds ?? 0)
          break
        case 'progress':
          aVal = getTrackProgress(a.id).progress
          bVal = getTrackProgress(b.id).progress
          break
        default:
          return 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return isAscending ? comparison : -comparison
      } else {
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return isAscending ? comparison : -comparison
      }
    })
  }

  return filtered
})

const applySorting = () => {
  // Sorting is handled reactively by the computed property
}

interface TableRow {
  id: string
  name: string
  artist_id: string
  tempo: number | null
  samples: string
  minutes: number | null
  seconds: number | null
  artist: string
  template_id: string | null
}

const tableColumns = [
  { id: 'name', accessorKey: 'name', header: 'Track Name', sortable: true },
  { id: 'artist', accessorKey: 'artist', header: 'Artist', sortable: true },
  { id: 'tempo', accessorKey: 'tempo', header: 'Tempo', sortable: true },
  { id: 'samples', accessorKey: 'samples', header: 'Samples', sortable: true },
  { id: 'duration', accessorKey: 'duration', header: 'Duration', sortable: true },
  { id: 'status', accessorKey: 'status', header: 'Status', sortable: false },
  { id: 'progress', accessorKey: 'progress', header: 'Progress', sortable: true },
  { id: 'nextStep', accessorKey: 'nextStep', header: 'Next Step', sortable: false },
  { id: 'actions', accessorKey: 'actions', header: '', sortable: false },
]

const tableRows = computed<TableRow[]>(() => {
  return filteredTracks.value.map(track => ({
    id: track.id,
    name: track.name,
    artist_id: track.artist_id,
    tempo: track.tempo,
    samples: track.samples,
    minutes: track.minutes,
    seconds: track.seconds,
    artist: getArtistName(track.artist_id),
    template_id: track.template_id,
  }))
})

// Load data
onMounted(async () => {
  await loadArtists()
  await Promise.all([loadTracks(), loadTemplates()])
})

const loadArtists = async () => {
  try {
    artists.value = await getArtists()
  } catch (err: any) {
    // Failed to load artists
  }
}

const loadTemplates = async () => {
  loadingTemplates.value = true
  try {
    templates.value = await getTemplates()
  } catch (err: any) {
    templates.value = []
  } finally {
    loadingTemplates.value = false
  }
}

const loadTracks = async () => {
  loading.value = true
  try {
    // Load tracks for all artists
    const trackPromises = artists.value.map(artist => getTracks(artist.id))
    const trackArrays = await Promise.all(trackPromises)
    allTracks.value = trackArrays.flat()
    
    // Load progress data for tracks with templates
    await loadTrackProgress()
  } catch (err: any) {
    // Failed to load tracks
  } finally {
    loading.value = false
  }
}

const loadTrackProgress = async () => {
  trackProgressMap.value.clear()
  
  const tracksWithTemplates = allTracks.value.filter(t => t.template_id)
  if (tracksWithTemplates.length === 0) return
  
  // Optimization 2: Cache templates - get unique template IDs and load each once
  const uniqueTemplateIds = [...new Set(tracksWithTemplates.map(t => t.template_id).filter(Boolean) as string[])]
  
  // Load all templates in parallel
  const templatePromises = uniqueTemplateIds.map(id => 
    getTemplateWithStatuses(id).catch(() => null)
  )
  const templates = await Promise.all(templatePromises)
  const templateMap = new Map(uniqueTemplateIds.map((id, i) => [id, templates[i]]))
  
  // Get all unique status IDs from all templates
  const allStatusIds = new Set<string>()
  templateMap.forEach(template => {
    template?.statuses?.forEach(status => allStatusIds.add(status.id))
  })
  
  // Optimization 2: Cache statuses - load each unique status with steps once
  const statusPromises = Array.from(allStatusIds).map(id =>
    getTrackStatusWithSteps(id).catch(() => null)
  )
  const statuses = await Promise.all(statusPromises)
  const statusMap = new Map(Array.from(allStatusIds).map((id, i) => [id, statuses[i]]))
  
  // Optimization 3: Batch fetch all completed steps for all tracks in parallel
  const trackIds = tracksWithTemplates.map(t => t.id)
  const completedStepsPromises = trackIds.map(id => 
    getCompletedSteps(id).catch(() => [])
  )
  const allCompletedSteps = await Promise.all(completedStepsPromises)
  const completedStepsMap = new Map(trackIds.map((id, i) => [id, new Set(allCompletedSteps[i])]))
  
  // Optimization 1: Calculate progress for all tracks in parallel
  const progressPromises = tracksWithTemplates.map(async (track) => {
    try {
      const template = templateMap.get(track.template_id!)
      if (!template?.statuses?.length) {
        return { trackId: track.id, progress: { progress: 0, nextStep: null, currentStatusName: null } }
      }
      
      const completedStepIds = completedStepsMap.get(track.id) || new Set()
      
      // Collect all steps from all statuses using cached data
      const allSteps: Step[] = []
      template.statuses.forEach(status => {
        const statusWithSteps = statusMap.get(status.id)
        if (statusWithSteps?.steps) {
          allSteps.push(...statusWithSteps.steps)
        }
      })
      
      if (allSteps.length === 0) {
        return { trackId: track.id, progress: { progress: 0, nextStep: null, currentStatusName: null } }
      }
      
      // Calculate progress
      const completedCount = allSteps.filter(step => completedStepIds.has(step.id)).length
      const progress = Math.round((completedCount / allSteps.length) * 100)
      
      // Find next incomplete step
      const nextStep = allSteps.find(step => !completedStepIds.has(step.id)) || null
      
      let currentStatusName: string | null = null
      if (track.track_status_id && template.statuses) {
        const currentStatus = template.statuses.find(status => status.id === track.track_status_id)
        currentStatusName = currentStatus ? currentStatus.name : null
      }
      
      return {
        trackId: track.id,
        progress: { progress, nextStep, currentStatusName }
      }
    } catch (err: any) {
      return { trackId: track.id, progress: { progress: 0, nextStep: null, currentStatusName: null } }
    }
  })
  
  const results = await Promise.all(progressPromises)
  results.forEach(({ trackId, progress }) => {
    trackProgressMap.value.set(trackId, progress)
  })
}

const getTrackProgress = (trackId: string): TrackProgress => {
  return trackProgressMap.value.get(trackId) || { progress: 0, nextStep: null, currentStatusName: null }
}

const filterTracks = () => {
  // Reactive filtering handled by computed property
}

const handleSort = (column: string) => {
  // Map column clicks to sort fields
  const sortMap: Record<string, string> = {
    name: 'name',
    tempo: 'tempo',
    duration: 'duration',
    progress: 'progress',
  }

  if (sortMap[column]) {
    // If clicking the same column, toggle direction; otherwise set new column with default direction
    if (sortField.value === sortMap[column]) {
      toggleSortDirection()
    } else {
      sortField.value = sortMap[column]
      // Set default direction based on column type
      sortDirection.value = column === 'name' ? 'asc' : 'desc'
    }
  }
}

const getArtistName = (artistId: string): string => {
  const artist = artists.value.find(a => a.id === artistId)
  return artist?.name || 'Unknown'
}

const handleCreateTrack = async () => {
  error.value = ''
  creating.value = true

  try {
    if (!newTrack.value.artist_id) {
      error.value = 'Please select an artist'
      return
    }

    await createTrack(newTrack.value)
    showCreateModal.value = false
    newTrack.value = {
      name: '',
      artist_id: '',
      template_id: null,
      samples: 'Soundation',
      tempo: null,
      description: null,
    }
    await loadTracks()
    await loadTrackProgress()
  } catch (err: any) {
    error.value = err.message || 'Failed to create track'
  } finally {
    creating.value = false
  }
}

const getTrackMenuItems = (row: TableRow) => {
  return [
    [
      {
        label: 'View Details',
        icon: 'i-ph-eye',
        onSelect: () => {
          router.push(`/tracks/${row.id}`)
        },
      },
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => {
          router.push(`/tracks/${row.id}/edit`)
        },
      },
    ]
  ]
}

const getTrackMenuItemsForCard = (track: Track) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        onSelect: () => {
          openEditModal(track.id)
        },
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        onSelect: () => {
          handleDeleteTrack(track.id, track.name)
        },
      }
    ]
  ]
}

const openEditModal = async (trackId: string) => {
  editingTrackId.value = trackId
  editError.value = ''
  editing.value = true
  
  try {
    const track = await getTrack(trackId)
    if (track) {
      editTrack.value = {
        name: track.name,
        key: track.key,
        template_id: track.template_id,
        tempo: track.tempo,
        minutes: track.minutes,
        seconds: track.seconds,
        samples: track.samples,
        isrc_code: track.isrc_code,
        description: track.description,
      }
      showEditModal.value = true
    }
  } catch (err: any) {
    editError.value = err.message || 'Failed to load track'
  } finally {
    editing.value = false
  }
}

const handleUpdateTrack = async () => {
  if (!editingTrackId.value) return

  editError.value = ''
  editing.value = true

  try {
    if (!/^[a-z0-9-]+$/.test(editTrack.value.key || '')) {
      editError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    // If template is set to None, clear status and step as well
    const updateData = { ...editTrack.value }
    if (updateData.template_id === null) {
      updateData.track_status_id = null
      updateData.step_id = null
    }

    await updateTrack(editingTrackId.value, updateData)
    showEditModal.value = false
    editingTrackId.value = null
    await loadTracks()
    await loadTrackProgress()
  } catch (err: any) {
    editError.value = err.message || 'Failed to update track'
  } finally {
    editing.value = false
  }
}

const handleDeleteTrack = async (trackId: string, trackName: string) => {
  if (!confirm(`Are you sure you want to delete "${trackName}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deleteTrack(trackId)
    trackProgressMap.value.delete(trackId)
    await loadTracks()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete track'
  }
}

useSeoMeta({
  title: 'Tracks - MusicAid',
  description: 'Manage all your tracks',
})
</script>

