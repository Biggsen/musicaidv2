<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Album Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/albums">Back to Albums</UButton>
    </UCard>

    <!-- Album Detail -->
    <div v-else-if="album">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            to="/albums"
          >
            Back
          </UButton>
          <h1 class="text-3xl font-bold text-default">{{ album.name }}</h1>
          <UPopover>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ph-dots-three-vertical"
            />
            <template #content="slotProps">
              <div class="p-1">
                <UButton
                  variant="ghost"
                  icon="i-ph-pencil"
                  block
                  @click.stop.prevent="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    if (album) {
                      router.push({ path: `/albums/${album.id}/edit` });
                    }
                  }"
                >
                  Edit
                </UButton>
                <UButton
                  variant="ghost"
                  icon="i-ph-trash"
                  block
                  color="error"
                  @click.stop.prevent="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    handleDeleteAlbum();
                  }"
                >
                  Delete
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
        <p v-if="album.description" class="text-muted mb-2">{{ album.description }}</p>
        <div class="flex items-center gap-4 text-sm text-muted">
          <span>Slug: {{ album.slug }}</span>
          <span v-if="album.release_date">
            Release Date: {{ formatDate(album.release_date) }}
          </span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Total Tracks</p>
              <p class="text-2xl font-bold text-default">{{ tracks.length }}</p>
            </div>
            <UIcon name="i-ph-music-note" class="w-8 h-8 text-primary" />
          </div>
        </UCard>
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Last Updated</p>
              <p class="text-sm font-semibold text-default">
                {{ formatDate(album.updated_at) }}
              </p>
            </div>
            <UIcon name="i-ph-clock" class="w-8 h-8 text-muted" />
          </div>
        </UCard>
      </div>

      <!-- Tracks Section -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-default">Tracks</h2>
            <UButton
              color="primary"
              icon="i-ph-plus"
              @click="showAddTrackModal = true"
            >
              Add Track
            </UButton>
          </div>
        </template>

        <!-- Loading Tracks -->
        <div v-if="loadingTracks" class="flex justify-center py-8">
          <UIcon name="i-ph-arrow-clockwise" class="w-6 h-6 text-dimmed animate-spin" />
        </div>

        <!-- Empty State -->
        <div v-else-if="tracks.length === 0" class="text-center py-12">
          <UIcon name="i-ph-music-note" class="w-16 h-16 text-dimmed mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-default mb-2">No tracks in this album</h3>
          <p class="text-muted mb-6">Add tracks to organize them for release</p>
          <UButton color="primary" icon="i-ph-plus" @click="showAddTrackModal = true">
            Add Track
          </UButton>
        </div>

        <!-- Tracks List -->
        <div v-else class="space-y-2">
          <div
            v-for="(track, index) in tracks"
            :key="track.id"
            :draggable="true"
            :class="[
              'p-4 border border-default rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-move',
              {
                'opacity-50': draggedTrackId === track.id,
                'border-primary bg-primary/10': dragOverIndex === index && draggedTrackId !== track.id
              }
            ]"
            @dragstart="handleDragStart($event, track.id, index)"
            @dragover.prevent="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop($event, index)"
            @dragend="handleDragEnd"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <UIcon name="i-ph-dots-six-vertical" class="w-5 h-5 text-muted" />
                <span class="text-sm font-medium text-muted w-8">
                  {{ track.album_order || '-' }}
                </span>
                <div class="flex-1 cursor-pointer" @click="() => router.push(`/tracks/${track.id}`)">
                  <h3 class="font-semibold text-default mb-1">{{ track.name }}</h3>
                  <div class="flex items-center gap-4 text-sm text-muted">
                    <span v-if="track.tempo">Tempo: {{ track.tempo }} BPM</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  color="error"
                  variant="ghost"
                  size="sm"
                  icon="i-ph-x"
                  @click="removeTrackFromAlbum(track.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Add Track Modal -->
      <UModal v-model:open="showAddTrackModal" title="Add Track to Album">
        <template #body>
          <form id="add-track-form" @submit.prevent="handleAddTrack" class="space-y-4">
            <div>
              <label for="track-select" class="block text-sm font-medium text-default mb-1">
                Select Tracks
              </label>
              <USelectMenu
                id="track-select"
                v-model="selectedTrackIds"
                :items="availableTracksOptions"
                placeholder="Select tracks"
                multiple
                required
                :disabled="addingTrack"
                class="w-full"
              />
              <p class="mt-1 text-xs text-muted">
                Only tracks from the same artist are available
              </p>
              <p v-if="selectedTrackIds.length > 0" class="mt-1 text-xs text-primary">
                {{ selectedTrackIds.length }} track{{ selectedTrackIds.length === 1 ? '' : 's' }} selected
              </p>
            </div>

            <div>
              <label for="track-order" class="block text-sm font-medium text-default mb-1">
                Track Order
              </label>
              <UInput
                id="track-order"
                v-model.number="trackOrder"
                type="number"
                :min="1"
                :max="tracks.length + 1"
                placeholder="Auto"
                :disabled="addingTrack"
              />
              <p class="mt-1 text-xs text-muted">
                Leave empty to add at the end
              </p>
            </div>

            <UAlert v-if="trackError" color="error" variant="soft" :title="trackError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showAddTrackModal = false"
              :disabled="addingTrack"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              form="add-track-form"
              color="primary"
              :loading="addingTrack"
            >
              Add Track{{ selectedTrackIds.length !== 1 ? 's' : '' }}
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

import type { Album } from '~/composables/useAlbums'
import type { Track } from '~/composables/useTracks'

const route = useRoute()
const router = useRouter()
const { getAlbumWithTracks, deleteAlbum } = useAlbums()
const { getTracks, updateTrack } = useTracks()

