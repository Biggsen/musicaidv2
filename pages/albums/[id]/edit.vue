<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        :to="`/albums/${route.params.id}`"
      >
        Back to Album
      </UButton>
    </div>

    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold text-default">Edit Album</h1>
      </template>

      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label for="album-name" class="block text-sm font-medium text-default mb-1">
            Album Name
          </label>
          <UInput
            id="album-name"
            v-model="formData.name"
            placeholder="Enter album name"
            required
            :disabled="saving"
          />
        </div>

        <div>
          <label for="album-slug" class="block text-sm font-medium text-default mb-1">
            Slug
          </label>
          <UInput
            id="album-slug"
            v-model="formData.slug"
            placeholder="album-slug"
            required
            :disabled="saving"
          />
          <p class="mt-1 text-xs text-muted">
            Unique identifier. Lowercase letters, numbers, and hyphens only.
          </p>
        </div>

        <div>
          <label for="album-description" class="block text-sm font-medium text-default mb-1">
            Description (optional)
          </label>
          <UTextarea
            id="album-description"
            v-model="formData.description"
            placeholder="Album description"
            :rows="5"
            class="w-full"
            :disabled="saving"
          />
        </div>

        <div>
          <label for="album-release-date" class="block text-sm font-medium text-default mb-1">
            Release Date (optional)
          </label>
          <UInput
            id="album-release-date"
            v-model="formData.release_date"
            type="date"
            :disabled="saving"
          />
        </div>

        <UAlert v-if="error" color="error" variant="soft" :title="error" />

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            :to="`/albums/${route.params.id}`"
            :disabled="saving"
          >
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="saving">
            Save Changes
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Album, AlbumUpdate } from '~/composables/useAlbums'

const route = useRoute()
const router = useRouter()
const { getAlbum, updateAlbum } = useAlbums()

const album = ref<Album | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const formData = ref<AlbumUpdate>({
  name: '',
  slug: '',
  description: null,
  release_date: null,
  image_url: null,
})

// Load album data
onMounted(async () => {
  await loadAlbum()
})

const loadAlbum = async () => {
  loading.value = true
  try {
    const albumId = route.params.id as string
    album.value = await getAlbum(albumId)
    if (!album.value) {
      error.value = 'Album not found'
    } else {
      formData.value = {
        name: album.value.name,
        slug: album.value.slug,
        description: album.value.description,
        release_date: album.value.release_date
          ? new Date(album.value.release_date).toISOString().split('T')[0]
          : null,
        image_url: album.value.image_url,
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load album'
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  if (!album.value) return

  error.value = ''
  saving.value = true

  try {
    if (!/^[a-z0-9-]+$/.test(formData.value.slug || '')) {
      error.value = 'Slug must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateAlbum(album.value.id, formData.value)
    router.push(`/albums/${album.value.id}`)
  } catch (err: any) {
    error.value = err.message || 'Failed to update album'
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: () => (album.value ? `Edit ${album.value.name} - MusicAid` : 'Edit Album - MusicAid'),
  description: 'Edit album information',
})
</script>

