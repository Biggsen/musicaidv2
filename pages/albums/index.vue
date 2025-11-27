<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Albums</h1>
        <p class="text-gray-600">Organize your tracks into albums</p>
      </div>
      <UButton
        v-if="artists.length > 0"
        color="primary"
        size="lg"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Album
      </UButton>
    </div>

    <!-- Filters -->
    <UCard v-if="artists.length > 0" class="mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Artist</label>
        <USelect
          v-model="selectedArtistId"
          :items="artistOptions"
          placeholder="All artists"
        />
      </div>
    </UCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="filteredAlbums.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-rectangle-stack" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ artists.length === 0 ? 'No artists yet' : 'No albums found' }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{
          artists.length === 0
            ? 'Create an artist first to add albums'
            : selectedArtistId && selectedArtistId !== 'all'
              ? 'Try adjusting your filter'
              : 'Get started by creating your first album'
        }}
      </p>
      <UButton
        v-if="artists.length > 0"
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Album
      </UButton>
      <UButton v-else color="primary" to="/artists">Create Artist</UButton>
    </UCard>

    <!-- Albums Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="album in filteredAlbums"
        :key="album.id"
        class="hover:shadow-lg transition-shadow overflow-visible cursor-pointer"
        @click.self="() => router.push(`/albums/${album.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1" @click="() => router.push(`/albums/${album.id}`)">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ album.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">Slug: {{ album.slug }}</p>
            <p v-if="album.description" class="text-sm text-gray-600 mb-4">{{ album.description }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-musical-note" class="w-4 h-4" />
                {{ getTrackCount(album.id) }} tracks
              </span>
              <span v-if="album.release_date" class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                {{ formatDate(album.release_date) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ getArtistName(album.artist_id) }}</p>
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
                  variant="ghost"
                  icon="i-heroicons-pencil"
                  block
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close()
                    }
                    router.push({ path: `/albums/${album.id}/edit` })
                  }"
                >
                  Edit
                </UButton>
                <UButton
                  variant="ghost"
                  icon="i-heroicons-trash"
                  block
                  color="error"
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close()
                    }
                    handleDeleteAlbum(album.id, album.name)
                  }"
                >
                  Delete
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
      </UCard>
    </div>

    <!-- Create Album Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Album">
      <template #body>
        <form id="create-album-form" @submit.prevent="handleCreateAlbum" class="space-y-4">
          <div>
            <label for="album-name" class="block text-sm font-medium text-gray-700 mb-1">
              Album Name
            </label>
            <UInput
              id="album-name"
              v-model="newAlbum.name"
              placeholder="Enter album name"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="album-artist" class="block text-sm font-medium text-gray-700 mb-1">
              Artist
            </label>
            <USelect
              id="album-artist"
              v-model="newAlbum.artist_id"
              :items="artistSelectOptions"
              placeholder="Select an artist"
              required
              :disabled="creating"
            />
          </div>

          <div>
            <label for="album-description" class="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <UTextarea
              id="album-description"
              v-model="newAlbum.description"
              placeholder="Album description"
              :disabled="creating"
            />
          </div>

          <div>
            <label for="album-release-date" class="block text-sm font-medium text-gray-700 mb-1">
              Release Date (optional)
            </label>
            <UInput
              id="album-release-date"
              v-model="newAlbum.release_date"
              type="date"
              :disabled="creating"
            />
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
            form="create-album-form"
            color="primary"
            :loading="creating"
          >
            Create Album
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

import type { Album, AlbumInsert } from '~/composables/useAlbums'
import type { Artist } from '~/types'

const router = useRouter()
const { getAlbums, createAlbum, deleteAlbum } = useAlbums()
const { getArtists } = useArtists()
const { getTracks } = useTracks()

const albums = ref<Album[]>([])
const artists = ref<Artist[]>([])
const tracks = ref<Map<string, number>>(new Map())
const loading = ref(true)
const creating = ref(false)
const showCreateModal = ref(false)
const error = ref('')
const selectedArtistId = ref<string>('all')

const newAlbum = ref<AlbumInsert>({
  name: '',
  artist_id: '',
  description: null,
  release_date: null,
  image_url: null,
})

const artistOptions = computed(() => [
  { label: 'All artists', value: 'all' },
  ...artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  })),
])

const artistSelectOptions = computed(() =>
  artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  }))
)

const filteredAlbums = computed(() => {
  if (selectedArtistId.value === 'all') {
    return albums.value
  }
  return albums.value.filter(a => a.artist_id === selectedArtistId.value)
})

// Load data
onMounted(async () => {
  await loadArtists()
  await loadAlbums()
})

const loadArtists = async () => {
  try {
    artists.value = await getArtists()
  } catch (err: any) {
    console.error('Failed to load artists:', err)
  }
}

const loadAlbums = async () => {
  loading.value = true
  try {
    albums.value = await getAlbums()
    // Load track counts for each album
    for (const album of albums.value) {
      try {
        const albumTracks = await getTracks(album.artist_id)
        const albumTrackCount = albumTracks.filter(t => t.album_id === album.id).length
        tracks.value.set(album.id, albumTrackCount)
      } catch (err) {
        tracks.value.set(album.id, 0)
      }
    }
  } catch (err: any) {
    console.error('Failed to load albums:', err)
    albums.value = []
  } finally {
    loading.value = false
  }
}

const getTrackCount = (albumId: string): number => {
  return tracks.value.get(albumId) || 0
}

const getArtistName = (artistId: string): string => {
  const artist = artists.value.find(a => a.id === artistId)
  return artist?.name || 'Unknown'
}

const handleCreateAlbum = async () => {
  error.value = ''
  creating.value = true

  try {
    if (!newAlbum.value.artist_id) {
      error.value = 'Please select an artist'
      return
    }

    await createAlbum(newAlbum.value)
    showCreateModal.value = false
    newAlbum.value = {
      name: '',
      artist_id: '',
      description: null,
      release_date: null,
      image_url: null,
    }
    await loadAlbums()
  } catch (err: any) {
    error.value = err.message || 'Failed to create album'
  } finally {
    creating.value = false
  }
}

const handleDeleteAlbum = async (albumId: string, albumName: string) => {
  if (!confirm(`Are you sure you want to delete "${albumName}"? This action cannot be undone.`)) {
    return
  }

  try {
    await deleteAlbum(albumId)
    await loadAlbums()
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
  title: 'Albums - MusicAid',
  description: 'Manage your albums and organize tracks',
})
</script>

