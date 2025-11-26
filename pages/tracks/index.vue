<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Tracks</h1>
        <p class="text-gray-600">Manage all your tracks</p>
      </div>
      <UButton
        v-if="artists.length > 0"
        color="primary"
        size="lg"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Track
      </UButton>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Artist</label>
          <USelect
            v-model="selectedArtistId"
            :items="artistOptions"
            placeholder="All artists"
            @update:model-value="loadTracks"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <UInput
            v-model="searchQuery"
            placeholder="Search tracks..."
            icon="i-heroicons-magnifying-glass"
            @input="filterTracks"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">View</label>
          <div class="flex gap-2">
            <UButton
              :color="viewMode === 'grid' ? 'primary' : 'neutral'"
              variant="ghost"
              icon="i-heroicons-squares-2x2"
              @click="viewMode = 'grid'"
            />
            <UButton
              :color="viewMode === 'list' ? 'primary' : 'neutral'"
              variant="ghost"
              icon="i-heroicons-list-bullet"
              @click="viewMode = 'list'"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredTracks.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ artists.length === 0 ? 'No artists yet' : 'No tracks found' }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{
          artists.length === 0
            ? 'Create an artist first to add tracks'
            : searchQuery || (selectedArtistId && selectedArtistId !== 'all')
              ? 'Try adjusting your filters'
              : 'Get started by creating your first track'
        }}
      </p>
      <UButton
        v-if="artists.length > 0"
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Track
      </UButton>
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
            <h3 class="text-lg font-semibold text-gray-900">{{ track.name }}</h3>
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
                  v-for="item in getTrackMenuItemsForCard(track)"
                  :key="item.label"
                  variant="ghost"
                  :icon="item.icon"
                  :color="item.color"
                  block
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    item.click();
                  }"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
        <div
          class="space-y-2 text-sm text-gray-600"
          @click="() => router.push(`/tracks/${track.id}`)"
        >
          <p>Key: {{ track.key }}</p>
          <p v-if="track.tempo">Tempo: {{ track.tempo }} BPM</p>
          <p v-if="track.minutes !== null && track.seconds !== null">
            Duration: {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
          </p>
          <div class="flex items-center gap-2 mt-3">
            <UBadge v-if="track.live_ready" color="success">Live Ready</UBadge>
            <UBadge color="neutral">{{ getArtistName(track.artist_id) }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- List View -->
    <UCard v-else>
      <UTable :data="tableRows" :columns="tableColumns as any">
        <template #name-cell="{ row }">
          <NuxtLink
            :to="`/tracks/${row.original.id}`"
            class="font-semibold text-blue-600 hover:text-blue-800"
          >
            {{ row.original.name }}
          </NuxtLink>
        </template>
        <template #artist-cell="{ row }">
          <UBadge color="neutral">{{ row.original.artist }}</UBadge>
        </template>
        <template #status-cell="{ row }">
          <UBadge v-if="row.original.live_ready" color="success">Live Ready</UBadge>
          <span v-else class="text-gray-400">In Progress</span>
        </template>
        <template #actions-cell="{ row }">
          <UPopover :content="{ side: 'bottom', align: 'end' }">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
              size="sm"
            />
            <template #content="slotProps">
              <div class="p-1">
                <UButton
                  v-for="item in getTrackMenuItems(row.original)"
                  :key="item.label"
                  variant="ghost"
                  :icon="item.icon"
                  block
                  size="sm"
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    item.click();
                  }"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </template>
          </UPopover>
        </template>
      </UTable>
    </UCard>

    <!-- Create Track Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Track">
      <template #body>
        <form id="create-track-form" @submit.prevent="handleCreateTrack" class="space-y-4">
          <div>
            <label for="track-artist" class="block text-sm font-medium text-gray-700 mb-1">
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
            <label for="track-name" class="block text-sm font-medium text-gray-700 mb-1">
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
            <label for="track-key" class="block text-sm font-medium text-gray-700 mb-1">
              Track Key
            </label>
            <UInput
              id="track-key"
              v-model="newTrack.key"
              placeholder="track-key"
              required
              :disabled="creating"
            />
            <p class="mt-1 text-xs text-gray-500">
              Unique identifier. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label for="track-template" class="block text-sm font-medium text-gray-700 mb-1">
              Workflow Template
            </label>
            <USelect
              id="track-template"
              v-model="newTrack.template_id"
              :items="templateOptions"
              placeholder="Select a template (optional)"
              :disabled="creating"
            />
            <p class="mt-1 text-xs text-gray-500">
              Select a workflow template to track production progress.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="track-tempo" class="block text-sm font-medium text-gray-700 mb-1">
                Tempo (BPM)
              </label>
              <UInput
                id="track-tempo"
                v-model.number="newTrack.tempo"
                type="number"
                placeholder="120"
                :disabled="creating"
              />
            </div>
            <div>
              <label for="track-location" class="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <UInput
                id="track-location"
                v-model="newTrack.location"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Artist } from '~/composables/useArtists'
