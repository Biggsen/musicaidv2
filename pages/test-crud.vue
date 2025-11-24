<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">CRUD Test Page</h1>
      <p class="text-gray-600">Test database operations for artists and tracks</p>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Artists Section -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold text-gray-900">Artists</h2>
        </template>

        <!-- Create Artist Form -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-3">Create Artist</h3>
          <form @submit.prevent="createNewArtist" class="space-y-4">
            <div class="space-y-2">
              <label for="artist-name" class="block text-sm font-medium text-gray-700">
                Artist name
              </label>
              <UInput
                id="artist-name"
                v-model="newArtist.name"
                placeholder="Artist name"
                required
                class="bg-white"
              />
            </div>
            <div class="space-y-2">
              <label for="artist-slug" class="block text-sm font-medium text-gray-700">
                artist-slug
              </label>
              <UInput
                id="artist-slug"
                v-model="newArtist.slug"
                placeholder="artist-slug"
                required
                class="bg-white"
              />
            </div>
            <UButton type="submit" :loading="creatingArtist" color="success" block>
              Create Artist
            </UButton>
          </form>
        </div>

        <!-- Artists List -->
        <div>
          <h3 class="text-lg font-medium mb-3">Existing Artists</h3>
          <div v-if="loadingArtists" class="text-center py-4 text-gray-500">Loading...</div>
          <div v-else-if="artists.length === 0" class="text-center py-4 text-gray-500">
            No artists yet. Create one above!
          </div>
          <div v-else class="space-y-2">
            <UCard
              v-for="artist in artists"
              :key="artist.id"
              class="hover:bg-gray-50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ artist.name }}</p>
                  <p class="text-sm text-gray-500">Slug: {{ artist.slug }}</p>
                  <p class="text-xs text-gray-400">ID: {{ artist.id }}</p>
                </div>
                <UButton
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="handleDeleteArtist(artist.id)"
                >
                  Delete
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </UCard>

      <!-- Tracks Section -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold text-gray-900">Tracks</h2>
        </template>

        <!-- Create Track Form -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-3">Create Track</h3>
          <form @submit.prevent="createNewTrack" class="space-y-4">
            <div class="space-y-2">
              <label for="track-name" class="block text-sm font-medium text-gray-700">
                Track name
              </label>
              <UInput
                id="track-name"
                v-model="newTrack.name"
                placeholder="Track name"
                required
                class="bg-white"
              />
            </div>
            <div class="space-y-2">
              <label for="track-key" class="block text-sm font-medium text-gray-700">
                track-key
              </label>
              <UInput
                id="track-key"
                v-model="newTrack.key"
                placeholder="track-key"
                required
                class="bg-white"
              />
            </div>
            <div class="space-y-2">
              <label for="track-artist" class="block text-sm font-medium text-gray-700">
                Select an artist
              </label>
              <USelect
                id="track-artist"
                v-model="newTrack.artist_id"
                :items="artistOptions"
                placeholder="Select an artist"
                required
              />
            </div>
            <UButton
              type="submit"
              :loading="creatingTrack"
              :disabled="artists.length === 0"
              color="success"
              block
            >
              Create Track
            </UButton>
          </form>
        </div>

        <!-- Tracks List -->
        <div>
          <h3 class="text-lg font-medium mb-3">Existing Tracks</h3>
          <div v-if="loadingTracks" class="text-center py-4 text-gray-500">Loading...</div>
          <div v-else-if="selectedArtistId">
            <div v-if="tracks.length === 0" class="text-center py-4 text-gray-500">
              No tracks for this artist yet.
            </div>
            <div v-else class="space-y-2">
              <UCard
                v-for="track in tracks"
                :key="track.id"
                class="hover:bg-gray-50"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ track.name }}</p>
                    <p class="text-sm text-gray-500">Key: {{ track.key }}</p>
                    <p class="text-xs text-gray-400">ID: {{ track.id }}</p>
                  </div>
                  <UButton
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="handleDeleteTrack(track.id)"
                  >
                    Delete
                  </UButton>
                </div>
              </UCard>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            Select an artist above to view their tracks
          </div>
        </div>

        <!-- Artist Selector for Tracks -->
        <div v-if="artists.length > 0" class="mt-4">
          <div class="space-y-2">
            <label for="view-artist" class="block text-sm font-medium text-gray-700">
              View tracks for:
            </label>
            <USelect
              id="view-artist"
              v-model="selectedArtistId"
              :items="artistOptions"
              placeholder="Select an artist"
              @update:model-value="loadTracks"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Messages -->
    <UAlert
      v-if="message"
      :color="messageType === 'error' ? 'error' : 'success'"
      variant="soft"
      class="mt-4"
    >
      {{ message }}
    </UAlert>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Artist } from '~/composables/useArtists'
