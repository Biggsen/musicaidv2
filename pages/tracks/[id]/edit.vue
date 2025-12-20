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
            <label for="track-description" class="block text-sm font-medium text-default mb-1">
              Description
            </label>
            <UTextarea
              id="track-description"
              v-model="formData.description"
              placeholder="Enter track description..."
              :rows="6"
              class="w-full"
              :disabled="saving"
            />
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
              @update:model-value="handleTemplateChange"
            />
            <p class="mt-1 text-xs text-muted">
              Select a workflow template to track production progress.
            </p>
          </div>

          <div v-if="formData.template_id && availableStatuses.length > 0">
            <label for="track-status" class="block text-sm font-medium text-default mb-1">
              Current Stage
            </label>
            <USelect
              id="track-status"
              v-model="selectedStatusId"
              :items="statusOptions"
              placeholder="Select stage"
              :disabled="saving || loadingTemplates"
            />
            <p class="mt-1 text-xs text-muted">
              Set the current workflow stage for this track.
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
                :disabled="saving"
              />
            </div>
            <div class="w-full">
              <label for="track-time-signature" class="block text-sm font-medium text-default mb-1">
                Time Signature
              </label>
              <USelect
                id="track-time-signature"
                :model-value="currentTimeSignature ?? undefined"
                :items="timeSignatureOptions"
                placeholder="Select time signature"
                :disabled="saving"
                style="width: 180px;"
                @update:model-value="(val) => currentTimeSignature = val ?? null"
              />
              <div v-if="showCustomTimeSignature" class="mt-2 flex items-center gap-2">
                <UInput
                  id="track-time-signature-numerator"
                  v-model.number="formData.time_signature_numerator"
                  type="number"
                  placeholder="4"
                  class="w-20"
                  :disabled="saving"
                />
                <span class="text-muted">/</span>
                <UInput
                  id="track-time-signature-denominator"
                  v-model.number="formData.time_signature_denominator"
                  type="number"
                  placeholder="4"
                  class="w-20"
                  :disabled="saving"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
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
import type { Template, TrackStatus } from '~/composables/useWorkflow'

const route = useRoute()
const { getTrack, updateTrack } = useTracks()
const { getTemplates, getTemplateWithStatuses, getTrackStatusWithSteps, completeStep } = useWorkflow()

const track = ref<Track | null>(null)
const templates = ref<Template[]>([])
const templateStatuses = ref<TrackStatus[]>([])
const selectedStatusId = ref<string | undefined>(undefined)
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

const statusOptions = computed(() => {
  return templateStatuses.value.map(status => ({
    label: status.name,
    value: status.id,
  }))
})

const availableStatuses = computed(() => templateStatuses.value)

const formData = ref<TrackUpdate>({
  name: '',
  key: '',
  template_id: null,
  tempo: null,
  time_signature_numerator: null,
  time_signature_denominator: null,
  time_signature_varied: false,
  minutes: null,
  seconds: null,
  samples: '',
  isrc_code: null,
  description: null,
})

// Define time signature options
const timeSignatureOptions = [
  { label: '4/4', value: '4/4', numerator: 4, denominator: 4 },
  { label: '3/4', value: '3/4', numerator: 3, denominator: 4 },
  { label: '6/8', value: '6/8', numerator: 6, denominator: 8 },
  { label: 'Varied', value: 'varied' },
  { label: 'Custom', value: 'custom' },
]

// Track explicitly selected custom option
const explicitCustomSelected = ref(false)

// Computed property to determine current selection
const currentTimeSignature = computed({
  get: () => {
    if (formData.value.time_signature_varied) {
      explicitCustomSelected.value = false
      return 'varied'
    }
    // If custom was explicitly selected, return 'custom' regardless of values
    if (explicitCustomSelected.value) {
      return 'custom'
    }
    const num = formData.value.time_signature_numerator
    const den = formData.value.time_signature_denominator
    if (num && den) {
      // Check if it matches a common option
      const match = timeSignatureOptions.find(
        opt => opt.numerator === num && opt.denominator === den
      )
      if (match) {
        return match.value
      }
      return 'custom'
    }
    return null
  },
  set: (value: string | null) => {
    if (value === 'varied') {
      explicitCustomSelected.value = false
      formData.value.time_signature_varied = true
      formData.value.time_signature_numerator = null
      formData.value.time_signature_denominator = null
    } else if (value === 'custom') {
      explicitCustomSelected.value = true
      formData.value.time_signature_varied = false
      // Don't set default values - keep existing or leave null
    } else if (value) {
      explicitCustomSelected.value = false
      // Common option selected
      formData.value.time_signature_varied = false
      const option = timeSignatureOptions.find(opt => opt.value === value)
      if (option && option.numerator && option.denominator) {
        formData.value.time_signature_numerator = option.numerator
        formData.value.time_signature_denominator = option.denominator
      }
    } else {
      // Clear all
      explicitCustomSelected.value = false
      formData.value.time_signature_varied = false
      formData.value.time_signature_numerator = null
      formData.value.time_signature_denominator = null
    }
  }
})