import type { Track, TrackInsert } from '~/composables/useTracks'
import type { Template } from '~/composables/useWorkflow'

const router = useRouter()
const { getArtists } = useArtists()
const { getTracks, createTrack, deleteTrack } = useTracks()
const { getTemplates } = useWorkflow()

const artists = ref<Artist[]>([])
const allTracks = ref<Track[]>([])
const templates = ref<Template[]>([])
const loading = ref(true)
const creating = ref(false)
const showCreateModal = ref(false)
const error = ref('')
const selectedArtistId = ref('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

const newTrack = ref<TrackInsert>({
  name: '',
  key: '',
  artist_id: '',
  template_id: null,
  location: 'Soundation',
  tempo: null,
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
        t.key.toLowerCase().includes(query) ||
        getArtistName(t.artist_id).toLowerCase().includes(query)
    )
  }

  return filtered
})

interface TableRow {
  id: string
  name: string
  key: string
  artist_id: string
  tempo: number | null
  live_ready: boolean
  artist: string
  status: string
}

const tableColumns = [
  { id: 'name', accessorKey: 'name', header: 'Track Name' },
  { id: 'artist', accessorKey: 'artist', header: 'Artist' },
  { id: 'key', accessorKey: 'key', header: 'Key' },
  { id: 'tempo', accessorKey: 'tempo', header: 'Tempo' },
  { id: 'status', accessorKey: 'status', header: 'Status' },
  { id: 'actions', accessorKey: 'actions', header: '' },
]

const tableRows = computed<TableRow[]>(() => {
  return filteredTracks.value.map(track => ({
    id: track.id,
    name: track.name,
    key: track.key,
    artist_id: track.artist_id,
    tempo: track.tempo,
    live_ready: track.live_ready,
    artist: getArtistName(track.artist_id),
    status: track.live_ready ? 'Live Ready' : 'In Progress',
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
    console.error('Failed to load artists:', err)
  }
}

const loadTemplates = async () => {
  try {
    templates.value = await getTemplates()
  } catch (err: any) {
    console.error('Failed to load templates:', err)
    templates.value = []
  }
}

const loadTracks = async () => {
  loading.value = true
  try {
    // Load tracks for all artists
    const trackPromises = artists.value.map(artist => getTracks(artist.id))
    const trackArrays = await Promise.all(trackPromises)
    allTracks.value = trackArrays.flat()
  } catch (err: any) {
    console.error('Failed to load tracks:', err)
  } finally {
    loading.value = false
  }
}

const filterTracks = () => {
  // Reactive filtering handled by computed property
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

    if (!/^[a-z0-9-]+$/.test(newTrack.value.key)) {
      error.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await createTrack(newTrack.value)
    showCreateModal.value = false
    newTrack.value = {
      name: '',
      key: '',
      artist_id: '',
      template_id: null,
      location: 'Soundation',
      tempo: null,
    }
    await loadTracks()
  } catch (err: any) {
    error.value = err.message || 'Failed to create track'
  } finally {
    creating.value = false
  }
}

const getTrackMenuItems = (row: TableRow) => {
  return [
    {
      label: 'View Details',
      icon: 'i-heroicons-eye',
      click: () => {
        router.push(`/tracks/${row.id}`)
      },
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => {
        router.push(`/tracks/${row.id}/edit`)
      },
    },
  ]
}

const getTrackMenuItemsForCard = (track: Track) => {
  return [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      color: undefined as 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral' | undefined,
      click: () => {
        router.push(`/tracks/${track.id}/edit`)
      },
    },
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      click: () => {
        handleDeleteTrack(track.id, track.name)
      },
    },
  ]
}

const handleDeleteTrack = async (trackId: string, trackName: string) => {
  if (!confirm(`Are you sure you want to delete "${trackName}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deleteTrack(trackId)
    await loadTracks()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete track'
    console.error('Failed to delete track:', err)
  }
}

useSeoMeta({
  title: 'Tracks - MusicAid',
  description: 'Manage all your tracks',
})
</script>