import type { Track } from '~/composables/useTracks'

const { getArtists, createArtist, deleteArtist } = useArtists()
const { getTracks, createTrack, deleteTrack: deleteTrackFn } = useTracks()

const artists = ref<Artist[]>([])
const tracks = ref<Track[]>([])
const loadingArtists = ref(false)
const loadingTracks = ref(false)
const creatingArtist = ref(false)
const creatingTrack = ref(false)
const selectedArtistId = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const newArtist = ref({
  name: '',
  slug: '',
})

const newTrack = ref({
  name: '',
  key: '',
  artist_id: '',
})

// Convert artists to USelect options format
const artistOptions = computed(() => {
  return artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  }))
})

// Wait for user to be available before loading
const user = useSupabaseUser()

// Load artists on mount (only if user is authenticated)
onMounted(async () => {
  // Wait a bit for Supabase to initialize
  await nextTick()
  if (user.value) {
    await loadArtists()
  }
})

// Also watch for user changes
watch(user, async newUser => {
  if (newUser && artists.value.length === 0) {
    await loadArtists()
  }
})

const loadArtists = async () => {
  loadingArtists.value = true
  try {
    artists.value = await getArtists()
  } catch (error: any) {
    showMessage(error.message || 'Failed to load artists', 'error')
  } finally {
    loadingArtists.value = false
  }
}

const loadTracks = async () => {
  if (!selectedArtistId.value) {
    tracks.value = []
    return
  }

  loadingTracks.value = true
  try {
    tracks.value = await getTracks(selectedArtistId.value)
  } catch (error: any) {
    showMessage(error.message || 'Failed to load tracks', 'error')
  } finally {
    loadingTracks.value = false
  }
}

const createNewArtist = async () => {
  creatingArtist.value = true
  try {
    await createArtist(newArtist.value)
    showMessage('Artist created successfully!', 'success')
    newArtist.value = { name: '', slug: '' }
    await loadArtists()
  } catch (error: any) {
    showMessage(error.message || 'Failed to create artist', 'error')
  } finally {
    creatingArtist.value = false
  }
}

const createNewTrack = async () => {
  creatingTrack.value = true
  const artistId = newTrack.value.artist_id
  try {
    await createTrack(newTrack.value)
    showMessage('Track created successfully!', 'success')
    newTrack.value = { name: '', key: '', artist_id: '' }
    if (selectedArtistId.value === artistId) {
      await loadTracks()
    }
  } catch (error: any) {
    showMessage(error.message || 'Failed to create track', 'error')
  } finally {
    creatingTrack.value = false
  }
}

const handleDeleteArtist = async (id: string) => {
  if (!confirm('Are you sure you want to delete this artist?')) return

  try {
    await deleteArtist(id)
    showMessage('Artist deleted successfully!', 'success')
    await loadArtists()
    if (selectedArtistId.value === id) {
      selectedArtistId.value = ''
      tracks.value = []
    }
  } catch (error: any) {
    showMessage(error.message || 'Failed to delete artist', 'error')
  }
}

const handleDeleteTrack = async (id: string) => {
  if (!confirm('Are you sure you want to delete this track?')) return

  try {
    await deleteTrackFn(id)
    showMessage('Track deleted successfully!', 'success')
    await loadTracks()
  } catch (error: any) {
    showMessage(error.message || 'Failed to delete track', 'error')
  }
}

const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

useSeoMeta({
  title: 'CRUD Test - MusicAid',
  description: 'Test database operations',
})
</script>