// Show custom inputs when custom is selected
const showCustomTimeSignature = computed(() => {
  return currentTimeSignature.value === 'custom'
})

// Load track and templates
onMounted(async () => {
  await Promise.all([loadTrack(), loadTemplates()])
})

const handleTemplateChange = async (templateId: string | null) => {
  selectedStatusId.value = undefined
  templateStatuses.value = []

  if (templateId) {
    try {
      const template = await getTemplateWithStatuses(templateId)
      if (template && template.statuses) {
        templateStatuses.value = template.statuses
      }
    } catch (err: any) {
      console.error('Failed to load template statuses:', err)
    }
  }
}

const loadTrack = async () => {
  loading.value = true
  templateStatuses.value = []
  selectedStatusId.value = undefined
  
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
        time_signature_numerator: track.value.time_signature_numerator,
        time_signature_denominator: track.value.time_signature_denominator,
        time_signature_varied: track.value.time_signature_varied ?? false,
        minutes: track.value.minutes,
        seconds: track.value.seconds,
        samples: track.value.samples,
        isrc_code: track.value.isrc_code,
        description: track.value.description,
      }
      
      // Load template statuses if track has a template
      if (track.value.template_id) {
        try {
          const template = await getTemplateWithStatuses(track.value.template_id)
          if (template && template.statuses) {
            templateStatuses.value = template.statuses
            // Set current status if track has one
            if (track.value.track_status_id) {
              selectedStatusId.value = track.value.track_status_id
            }
          }
        } catch (err: any) {
          console.error('Failed to load template statuses:', err)
        }
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
      saving.value = false
      return
    }

    // If template is set to None, clear status and step as well
    const updateData = { ...formData.value }
    const newStatusId = selectedStatusId.value !== undefined ? selectedStatusId.value || null : null
    const oldStatusId = track.value.track_status_id

    if (updateData.template_id === null) {
      updateData.track_status_id = null
      updateData.step_id = null
    } else if (newStatusId !== null && newStatusId !== oldStatusId) {
      // Status is being set or changed - complete all steps in previous statuses
      updateData.track_status_id = newStatusId
      
      // Get the template with statuses to find previous statuses
      if (updateData.template_id) {
        try {
          const template = await getTemplateWithStatuses(updateData.template_id)
          if (template && template.statuses) {
            // Find the index of the new status
            const newStatusIndex = template.statuses.findIndex(status => status.id === newStatusId)
            
            if (newStatusIndex > 0) {
              // Get all previous statuses (statuses before the new one)
              const previousStatuses = template.statuses.slice(0, newStatusIndex)
              
              // For each previous status, get its steps and mark them as completed
              for (const previousStatus of previousStatuses) {
                try {
                  const statusWithSteps = await getTrackStatusWithSteps(previousStatus.id)
                  if (statusWithSteps && statusWithSteps.steps) {
                    // Mark all steps in this status as completed
                    await Promise.all(
                      statusWithSteps.steps.map(step => completeStep(track.value!.id, step.id))
                    )
                  }
                } catch (err: any) {
                  console.error(`Failed to complete steps for status ${previousStatus.id}:`, err)
                  // Continue with other statuses even if one fails
                }
              }
            }
          }
        } catch (err: any) {
          console.error('Failed to load template statuses for step completion:', err)
          // Continue with the update even if step completion fails
        }
      }
    } else if (selectedStatusId.value !== undefined) {
      // Use the selected status if one was chosen
      updateData.track_status_id = selectedStatusId.value || null
    }

    await updateTrack(track.value.id, updateData)
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

