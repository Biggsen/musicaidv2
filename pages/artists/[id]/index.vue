<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Artist Not Found</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <UButton color="primary" to="/artists">Back to Artists</UButton>
    </UCard>

    <!-- Artist Detail -->
    <div v-else-if="artist">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            to="/artists"
          >
            Back
          </UButton>
          <h1 class="text-3xl font-bold text-gray-900">{{ artist.name }}</h1>
          <UPopover>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
            />
            <template #content="slotProps">
              <div class="p-1">
                <UButton
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  block
                  @click.stop.prevent="() => { 
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    if (artist) {
                      router.push({ path: `/artists/${artist.id}/edit` });
                    }
                  }"
                >
                  Edit
                </UButton>
                <UButton
                  variant="ghost"
                  icon="i-heroicons-trash"
                  block
                  color="error"
                  @click.stop.prevent="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    handleDeleteArtist();
                  }"
                >
                  Delete
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
        <p class="text-gray-600">Slug: {{ artist.slug }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Tracks</p>
              <p class="text-2xl font-bold text-gray-900">{{ tracks.length }}</p>
            </div>
            <UIcon name="i-heroicons-musical-note" class="w-8 h-8 text-blue-500" />
          </div>
        </UCard>
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Live Ready</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ tracks.filter(t => t.live_ready).length }}
              </p>
            </div>
            <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
          </div>
        </UCard>
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Last Updated</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatDate(artist.updated_at) }}
              </p>
            </div>
            <UIcon name="i-heroicons-clock" class="w-8 h-8 text-gray-500" />
          </div>
        </UCard>
      </div>

      <!-- Tracks Section -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900">Tracks</h2>
            <UButton
              color="primary"
              icon="i-heroicons-plus"
              @click="showCreateTrackModal = true"
            >
              Add Track
            </UButton>
          </div>
        </template>

        <!-- Loading Tracks -->
        <div v-if="loadingTracks" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
        </div>

        <!-- Empty State -->
        <div v-else-if="tracks.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No tracks yet</h3>
          <p class="text-gray-600 mb-6">Create your first track to get started</p>
          <UButton color="primary" icon="i-heroicons-plus" @click="showCreateTrackModal = true">
            Create Track
          </UButton>
        </div>

        <!-- Tracks List -->
        <div v-else class="space-y-2">
          <div
            v-for="track in tracks"
            :key="track.id"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            @click="() => router.push(`/tracks/${track.id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">{{ track.name }}</h3>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>Key: {{ track.key }}</span>
                  <span v-if="track.tempo">Tempo: {{ track.tempo }} BPM</span>
                  <span v-if="track.minutes !== null && track.seconds !== null">
                    Duration: {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
                  </span>
                  <UBadge v-if="track.live_ready" color="success">Live Ready</UBadge>
                </div>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Create Track Modal -->
      <UModal v-model:open="showCreateTrackModal" title="Create New Track">
        <template #body>
          <form id="create-track-form" @submit.prevent="handleCreateTrack" class="space-y-4">
            <div>
              <label for="track-name" class="block text-sm font-medium text-gray-700 mb-1">
                Track Name
              </label>
              <UInput
                id="track-name"
                v-model="newTrack.name"
                placeholder="Enter track name"
                required
                :disabled="creatingTrack"
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
                :disabled="creatingTrack"
              />
              <p class="mt-1 text-xs text-gray-500">
                Unique identifier for this track. Lowercase letters, numbers, and hyphens only.
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
                  :disabled="creatingTrack"
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
                  :disabled="creatingTrack"
                />
              </div>
            </div>

            <UAlert v-if="trackError" color="error" variant="soft" :title="trackError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showCreateTrackModal = false"
              :disabled="creatingTrack"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              form="create-track-form"
              color="primary"
              :loading="creatingTrack"
            >
              Create Track
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

import type { Artist } from '~/composables/useArtists'
import type { Track, TrackInsert } from '~/composables/useTracks'

const route = useRoute()
const router = useRouter()
const { getArtist, deleteArtist } = useArtists()
const { getTracks, createTrack } = useTracks()

const artist = ref<Artist | null>(null)
const tracks = ref<Track[]>([])
const loading = ref(true)
const loadingTracks = ref(false)
const creatingTrack = ref(false)
const showCreateTrackModal = ref(false)
const error = ref('')
const trackError = ref('')

const newTrack = ref<TrackInsert>({
  name: '',
  key: '',
  artist_id: '',
  location: 'Soundation',
  tempo: null,
})

// Load artist and tracks
onMounted(async () => {
  await loadArtist()
  await loadTracks()
})

const loadArtist = async () => {
  loading.value = true
  try {
    const artistId = route.params.id as string
    artist.value = await getArtist(artistId)
    if (!artist.value) {
      error.value = 'Artist not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load artist'
  } finally {
    loading.value = false
  }
}

const loadTracks = async () => {
  if (!artist.value) return

  loadingTracks.value = true
  try {
    tracks.value = await getTracks(artist.value.id)
  } catch (err: any) {
    console.error('Failed to load tracks:', err)
  } finally {
    loadingTracks.value = false
  }
}

const handleCreateTrack = async () => {
  if (!artist.value) return

  trackError.value = ''
  creatingTrack.value = true

  try {
    // Validate key format
    if (!/^[a-z0-9-]+$/.test(newTrack.value.key)) {
      trackError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    newTrack.value.artist_id = artist.value.id
    await createTrack(newTrack.value)
    showCreateTrackModal.value = false
    newTrack.value = {
      name: '',
      key: '',
      artist_id: artist.value.id,
      location: 'Soundation',
      tempo: null,
    }
    await loadTracks()
  } catch (err: any) {
    trackError.value = err.message || 'Failed to create track'
  } finally {
    creatingTrack.value = false
  }
}

const handleDeleteArtist = async () => {
  if (!artist.value) return

  if (!confirm(`Are you sure you want to delete "${artist.value.name}"? This action cannot be undone and will also delete all associated tracks.`)) {
    return
  }

  try {
    await deleteArtist(artist.value.id)
    router.push('/artists')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete artist'
    console.error('Failed to delete artist:', err)
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
  title: () => (artist.value ? `${artist.value.name} - MusicAid` : 'Artist - MusicAid'),
  description: () => (artist.value ? `Manage tracks for ${artist.value.name}` : 'Artist details'),
})
</script>

