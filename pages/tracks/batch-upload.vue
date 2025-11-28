<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-ph-arrow-left"
          @click="router.push('/tracks')"
        >
          Back to Tracks
        </UButton>
      </div>
      <h1 class="text-3xl font-bold text-default mb-2">Batch Upload Tracks</h1>
      <p class="text-muted">Upload multiple audio files to create tracks automatically</p>
    </div>

    <!-- Configuration Card -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Upload Settings</h2>
      </template>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-default mb-1">
            Artist <span class="text-error">*</span>
          </label>
          <USelect
            v-model="selectedArtistId"
            :items="artistOptions"
            placeholder="Select an artist"
            required
            :disabled="uploading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-default mb-1">
            Workflow Template (optional)
          </label>
          <USelect
            v-model="selectedTemplateId"
            :items="templateOptions"
            placeholder="Select a template (optional)"
            :disabled="uploading"
            @update:model-value="handleTemplateChange"
          />
          <p class="mt-1 text-xs text-muted">
            Select a workflow template to apply to all tracks
          </p>
        </div>

        <div v-if="selectedTemplateId && availableStatuses.length > 0">
          <label class="block text-sm font-medium text-default mb-1">
            Initial Stage (optional)
          </label>
          <USelect
            v-model="selectedStatusId"
            :items="statusOptions"
            placeholder="Select initial stage (optional)"
            :disabled="uploading"
          />
          <p class="mt-1 text-xs text-muted">
            Set the initial workflow stage for all tracks. If not selected, the first stage of the template will be used.
          </p>
        </div>
      </div>
    </UCard>

    <!-- File Selection Card -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Select Files</h2>
      </template>
      <div class="space-y-4">
        <div
          class="border-2 border-dashed border-default rounded-lg p-8 text-center hover:border-default/80 transition-colors"
          :class="{ 'border-primary bg-primary/10': isDragging }"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
        >
          <input
            ref="fileInput"
            type="file"
            accept="audio/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
          <UIcon name="i-ph-music-note" class="w-12 h-12 text-dimmed mx-auto mb-3" />
          <p class="text-sm text-muted mb-2">
            Drag and drop audio files here, or
            <button
              type="button"
              class="text-primary hover:text-primary/80 font-medium"
              @click="fileInput?.click()"
              :disabled="uploading"
            >
              browse
            </button>
          </p>
          <p class="text-xs text-muted">
            Supported formats: MP3, WAV, FLAC, M4A (Max 50MB per file)
          </p>
        </div>

        <!-- Selected Files List -->
        <div v-if="selectedFiles.length > 0" class="space-y-2">
          <div class="flex justify-between items-center">
            <p class="text-sm font-medium text-default">
              {{ selectedFiles.length }} file{{ selectedFiles.length !== 1 ? 's' : '' }} selected
            </p>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              @click="clearFiles"
              :disabled="uploading"
            >
              Clear All
            </UButton>
          </div>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-default rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-default truncate">{{ file.name }}</p>
                <p class="text-xs text-muted">{{ formatFileSize(file.size) }}</p>
              </div>
              <UButton
                v-if="!uploading"
                color="neutral"
                variant="ghost"
                icon="i-ph-x"
                size="sm"
                @click="removeFile(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Upload Progress Card -->
    <UCard v-if="uploadResults.length > 0" class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Upload Progress</h2>
      </template>
      <div class="space-y-3">
        <div
          v-for="(result, index) in uploadResults"
          :key="index"
          class="p-3 rounded-lg"
          :class="{
            'bg-green-50': result.status === 'success',
            'bg-red-50': result.status === 'error',
            'bg-blue-50': result.status === 'processing',
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-default truncate">{{ result.fileName }}</p>
              <p class="text-xs text-muted mt-1">
                <span v-if="result.status === 'processing'">Processing...</span>
                <span v-else-if="result.status === 'success'">
                  Track created: {{ result.trackName }}
                </span>
                <span v-else-if="result.status === 'error'" class="text-error">
                  {{ result.error }}
                </span>
              </p>
            </div>
            <div class="ml-4">
              <UIcon
                v-if="result.status === 'processing'"
                name="i-ph-arrow-clockwise"
                class="w-5 h-5 text-primary animate-spin"
              />
              <UIcon
                v-else-if="result.status === 'success'"
                name="i-ph-check-circle"
                class="w-5 h-5 text-success"
              />
              <UIcon
                v-else-if="result.status === 'error'"
                name="i-ph-x-circle"
                class="w-5 h-5 text-error"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Error Message -->
    <UAlert v-if="error" color="error" variant="soft" :title="error" class="mb-6" />

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        @click="router.push('/tracks')"
        :disabled="uploading"
      >
        Cancel
      </UButton>
      <UButton
        color="primary"
        :loading="uploading"
        :disabled="!canUpload"
        @click="handleBatchUpload"
      >
        {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Track${selectedFiles.length !== 1 ? 's' : ''}` }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Artist } from '~/composables/useArtists'
import type { Template, TemplateWithStatuses, TrackStatus } from '~/composables/useWorkflow'
import type { TrackInsert } from '~/composables/useTracks'

const router = useRouter()
const { getArtists } = useArtists()
const { getTemplates, getTemplateWithStatuses } = useWorkflow()
const { createTrack } = useTracks()
const { createAudioFile } = useAudio()
const user = useSupabaseUser()

interface FileWithDuration extends File {
  duration?: number | null
}

interface UploadResult {
  fileName: string
  status: 'processing' | 'success' | 'error'
  trackName?: string
  error?: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<FileWithDuration[]>([])
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const uploadResults = ref<UploadResult[]>([])

const artists = ref<Artist[]>([])
const templates = ref<Template[]>([])
const templateStatuses = ref<TrackStatus[]>([])

const selectedArtistId = ref<string>('')
const selectedTemplateId = ref<string | undefined>(undefined)
const selectedStatusId = ref<string | undefined>(undefined)

const artistOptions = computed(() => {
  return artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  }))
})

const templateOptions = computed(() => [
  { label: 'None', value: undefined },
  ...templates.value.map(template => ({
    label: template.name,
    value: template.id,
  })),
])

const availableStatuses = computed(() => templateStatuses.value)

const statusOptions = computed(() => {
  return availableStatuses.value.map(status => ({
    label: status.title || status.name,
    value: status.id,
  }))
})

const canUpload = computed(() => {
  return (
    selectedFiles.value.length > 0 &&
    selectedArtistId.value !== '' &&
    !uploading.value
  )
})

// Load data
onMounted(async () => {
  await loadArtists()
  await loadTemplates()
})

const loadArtists = async () => {
  try {
    artists.value = await getArtists()
  } catch (err: any) {
    error.value = 'Failed to load artists'
    console.error('Failed to load artists:', err)
  }
}

const loadTemplates = async () => {
  try {
    templates.value = await getTemplates()
  } catch (err: any) {
    console.error('Failed to load templates:', err)
    templates.value = []
  }
}

const handleTemplateChange = async (templateId: string | undefined) => {
  selectedStatusId.value = undefined
  templateStatuses.value = []

  if (templateId) {
    try {
      const template = await getTemplateWithStatuses(templateId)
      if (template && template.statuses) {
        templateStatuses.value = template.statuses
        // Auto-select first status if available
        if (template.statuses.length > 0 && !selectedStatusId.value) {
          // Don't auto-select, let user choose
        }
      }
    } catch (err: any) {
      console.error('Failed to load template statuses:', err)
    }
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await addFiles(Array.from(target.files))
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    await addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = async (files: File[]) => {
  error.value = ''
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a']
  const maxSizeBytes = 50 * 1024 * 1024 // 50MB

  for (const file of files) {
    // Validate file type
    if (!validTypes.some(type => {
      const typePart = type.split('/')[1]
      return typePart && file.type.includes(typePart)
    })) {
      error.value = `Invalid file type: ${file.name}. Please upload an audio file.`
      continue
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      error.value = `File size exceeds 50MB limit: ${file.name}`
      continue
    }

    // Check if file already exists
    if (selectedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      continue
    }

    // Extract duration
    const fileWithDuration = file as FileWithDuration
    try {
      const audioUrl = URL.createObjectURL(file)
      const audio = new Audio(audioUrl)
      
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          fileWithDuration.duration = Math.round(audio.duration)
          URL.revokeObjectURL(audioUrl)
          resolve()
        })
        audio.addEventListener('error', (e) => {
          URL.revokeObjectURL(audioUrl)
          reject(e)
        })
        audio.load()
      })
    } catch (err) {
      // If duration extraction fails, continue without it
      fileWithDuration.duration = null
    }

    selectedFiles.value.push(fileWithDuration)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
  uploadResults.value = []
  error.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const extractTrackName = (filename: string): string => {
  // Remove file extension
  return filename.replace(/\.[^/.]+$/, '')
}

const handleBatchUpload = async () => {
  if (!canUpload.value) return

  uploading.value = true
  error.value = ''
  uploadResults.value = []

  // Determine initial status
  let initialStatusId: string | null = selectedStatusId.value || null

  // If template is selected but no status chosen, get first status from template
  if (selectedTemplateId.value && !initialStatusId && templateStatuses.value.length > 0) {
    const firstStatus = templateStatuses.value[0]
    if (firstStatus) {
      initialStatusId = firstStatus.id
    }
  }

  // Process each file
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i]
    if (!file) continue
    const trackName = extractTrackName(file.name)

    // Add processing result
    uploadResults.value.push({
      fileName: file.name,
      status: 'processing',
    })

    try {
      // 1. Create track
      const trackData: TrackInsert = {
        name: trackName,
        artist_id: selectedArtistId.value,
        template_id: selectedTemplateId.value || null,
        track_status_id: initialStatusId,
        location: 'Soundation',
        created_by: user.value?.id || null,
      }

      const track = await createTrack(trackData)

      // 2. Upload audio file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('track_id', track.id)
      if (file.duration !== null && file.duration !== undefined) {
        formData.append('duration_seconds', file.duration.toString())
      }

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(errorData.message || `Upload failed: ${response.statusText}`)
      }

      const uploadResult = await response.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      // 3. Create audio file record
      await createAudioFile({
        name: trackName,
        slug: uploadResult.slug,
        file_url: uploadResult.fileUrl,
        track_id: track.id,
        version: null,
        duration_seconds: uploadResult.duration_seconds || file.duration || null,
        format: uploadResult.format || null,
        bitrate: uploadResult.bitrate || null,
        sample_rate: uploadResult.sample_rate || null,
        file_size_bytes: uploadResult.file_size_bytes || file.size || null,
        created_by: user.value?.id || null,
      })

      // Update result to success
      uploadResults.value[i] = {
        fileName: file.name,
        status: 'success',
        trackName: track.name,
      }
    } catch (err: any) {
      // Update result to error
      uploadResults.value[i] = {
        fileName: file.name,
        status: 'error',
        error: err.message || 'Failed to create track and upload file',
      }
      console.error(`Failed to process ${file.name}:`, err)
    }
  }

  uploading.value = false

  // Check if all succeeded
  const allSucceeded = uploadResults.value.every(r => r.status === 'success')
  if (allSucceeded) {
    // Redirect to tracks page after a short delay
    setTimeout(() => {
      router.push('/tracks')
    }, 2000)
  }
}
</script>

