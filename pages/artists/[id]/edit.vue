<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Artist Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/artists">Back to Artists</UButton>
    </UCard>

    <!-- Edit Form -->
    <div v-else-if="artist">
      <div class="mb-8">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            :to="`/artists/${artist.id}`"
          >
            Back
          </UButton>
        <h1 class="text-3xl font-bold text-default mt-4">Edit Artist</h1>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-default">Artist Information</h2>
        </template>

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label for="artist-name" class="block text-sm font-medium text-default mb-1">
              Artist Name
            </label>
            <UInput
              id="artist-name"
              v-model="formData.name"
              placeholder="Enter artist name"
              required
              :disabled="saving"
            />
          </div>

          <div>
            <label for="artist-slug" class="block text-sm font-medium text-default mb-1">
              Slug
            </label>
            <UInput
              id="artist-slug"
              v-model="formData.slug"
              placeholder="artist-slug"
              required
              :disabled="saving"
            />
            <p class="mt-1 text-xs text-muted">
              Used in URLs. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <UAlert v-if="saveError" color="error" variant="soft" :title="saveError" />

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              color="neutral"
              variant="ghost"
              :to="`/artists/${artist.id}`"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Artist, ArtistUpdate } from '~/composables/useArtists'

const route = useRoute()
const { getArtist, updateArtist } = useArtists()

const artist = ref<Artist | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveError = ref('')

const formData = ref<ArtistUpdate>({
  name: '',
  slug: '',
})

// Load artist
onMounted(async () => {
  await loadArtist()
})

const loadArtist = async () => {
  loading.value = true
  try {
    const artistId = route.params.id as string
    artist.value = await getArtist(artistId)
    if (!artist.value) {
      error.value = 'Artist not found'
    } else {
      formData.value = {
        name: artist.value.name,
        slug: artist.value.slug,
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load artist'
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  if (!artist.value) return

  saveError.value = ''
  saving.value = true

  try {
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.value.slug || '')) {
      saveError.value = 'Slug must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateArtist(artist.value.id, formData.value)
    navigateTo(`/artists/${artist.value.id}`)
  } catch (err: any) {
    saveError.value = err.message || 'Failed to update artist'
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: () => (artist.value ? `Edit ${artist.value.name} - MusicAid` : 'Edit Artist - MusicAid'),
})
</script>

