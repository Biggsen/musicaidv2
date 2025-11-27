<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Test R2 Audio Upload</h1>

    <UCard class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Upload Test</h2>
      </template>

      <form @submit.prevent="handleUpload" class="space-y-4">
        <div>
          <label for="track-id" class="block text-sm font-medium text-gray-700 mb-1">
            Track ID (required)
          </label>
          <UInput
            id="track-id"
            v-model="trackId"
            placeholder="Enter a track ID"
            required
            :disabled="uploading"
          />
          <p class="mt-1 text-xs text-gray-500">
            Use a valid track ID from your database, or any UUID for testing
          </p>
        </div>

        <div>
          <label for="file-name" class="block text-sm font-medium text-gray-700 mb-1">
            Name (optional)
          </label>
          <UInput
            id="file-name"
            v-model="fileName"
            placeholder="Audio file name"
            :disabled="uploading"
          />
        </div>

        <div>
          <label for="file-description" class="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <UTextarea
            id="file-description"
            v-model="description"
            placeholder="File description"
            :rows="2"
            :disabled="uploading"
          />
        </div>

        <div>
          <label for="audio-file" class="block text-sm font-medium text-gray-700 mb-1">
            Audio File
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            @change="handleFileSelect"
            :disabled="uploading"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p v-if="selectedFile" class="mt-2 text-sm text-gray-600">
            Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>

        <UButton type="submit" color="primary" :loading="uploading" :disabled="!selectedFile || !trackId">
          Upload to R2
        </UButton>
      </form>
    </UCard>

    <!-- Upload Progress -->
    <UCard v-if="uploading" class="mb-6">
      <div class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Uploading...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <UProgress :value="uploadProgress" />
      </div>
    </UCard>

    <!-- Success Result -->
    <UCard v-if="uploadResult" class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Upload Successful!</h2>
      </template>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">File URL</label>
          <div class="flex items-center gap-2">
            <code class="flex-1 p-2 bg-gray-100 rounded text-sm break-all">{{ uploadResult.fileUrl }}</code>
            <UButton
              color="primary"
              variant="ghost"
              size="sm"
              icon="i-heroicons-clipboard"
              @click="copyToClipboard(uploadResult.fileUrl)"
            >
              Copy
            </UButton>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">File Key</label>
          <code class="block p-2 bg-gray-100 rounded text-sm break-all">{{ uploadResult.fileKey }}</code>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">File Name</label>
            <p class="text-gray-900">{{ uploadResult.fileName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <p class="text-gray-900">{{ formatFileSize(uploadResult.size) }}</p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <p class="text-gray-900">{{ uploadResult.slug }}</p>
        </div>
        <div v-if="uploadResult.fileUrl">
          <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <audio :src="uploadResult.fileUrl" controls class="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </UCard>

    <!-- Error Result -->
    <UCard v-if="error" class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold text-red-900">Upload Failed</h2>
      </template>
      <UAlert color="error" variant="soft" :title="error" />
    </UCard>

    <!-- Raw Response (for debugging) -->
    <UCard v-if="uploadResult" class="mb-6">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900">Raw Response</h2>
      </template>
      <pre class="p-4 bg-gray-100 rounded text-xs overflow-auto">{{ JSON.stringify(uploadResult, null, 2) }}</pre>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const trackId = ref('')
const fileName = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref<any>(null)
const error = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    if (!fileName.value) {
      fileName.value = file.name
    }
  }
}

const handleUpload = async () => {
  if (!selectedFile.value || !trackId.value) {
    error.value = 'Please select a file and enter a track ID'
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''
  uploadResult.value = null

  try {
    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('track_id', trackId.value)
    if (fileName.value) {
      formData.append('name', fileName.value)
    }
    if (description.value) {
      formData.append('description', description.value)
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
    uploadResult.value = result
  } catch (err: any) {
    error.value = err.message || 'Upload failed'
    console.error('Upload error:', err)
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

useSeoMeta({
  title: 'Test R2 Upload - MusicAid',
})
</script>

