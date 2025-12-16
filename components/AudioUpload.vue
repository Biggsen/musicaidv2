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
        <UIcon name="i-ph-music-note" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
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
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>{{ formatFileSize(selectedFile.size) }}</span>
            <span v-if="extractedDuration" class="font-medium text-gray-700">
              {{ formatDuration(extractedDuration) }}
            </span>
          </div>
        </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-x"
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
  uploaded: [result: {
    fileUrl: string
    fileKey: string
    fileName: string
    slug: string
    size: number
    type: string
    version?: string | null
    duration_seconds?: number | null
    format?: string | null
    bitrate?: number | null
    sample_rate?: number | null
    file_size_bytes?: number | null
  }]
  error: [error: string]
}>()

const extractedDuration = ref<number | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file: File) => {
  error.value = ''
  success.value = ''

  // Validate file type
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a']
  if (!validTypes.some(type => {
    const typePart = type.split('/')[1]
    return typePart && file.type.includes(typePart)
  })) {
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
  extractedDuration.value = null

  // Extract duration using browser Audio API
  try {
    const audioUrl = URL.createObjectURL(file)
    const audio = new Audio(audioUrl)
    
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('loadedmetadata', () => {
        extractedDuration.value = Math.round(audio.duration)
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
    console.warn('Failed to extract audio duration:', err)
  }
}

const clearFile = () => {
  selectedFile.value = null
  extractedDuration.value = null
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

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// Expose upload method for parent component
const upload = async (name?: string, description?: string, version?: string) => {
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

  // Check file size - Netlify functions have a 6MB request body limit
  const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB
  if (selectedFile.value && selectedFile.value.size > MAX_FILE_SIZE) {
    uploading.value = false
    error.value = `File size (${(selectedFile.value.size / 1024 / 1024).toFixed(2)}MB) exceeds the 6MB limit. Please use a smaller file.`
    return
  }

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
    if (version) {
      formData.append('version', version)
    }
    if (extractedDuration.value !== null) {
      formData.append('duration_seconds', extractedDuration.value.toString())
    }

    // Simulate progress (we can't track actual upload progress easily with fetch)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    // Upload to API
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before fetch request', JSON.stringify({location:'AudioUpload.vue:246',message:'Before fetch request',data:{fileSize:selectedFile.value?.size||0,fileName:selectedFile.value?.name||'',trackId:props.trackId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion
    const response = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData,
    })
    // #region agent log
    console.log('[UPLOAD_DEBUG] Fetch response received', JSON.stringify({location:'AudioUpload.vue:251',message:'Fetch response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,headers:Object.fromEntries(response.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      // #region agent log
      console.log('[UPLOAD_DEBUG] Response not OK', JSON.stringify({location:'AudioUpload.vue:257',message:'Response not OK',data:{status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
      // #endregion
      let errorData;
      try {
        const text = await response.text();
        // #region agent log
        console.log('[UPLOAD_DEBUG] Error response text', JSON.stringify({location:'AudioUpload.vue:261',message:'Error response text',data:{textLength:text.length,textPreview:text.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
        // #endregion
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { message: 'Upload failed' };
        // #region agent log
        console.log('[UPLOAD_DEBUG] Failed to parse error response', JSON.stringify({location:'AudioUpload.vue:265',message:'Failed to parse error response',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
        // #endregion
      }
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`)
    }

    // #region agent log
    console.log('[UPLOAD_DEBUG] Before parsing success response', JSON.stringify({location:'AudioUpload.vue:270',message:'Before parsing success response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion
    let result;
    try {
      const text = await response.text();
      // #region agent log
      console.log('[UPLOAD_DEBUG] Success response text received', JSON.stringify({location:'AudioUpload.vue:274',message:'Success response text received',data:{textLength:text.length,textPreview:text.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
      // #endregion
      result = JSON.parse(text);
      // #region agent log
      console.log('[UPLOAD_DEBUG] Success response parsed', JSON.stringify({location:'AudioUpload.vue:277',message:'Success response parsed',data:{hasSuccess:!!result.success,resultKeys:Object.keys(result||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
      // #endregion
    } catch (e) {
      // #region agent log
      console.log('[UPLOAD_DEBUG] Failed to parse success response', JSON.stringify({location:'AudioUpload.vue:280',message:'Failed to parse success response',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
      // #endregion
      throw new Error('Failed to parse response: ' + String(e));
    }
    
    if (result.success) {
      success.value = 'File uploaded successfully!'
      emit('uploaded', {
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
        fileName: result.fileName,
        slug: result.slug,
        size: result.size,
        type: result.type,
        version: result.version || null,
        duration_seconds: result.duration_seconds || extractedDuration.value || null,
        format: result.format || null,
        bitrate: result.bitrate || null,
        sample_rate: result.sample_rate || null,
        file_size_bytes: result.file_size_bytes || null,
      })
      
      // Clear file after a short delay
      setTimeout(() => {
        clearFile()
      }, 2000)
    } else {
      throw new Error(result.error || 'Upload failed')
    }
  } catch (err: any) {
    // #region agent log
    console.log('[UPLOAD_DEBUG] Client error caught', JSON.stringify({location:'AudioUpload.vue:290',message:'Client error caught',data:{errorMessage:err?.message||'unknown',errorName:err?.name||'unknown',stack:err?.stack?.substring(0,200)||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion
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

