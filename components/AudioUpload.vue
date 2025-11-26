<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ label || 'Upload Audio File' }}
      </label>
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-blue-500 bg-blue-50': isDragging }"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
      >
        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <UIcon name="i-heroicons-musical-note" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-sm text-gray-600 mb-2">
          Drag and drop an audio file here, or
          <button
            type="button"
            class="text-blue-600 hover:text-blue-800 font-medium"
            @click="fileInput?.click()"
          >
            browse
          </button>
        </p>
        <p class="text-xs text-gray-500">
          Supported formats: MP3, WAV, FLAC, M4A (Max {{ maxSizeMB }}MB)
        </p>
      </div>
    </div>

    <!-- Selected File Info -->
    <div v-if="selectedFile" class="p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
          <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="clearFile"
          />
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>Uploading...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <UProgress :value="uploadProgress" />
    </div>

    <!-- Error Message -->
    <UAlert v-if="error" color="error" variant="soft" :title="error" />

    <!-- Success Message -->
    <UAlert v-if="success" color="success" variant="soft" :title="success" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  maxSizeMB?: number
  trackId?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMB: 50,
})

const emit = defineEmits<{
  uploaded: [result: { fileUrl: string; fileKey: string; fileName: string; slug: string; size: number; type: string }]
  error: [error: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0])
  }
}

const processFile = (file: File) => {
  error.value = ''
  success.value = ''

  // Validate file type
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a']
  if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
    error.value = 'Invalid file type. Please upload an audio file.'
    return
  }

  // Validate file size
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    error.value = `File size exceeds ${props.maxSizeMB}MB limit.`
    return
  }

  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  error.value = ''
  success.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Expose upload method for parent component
const upload = async (name?: string, description?: string) => {
  if (!selectedFile.value) {
    error.value = 'Please select a file first'
    return
  }

  if (!props.trackId) {
    error.value = 'Track ID is required'
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''
  success.value = ''

  try {
    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('track_id', props.trackId)
    if (name) {
      formData.append('name', name)
    }
    if (description) {
      formData.append('description', description)
    }

    // Simulate progress (we can't track actual upload progress easily with fetch)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    // Upload to API
    const response = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData,
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.success) {
      success.value = 'File uploaded successfully!'
      emit('uploaded', {
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
        fileName: result.fileName,
        slug: result.slug,
        size: result.size,
        type: result.type,
      })
      
      // Clear file after a short delay
      setTimeout(() => {
        clearFile()
      }, 2000)
    } else {
      throw new Error(result.error || 'Upload failed')
    }
  } catch (err: any) {
    error.value = err.message || 'Upload failed'
    uploading.value = false
    emit('error', error.value)
  } finally {
    uploading.value = false
  }
}

defineExpose({
  upload,
  clearFile,
  selectedFile: computed(() => selectedFile.value),
})
</script>