const album = ref<Album | null>(null)
const tracks = ref<any[]>([])
const allArtistTracks = ref<Track[]>([])
const loading = ref(true)
const loadingTracks = ref(false)
const addingTrack = ref(false)
const showAddTrackModal = ref(false)
const error = ref('')
const trackError = ref('')
const selectedTrackIds = ref<string[]>([])
const trackOrder = ref<number | null>(null)
const draggedTrackId = ref<string | null>(null)
const dragOverIndex = ref<number | null>(null)
const draggedIndex = ref<number | null>(null)

// Load album data
onMounted(async () => {
  await loadAlbum()
  if (album.value) {
    await loadArtistTracks()
  }
})

const loadAlbum = async () => {
  loading.value = true
  try {
    const albumId = route.params.id as string
    const albumData = await getAlbumWithTracks(albumId)
    if (!albumData) {
      error.value = 'Album not found'
    } else {
      album.value = albumData as Album
      const albumTracks = (albumData as any).tracks || []
      // Sort tracks by album_order
      tracks.value = albumTracks.sort((a: any, b: any) => {
        const orderA = a.album_order || 0
        const orderB = b.album_order || 0
        return orderA - orderB
      })
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load album'
  } finally {
    loading.value = false
  }
}

const loadArtistTracks = async () => {
  if (!album.value) return

  loadingTracks.value = true
  try {
    allArtistTracks.value = await getTracks(album.value.artist_id)
  } catch (err: any) {
    console.error('Failed to load artist tracks:', err)
  } finally {
    loadingTracks.value = false
  }
}

const availableTracksOptions = computed(() => {
  // Get tracks that aren't already in this album (or are in this album for reordering)
  const trackIdsInAlbum = new Set(tracks.value.map(t => t.id))
  return allArtistTracks.value
    .filter(t => !trackIdsInAlbum.has(t.id))
    .map(track => ({
      label: track.name,
      value: track.id,
    }))
})

const handleAddTrack = async () => {
  if (!album.value || !selectedTrackIds.value || selectedTrackIds.value.length === 0) return

  trackError.value = ''
  addingTrack.value = true

  try {
    // Extract actual track IDs from selected items (handle both string IDs and objects)
    const trackIds = selectedTrackIds.value.map((item: any) => {
      if (typeof item === 'string') {
        return item
      }
      return item?.value || item?.id || item
    }).filter(Boolean)

    if (trackIds.length === 0) {
      trackError.value = 'No valid tracks selected'
      return
    }

    const startOrder = trackOrder.value || tracks.value.length + 1

    // Update track order for existing tracks if needed
    if (startOrder <= tracks.value.length) {
      const shiftAmount = trackIds.length
      for (const track of tracks.value) {
        if (track.album_order >= startOrder) {
          await updateTrack(track.id, {
            album_order: (track.album_order || 0) + shiftAmount,
          })
        }
      }
    }

    // Add all selected tracks
    for (let i = 0; i < trackIds.length; i++) {
      const trackId = trackIds[i]
      const order = startOrder + i
      await updateTrack(trackId, {
        album_id: album.value.id,
        album_order: order,
      })
    }

    showAddTrackModal.value = false
    selectedTrackIds.value = []
    trackOrder.value = null
    await loadAlbum()
  } catch (err: any) {
    trackError.value = err.message || 'Failed to add tracks'
  } finally {
    addingTrack.value = false
  }
}

const removeTrackFromAlbum = async (trackId: string) => {
  if (!confirm('Remove this track from the album?')) {
    return
  }

  try {
    await updateTrack(trackId, {
      album_id: null,
      album_order: null,
    })
    await loadAlbum()
  } catch (err: any) {
    error.value = err.message || 'Failed to remove track'
    console.error('Failed to remove track:', err)
  }
}

const handleDragStart = (event: DragEvent, trackId: string, index: number) => {
  draggedTrackId.value = trackId
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', trackId)
  }
}

const handleDragOver = (event: DragEvent, index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) {
    dragOverIndex.value = null
    return
  }
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = () => {
  dragOverIndex.value = null
}

const handleDrop = async (event: DragEvent, dropIndex: number) => {
  if (draggedIndex.value === null || draggedTrackId.value === null) return
  if (draggedIndex.value === dropIndex) {
    dragOverIndex.value = null
    return
  }

  const newTracks = [...tracks.value]
  const [draggedTrack] = newTracks.splice(draggedIndex.value, 1)
  newTracks.splice(dropIndex, 0, draggedTrack)

  // Update all track orders
  try {
    for (let i = 0; i < newTracks.length; i++) {
      const track = newTracks[i]
      const newOrder = i + 1
      if (track.album_order !== newOrder) {
        await updateTrack(track.id, { album_order: newOrder })
      }
    }
    await loadAlbum()
  } catch (err: any) {
    error.value = err.message || 'Failed to reorder tracks'
  } finally {
    dragOverIndex.value = null
  }
}

const handleDragEnd = () => {
  draggedTrackId.value = null
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDeleteAlbum = async () => {
  if (!album.value) return

  if (
    !confirm(
      `Are you sure you want to delete "${album.value.name}"? This action cannot be undone. Tracks will be removed from the album but not deleted.`
    )
  ) {
    return
  }

  try {
    await deleteAlbum(album.value.id)
    router.push('/albums')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete album'
    console.error('Failed to delete album:', err)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

useSeoMeta({
  title: () => (album.value ? `${album.value.name} - MusicAid` : 'Album - MusicAid'),
  description: () => (album.value ? `Manage tracks in ${album.value.name}` : 'Album details'),
})
</script>

