<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Track Not Found</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <UButton color="primary" to="/tracks">Back to Tracks</UButton>
    </UCard>

    <!-- Track Detail -->
    <div v-else-if="track">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-left"
              to="/tracks"
            >
              Back
            </UButton>
          <h1 class="text-3xl font-bold text-gray-900">{{ track.name }}</h1>
          <UBadge v-if="track.live_ready" color="success">Live Ready</UBadge>
          <UPopover :content="{ side: 'bottom', align: 'end' }">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
            />
            <template #content="slotProps">
              <div class="p-1">
                <UButton
                  v-for="item in menuItems"
                  :key="item.label"
                  variant="ghost"
                  :icon="item.icon"
                  block
                  @click.stop="() => {
                    if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                      slotProps.close();
                    }
                    item.click();
                  }"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </template>
          </UPopover>
        </div>
        <p class="text-gray-600">Key: {{ track.key }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Track Info Card -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold text-gray-900">Track Information</h2>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Track Name</label>
                  <p class="text-gray-900">{{ track.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Key</label>
                  <p class="text-gray-900">{{ track.key }}</p>
                </div>
                <div v-if="track.tempo">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tempo</label>
                  <p class="text-gray-900">{{ track.tempo }} BPM</p>
                </div>
                <div v-if="track.minutes !== null && track.seconds !== null">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p class="text-gray-900">
                    {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p class="text-gray-900">{{ track.location }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Live Ready</label>
                  <UBadge :color="track.live_ready ? 'success' : 'neutral'">
                    {{ track.live_ready ? 'Yes' : 'No' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Audio Files Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Audio Files</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="showUploadModal = true"
                >
                  Upload
                </UButton>
              </div>
            </template>

            <div v-if="audioFiles.length === 0" class="text-center py-8">
              <UIcon name="i-heroicons-musical-note" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600 mb-4">No audio files yet</p>
              <UButton color="primary" size="sm" icon="i-heroicons-plus" @click="showUploadModal = true">
                Upload Audio File
              </UButton>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="audio in audioFiles"
                :key="audio.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 mb-1">{{ audio.name }}</h4>
                    <p class="text-sm text-gray-600">{{ audio.description || 'No description' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      v-if="audio.file_url"
                      color="primary"
                      variant="ghost"
                      icon="i-heroicons-play"
                      size="sm"
                      @click="playAudio(audio)"
                    >
                      Play
                    </UButton>
                    <UPopover :content="{ side: 'bottom', align: 'end' }">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-heroicons-ellipsis-vertical"
                        size="sm"
                      />
                      <template #content="slotProps">
                        <div class="p-1">
                          <UButton
                            v-for="item in getAudioMenuItems(audio)"
                            :key="item.label"
                            variant="ghost"
                            :icon="item.icon"
                            block
                            size="sm"
                            @click.stop="() => {
                              if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                                slotProps.close();
                              }
                              item.click();
                            }"
                          >
                            {{ item.label }}
                          </UButton>
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Notes Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">Notes</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="showNoteModal = true"
                >
                  Add Note
                </UButton>
              </div>
            </template>

            <div v-if="notes.length === 0" class="text-center py-8">
              <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600">No notes yet</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="note in notes"
                :key="note.id"
                class="p-4 border border-gray-200 rounded-lg"
                :class="{ 'bg-gray-50': note.done }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-gray-900 whitespace-pre-wrap">{{ note.note }}</p>
                    <p class="text-xs text-gray-500 mt-2">
                      {{ formatDate(note.created_at) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
              <UButton
                :color="note.done ? 'success' : 'neutral'"
                variant="ghost"
                :icon="note.done ? 'i-heroicons-check-circle' : 'i-heroicons-circle-stack'"
                size="sm"
                @click="toggleNoteDone(note)"
              />
                    <UPopover :content="{ side: 'bottom', align: 'end' }">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-heroicons-ellipsis-vertical"
                        size="sm"
                      />
                      <template #content="slotProps">
                        <div class="p-1">
                          <UButton
                            v-for="item in getNoteMenuItems(note)"
                            :key="item.label"
                            variant="ghost"
                            :icon="item.icon"
                            block
                            size="sm"
                            @click.stop="() => {
                              if (slotProps && 'close' in slotProps && typeof slotProps.close === 'function') {
                                slotProps.close();
                              }
                              item.click();
                            }"
                          >
                            {{ item.label }}
                          </UButton>
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </template>
            <div class="space-y-2">
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-heroicons-pencil"
                @click="router.push(`/tracks/${track.id}/edit`)"
              >
                Edit Track
              </UButton>
              <UButton
                :color="track.live_ready ? 'neutral' : 'success'"
                variant="outline"
                block
                :icon="track.live_ready ? 'i-heroicons-x-circle' : 'i-heroicons-check-circle'"
                @click="toggleLiveReady"
              >
                {{ track.live_ready ? 'Mark Not Ready' : 'Mark Live Ready' }}
              </UButton>
            </div>
          </UCard>

          <!-- Track Metadata -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900">Metadata</h3>
            </template>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-gray-600">Created</p>
                <p class="text-gray-900 font-medium">{{ formatDate(track.created_at) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Last Updated</p>
                <p class="text-gray-900 font-medium">{{ formatDate(track.updated_at) }}</p>
              </div>
              <div v-if="track.isrc_code">
                <p class="text-gray-600">ISRC Code</p>
                <p class="text-gray-900 font-medium">{{ track.isrc_code }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Upload Audio Modal -->
      <UModal v-model:open="showUploadModal" title="Upload Audio File">
        <template #body>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Audio file upload functionality will be implemented with S3-compatible storage.
            </p>
            <UAlert
              color="info"
              variant="soft"
              title="Coming Soon"
              description="Audio file uploads will be available in a future update."
            />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="neutral" variant="ghost" @click="showUploadModal = false">
              Close
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Add Note Modal -->
      <UModal v-model:open="showNoteModal" title="Add Note">
        <template #body>
          <form id="add-note-form" @submit.prevent="handleAddNote" class="space-y-4">
            <div>
              <label for="note-text" class="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <UTextarea
                id="note-text"
                v-model="newNote.note"
                placeholder="Enter your note..."
                :rows="4"
                required
                :disabled="addingNote"
              />
            </div>
            <UAlert v-if="noteError" color="error" variant="soft" :title="noteError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showNoteModal = false"
              :disabled="addingNote"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              form="add-note-form"
              color="primary"
              :loading="addingNote"
            >
              Add Note
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Edit Note Modal -->
      <UModal v-model:open="showEditNoteModal" title="Edit Note">
        <template #body>
          <form id="edit-note-form" @submit.prevent="handleEditNote" class="space-y-4">
            <div>
              <label for="edit-note-text" class="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <UTextarea
                id="edit-note-text"
                v-model="editNote.note"
                placeholder="Enter your note..."
                :rows="4"
                required
                :disabled="editingNote"
              />
            </div>
            <UAlert v-if="noteError" color="error" variant="soft" :title="noteError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="() => {
                showEditNoteModal = false
                editingNoteId = null
                editNote = { note: '' }
                noteError = ''
              }"
              :disabled="editingNote"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              form="edit-note-form"
              color="primary"
              :loading="editingNote"
            >
              Save Changes
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import type { Track } from '~/composables/useTracks'
import type { Note, NoteInsert } from '~/composables/useNotes'
import type { AudioFile } from '~/composables/useAudio'

const route = useRoute()
const router = useRouter()
const { getTrack, updateTrack, deleteTrack } = useTracks()
const { getNotes, createNote, updateNote, deleteNote } = useNotes()
const { getAudioFiles } = useAudio()

const track = ref<Track | null>(null)
const audioFiles = ref<AudioFile[]>([])
const notes = ref<Note[]>([])
const loading = ref(true)
const error = ref('')
const showUploadModal = ref(false)
const showNoteModal = ref(false)
const showEditNoteModal = ref(false)
const addingNote = ref(false)
const editingNote = ref(false)
const noteError = ref('')
const editingNoteId = ref<string | null>(null)

const newNote = ref<NoteInsert>({
  note: '',
  track_id: '',
})

const editNote = ref<NoteUpdate>({
  note: '',
})

const menuItems = computed(() => [
  {
    label: 'Edit Track',
    icon: 'i-heroicons-pencil',
    click: async () => {
      if (track.value) {
        await router.push(`/tracks/${track.value.id}/edit`)
      }
    },
  },
  {
    label: 'Delete Track',
    icon: 'i-heroicons-trash',
    click: handleDeleteTrack,
  },
])

// Load track data
onMounted(async () => {
  await loadTrack()
  if (track.value) {
    await loadAudioFiles()
    await loadNotes()
  }
})

const loadTrack = async () => {
  loading.value = true
  try {
    const trackId = route.params.id as string
    track.value = await getTrack(trackId)
    if (!track.value) {
      error.value = 'Track not found'
    } else {
      newNote.value.track_id = track.value.id
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load track'
  } finally {
    loading.value = false
  }
}

const loadAudioFiles = async () => {
  if (!track.value) return
  try {
    audioFiles.value = await getAudioFiles(track.value.id)
  } catch (err: any) {
    console.error('Failed to load audio files:', err)
    audioFiles.value = []
  }
}

const loadNotes = async () => {
  if (!track.value) return
  try {
    notes.value = await getNotes(track.value.id)
  } catch (err: any) {
    console.error('Failed to load notes:', err)
    notes.value = []
  }
}

const toggleLiveReady = async () => {
  if (!track.value) return

  try {
    await updateTrack(track.value.id, {
      live_ready: !track.value.live_ready,
    })
    track.value.live_ready = !track.value.live_ready
  } catch (err: any) {
    console.error('Failed to update track:', err)
  }
}

const handleAddNote = async () => {
  if (!track.value) return

  noteError.value = ''
  addingNote.value = true

  try {
    await createNote(newNote.value)
    showNoteModal.value = false
    newNote.value.note = ''
    await loadNotes()
  } catch (err: any) {
    noteError.value = err.message || 'Failed to add note'
  } finally {
    addingNote.value = false
  }
}

const toggleNoteDone = async (note: Note) => {
  try {
    await updateNote(note.id, { done: !note.done })
    await loadNotes()
  } catch (err: any) {
    console.error('Failed to update note:', err)
  }
}

const playAudio = (audio: AudioFile) => {
  if (audio.file_url) {
    window.open(audio.file_url, '_blank')
  }
}

const handleDeleteTrack = async () => {
  if (!track.value) return
  if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
    return
  }

  try {
    await deleteTrack(track.value.id)
    router.push('/tracks')
  } catch (err: any) {
    console.error('Failed to delete track:', err)
  }
}

const getAudioMenuItems = (audio: AudioFile) => {
  return [
    {
      label: 'Download',
      icon: 'i-heroicons-arrow-down-tray',
      click: () => {
        if (audio.file_url) {
          window.open(audio.file_url, '_blank')
        }
      },
    },
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => {
        // TODO: Implement audio deletion
      },
    },
  ]
}

const getNoteMenuItems = (note: Note) => {
  return [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => {
        editingNoteId.value = note.id
        editNote.value = { note: note.note }
        showEditNoteModal.value = true
      },
    },
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: async () => {
        if (confirm('Are you sure you want to delete this note?')) {
          try {
            await deleteNote(note.id)
            await loadNotes()
          } catch (err: any) {
            console.error('Failed to delete note:', err)
          }
        }
      },
    },
  ]
}

const handleEditNote = async () => {
  if (!editingNoteId.value) return

  noteError.value = ''
  editingNote.value = true

  try {
    await updateNote(editingNoteId.value, editNote.value)
    showEditNoteModal.value = false
    editingNoteId.value = null
    editNote.value = { note: '' }
    await loadNotes()
  } catch (err: any) {
    noteError.value = err.message || 'Failed to update note'
  } finally {
    editingNote.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

useSeoMeta({
  title: () => (track.value ? `${track.value.name} - MusicAid` : 'Track - MusicAid'),
  description: () => (track.value ? `Track details for ${track.value.name}` : 'Track details'),
})
</script>

