<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-exclamation-triangle" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Track Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/tracks">Back to Tracks</UButton>
    </UCard>

    <!-- Edit Form -->
    <div v-else-if="track">
      <div class="mb-8">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            :to="`/tracks/${track.id}`"
          >
            Back
          </UButton>
        <h1 class="text-3xl font-bold text-default mt-4">Edit Track</h1>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-default">Track Information</h2>
        </template>

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label for="track-name" class="block text-sm font-medium text-default mb-1">
              Track Name
            </label>
            <UInput
              id="track-name"
              v-model="formData.name"
              placeholder="Enter track name"
              required
              :disabled="saving"
            />
          </div>

          <div>
            <label for="track-key" class="block text-sm font-medium text-default mb-1">
              Track Key
            </label>
            <UInput
              id="track-key"
              v-model="formData.key"
              placeholder="track-key"
              required
              :disabled="saving"
            />
            <p class="mt-1 text-xs text-muted">
              Unique identifier. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label for="track-template" class="block text-sm font-medium text-default mb-1">
              Workflow Template
            </label>
            <USelect
              id="track-template"
              v-model="formData.template_id"
              :items="templateOptions"
              placeholder="Select a template (optional)"
              :disabled="saving || loadingTemplates"
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
                v-model.number="formData.tempo"
                type="number"
                placeholder="120"
                :disabled="saving"
              />
            </div>
            <div>
              <label for="track-samples" class="block text-sm font-medium text-default mb-1">
                Samples
              </label>
              <UInput
                id="track-samples"
                v-model="formData.samples"
                placeholder="Soundation"
                :disabled="saving"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="track-minutes" class="block text-sm font-medium text-default mb-1">
                Minutes
              </label>
              <UInput
                id="track-minutes"
                v-model.number="formData.minutes"
                type="number"
                placeholder="3"
                :disabled="saving"
              />
            </div>
            <div>
              <label for="track-seconds" class="block text-sm font-medium text-default mb-1">
                Seconds
              </label>
              <UInput
                id="track-seconds"
                v-model.number="formData.seconds"
                type="number"
                placeholder="45"
                :disabled="saving"
              />
            </div>
          </div>

          <div>
            <label for="track-isrc" class="block text-sm font-medium text-default mb-1">
              ISRC Code
            </label>
            <UInput
              id="track-isrc"
              v-model="formData.isrc_code"
              placeholder="USRC17607839"
              :disabled="saving"
            />
          </div>

          <UAlert v-if="saveError" color="error" variant="soft" :title="saveError" />

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              color="neutral"
              variant="ghost"
              :to="`/tracks/${track.id}`"
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

import type { Track, TrackUpdate } from '~/composables/useTracks'
import type { Template } from '~/composables/useWorkflow'

const route = useRoute()
const { getTrack, updateTrack } = useTracks()
const { getTemplates } = useWorkflow()

const track = ref<Track | null>(null)
const templates = ref<Template[]>([])
const loading = ref(true)
const loadingTemplates = ref(false)
const saving = ref(false)
const error = ref('')
const saveError = ref('')

const templateOptions = computed(() => [
  { label: 'None', value: null },
  ...templates.value.map(template => ({
    label: template.name,
    value: template.id,
  })),
])

const formData = ref<TrackUpdate>({
  name: '',
  key: '',
  template_id: null,
  tempo: null,
  minutes: null,
  seconds: null,
  samples: '',
  isrc_code: null,
})

// Load track and templates
onMounted(async () => {
  await Promise.all([loadTrack(), loadTemplates()])
})

const loadTrack = async () => {
  loading.value = true
  try {
    const trackId = route.params.id as string
    track.value = await getTrack(trackId)
    if (!track.value) {
      error.value = 'Track not found'
    } else {
      formData.value = {
        name: track.value.name,
        key: track.value.key,
        template_id: track.value.template_id,
        tempo: track.value.tempo,
        minutes: track.value.minutes,
        seconds: track.value.seconds,
        samples: track.value.samples,
        isrc_code: track.value.isrc_code,
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load track'
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  loadingTemplates.value = true
  try {
    templates.value = await getTemplates()
  } catch (err: any) {
    console.error('Failed to load templates:', err)
    templates.value = []
  } finally {
    loadingTemplates.value = false
  }
}

const handleUpdate = async () => {
  if (!track.value) return

  saveError.value = ''
  saving.value = true

  try {
    // Validate key format
    if (!/^[a-z0-9-]+$/.test(formData.value.key || '')) {
      saveError.value = 'Key must contain only lowercase letters, numbers, and hyphens'
      return
    }

    await updateTrack(track.value.id, formData.value)
    navigateTo(`/tracks/${track.value.id}`)
  } catch (err: any) {
    saveError.value = err.message || 'Failed to update track'
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: () => (track.value ? `Edit ${track.value.name} - MusicAid` : 'Edit Track - MusicAid'),
})
</script>

