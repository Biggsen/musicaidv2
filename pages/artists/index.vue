<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-default mb-2">Artists</h1>
        <p class="text-muted">Manage your artists and their music</p>
      </div>
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Artist
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Empty State -->
    <UCard v-else-if="artists.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-dimmed mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">No artists yet</h3>
      <p class="text-muted mb-6">Get started by creating your first artist</p>
      <UButton color="primary" icon="i-heroicons-plus" @click="showCreateModal = true">
        Create Artist
      </UButton>
    </UCard>

    <!-- Artists Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="artist in artists"
        :key="artist.id"
        class="hover:shadow-lg transition-shadow overflow-visible cursor-pointer"
        @click.self="() => router.push(`/artists/${artist.id}`)"
      >
        <div class="flex items-start justify-between">
          <div 
            class="flex-1"
            @click="() => router.push(`/artists/${artist.id}`)"
          >
            <h3 class="text-xl font-semibold text-default mb-2">{{ artist.name }}</h3>
            <p class="text-sm text-muted mb-4">Slug: {{ artist.slug }}</p>
            <div class="flex items-center gap-4 text-sm text-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-musical-note" class="w-4 h-4" />
                {{ getTrackCount(artist.id) }} tracks
              </span>
            </div>
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
                      slotProps.close();
                    }
                    router.push({ path: `/artists/${artist.id}/edit` });
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
                      slotProps.close();
                    }
                    handleDeleteArtist(artist.id, artist.name);
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

    <!-- Create Artist Modal -->
    <UModal v-model:open="showCreateModal" title="Create New Artist">
      <template #body>
        <form id="create-artist-form" @submit.prevent="handleCreateArtist" class="space-y-4">
          <div>
            <label for="artist-name" class="block text-sm font-medium text-default mb-1">
              Artist Name
            </label>
            <UInput
              id="artist-name"
              v-model="newArtist.name"
              placeholder="Enter artist name"
              required
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
            form="create-artist-form"
            color="primary"
            :loading="creating"
          >
            Create Artist
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Success/Error Notification -->
    <UAlert
      v-if="notification"
      :color="notificationType"
      variant="soft"
      :title="notification"
      class="fixed top-4 right-4 z-50 max-w-md"
      @close="notification = ''"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Artist } from '~/types'
import type { ArtistInsert } from '~/composables/useArtists'

const router = useRouter()
const { getArtists, createArtist, deleteArtist } = useArtists()
const { getTracks } = useTracks()

const artists = ref<Artist[]>([])
const tracks = ref<Map<string, number>>(new Map())
const loading = ref(true)
const creating = ref(false)
const showCreateModal = ref(false)
const error = ref('')
const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

const newArtist = ref<ArtistInsert>({
  name: '',
})

// Load data
onMounted(async () => {
  await loadArtists()
})

const loadArtists = async () => {
  loading.value = true
  try {
    artists.value = await getArtists()
    // Load track counts for each artist
    for (const artist of artists.value) {
      try {
        const artistTracks = await getTracks(artist.id)
        tracks.value.set(artist.id, artistTracks.length)
      } catch (err) {
        tracks.value.set(artist.id, 0)
      }
    }
  } catch (err: any) {
    showNotification(err.message || 'Failed to load artists', 'error')
  } finally {
    loading.value = false
  }
}

const getTrackCount = (artistId: string): number => {
  return tracks.value.get(artistId) || 0
}

const handleCreateArtist = async () => {
  error.value = ''
  creating.value = true

  try {
    await createArtist(newArtist.value)
    showNotification('Artist created successfully!', 'success')
    showCreateModal.value = false
    newArtist.value = { name: '' }
    await loadArtists()
  } catch (err: any) {
    error.value = err.message || 'Failed to create artist'
  } finally {
    creating.value = false
  }
}

const handleDeleteArtist = async (artistId: string, artistName: string) => {
  if (!confirm(`Are you sure you want to delete "${artistName}"? This action cannot be undone and will also delete all associated tracks.`)) {
    return
  }

  try {
    await deleteArtist(artistId)
    showNotification('Artist deleted successfully!', 'success')
    await loadArtists()
  } catch (err: any) {
    showNotification(err.message || 'Failed to delete artist', 'error')
    console.error('Failed to delete artist:', err)
  }
}



const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = message
  notificationType.value = type
  setTimeout(() => {
    notification.value = ''
  }, 5000)
}

useSeoMeta({
  title: 'Artists - MusicAid',
  description: 'Manage your artists and their music',
})
</script>

