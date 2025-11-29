<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Artist Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/artists">Back to Artists</UButton>
    </UCard>

    <!-- Artist Detail -->
    <div v-else-if="artist">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            to="/artists"
          >
            Back
          </UButton>
        </div>
        <UPageHeader headline="Artist" :title="artist.name">
          <template #links>
            <UDropdownMenu :items="getArtistMenuItems()" :content="{ align: 'end' }">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-ph-bars-3"
              />
            </UDropdownMenu>
          </template>
        </UPageHeader>
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
                {{ formatDate(artist.updated_at) }}
              </p>
            </div>
            <UIcon name="i-ph-clock" class="w-8 h-8 text-dimmed" />
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
              @click="showCreateTrackModal = true"
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
          <h3 class="text-lg font-semibold text-default mb-2">No tracks yet</h3>
          <p class="text-muted mb-6">Create your first track to get started</p>
          <UButton color="primary" icon="i-ph-plus" @click="showCreateTrackModal = true">
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
                <h3 class="font-semibold text-default mb-1">{{ track.name }}</h3>
                <div class="flex items-center gap-4 text-sm text-muted">
                  <span v-if="track.tempo">Tempo: {{ track.tempo }} BPM</span>
                  <span v-if="track.minutes !== null && track.seconds !== null">
                    Duration: {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
                  </span>
                </div>
              </div>
              <UIcon name="i-ph-caret-right" class="w-5 h-5 text-dimmed" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Create Track Modal -->
      <UModal v-model:open="showCreateTrackModal" title="Create New Track">
        <template #body>
          <form id="create-track-form" @submit.prevent="handleCreateTrack" class="space-y-4">
            <div>
              <label for="track-name" class="block text-sm font-medium text-default mb-1">
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
              <label for="track-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="track-description"
                v-model="newTrack.description"
                placeholder="Enter track description..."
                :rows="6"
                class="w-full"
                :disabled="creatingTrack"
              />
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
                  :disabled="creatingTrack"
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
  artist_id: '',
  samples: 'Soundation',
  tempo: null,
  description: null,
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
    newTrack.value.artist_id = artist.value.id
    await createTrack(newTrack.value)
    showCreateTrackModal.value = false
    newTrack.value = {
      name: '',
      artist_id: artist.value.id,
      samples: 'Soundation',
      tempo: null,
      description: null,
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

const getArtistMenuItems = () => {
  if (!artist.value) return []
  return [
    [
      {
        label: 'Edit',
        icon: 'i-ph-pencil',
        to: `/artists/${artist.value.id}/edit`
      }
    ],
    [
      {
        label: 'Delete',
        icon: 'i-ph-trash',
        color: 'error' as const,
        click: () => handleDeleteArtist()
      }
    ]
  ]
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

