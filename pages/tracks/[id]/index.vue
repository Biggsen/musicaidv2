<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-ph-arrow-clockwise" class="w-8 h-8 text-dimmed animate-spin" />
    </div>

    <!-- Error State -->
    <UCard v-else-if="error" class="text-center py-12">
      <UIcon name="i-ph-warning" class="w-16 h-16 text-error mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-default mb-2">Track Not Found</h3>
      <p class="text-muted mb-6">{{ error }}</p>
      <UButton color="primary" to="/tracks">Back to Tracks</UButton>
    </UCard>

    <!-- Track Detail -->
    <div v-else-if="track">
      <!-- Header -->
      <div class="mb-8">
        <div class="mb-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ph-arrow-left"
            to="/tracks"
          >
            Back
          </UButton>
        </div>
        <UPageHeader
          :headline="artist?.name"
          :title="track.name"
          :description="track.description || undefined"
          :ui="{ description: 'max-w-[60ch]' }"
        >
          <template #links>
            <div class="flex items-center gap-3">
              <UDropdownMenu :items="getTemplateMenuItems()" :content="{ align: 'end' }">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-ph-list"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UPageHeader>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Track Info Card -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold text-default">Track Information</h2>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="track.tempo">
                  <label class="flex items-center gap-2 text-sm font-medium text-default mb-1">
                    <UIcon name="i-ph-metronome" class="w-4 h-4" />
                    Tempo
                  </label>
                  <p class="text-default">{{ track.tempo }} BPM</p>
                </div>
                <div v-if="track.minutes !== null && track.seconds !== null">
                  <label class="flex items-center gap-2 text-sm font-medium text-default mb-1">
                    <UIcon name="i-ph-timer" class="w-4 h-4" />
                    Duration
                  </label>
                  <p class="text-default">
                    {{ track.minutes }}:{{ String(track.seconds).padStart(2, '0') }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-default mb-1">Samples</label>
                  <p class="text-default">{{ track.samples }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Audio Files Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-default">Audio Files</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-ph-plus"
                  @click="showUploadModal = true"
                >
                  Upload
                </UButton>
              </div>
            </template>

            <div v-if="audioFiles.length === 0" class="text-center py-8">
              <UIcon name="i-ph-music-note" class="w-12 h-12 text-dimmed mx-auto mb-3" />
              <p class="text-muted mb-4">No audio files yet</p>
              <UButton color="primary" size="sm" icon="i-ph-plus" @click="showUploadModal = true">
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
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-medium text-default">{{ audio.name }}</h4>
                      <UBadge v-if="audio.version" color="primary" variant="soft" size="xs">
                        {{ audio.version }}
                      </UBadge>
                    </div>
                    <p class="text-sm text-muted mb-1">{{ audio.description || 'No description' }}</p>
                    <div class="flex items-center gap-3 text-xs text-muted">
                      <span v-if="audio.format">{{ audio.format }}</span>
                      <span v-if="audio.duration_seconds" class="font-medium text-default">
                        {{ formatDuration(audio.duration_seconds) }}
                      </span>
                      <span v-if="audio.file_size_bytes">{{ formatFileSize(audio.file_size_bytes) }}</span>
                      <span v-if="audio.mixdown_date" class="flex items-center gap-1">
                        <UIcon name="i-ph-calendar" class="w-3 h-3" />
                        {{ formatDateOnly(audio.mixdown_date) }}
                      </span>
                      <span v-if="audio.bitrate">{{ audio.bitrate }} kbps</span>
                      <span v-if="audio.sample_rate">{{ audio.sample_rate }} Hz</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      v-if="audio.file_url"
                      color="primary"
                      variant="ghost"
                      :icon="currentlyPlayingId === audio.id ? 'i-ph-pause' : 'i-ph-play'"
                      size="sm"
                      @click="toggleAudio(audio)"
                    >
                      {{ currentlyPlayingId === audio.id ? 'Pause' : 'Play' }}
                    </UButton>
                    <UPopover :content="{ side: 'bottom', align: 'end' }">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-ph-dots-three-vertical"
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
                <!-- Inline Audio Player -->
                <div v-if="audio.file_url && currentlyPlayingId === audio.id" class="mt-4 pt-4 border-t border-gray-200">
                  <audio
                    :ref="(el) => { if (el) audioPlayers.set(audio.id, el as HTMLAudioElement) }"
                    :src="audio.file_url"
                    controls
                    class="w-full"
                    @ended="handleAudioEnded"
                    @pause="handleAudioPause(audio.id)"
                  />
                </div>
              </div>
            </div>
          </UCard>

          <!-- Workflow Status Section -->
          <UCard v-if="workflowStatuses.length > 0 && track">
            <WorkflowStatus
              :statuses="workflowStatuses"
              :current-status-id="track?.track_status_id"
              :current-step-id="track?.step_id"
              :track-id="track?.id"
              :completed-step-ids="Array.from(completedStepIds)"
              @status-selected="handleStatusSelected"
              @step-completed="handleStepCompleted"
              @step-uncompleted="handleStepUncompleted"
            />
          </UCard>

          <!-- Notes Section -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-default">Notes</h2>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-ph-plus"
                  @click="showNoteModal = true"
                >
                  Add Note
                </UButton>
              </div>
            </template>

            <div v-if="notes.length === 0" class="text-center py-8">
              <UIcon name="i-ph-document-text" class="w-12 h-12 text-dimmed mx-auto mb-3" />
              <p class="text-muted">No notes yet</p>
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
                    <p class="text-default whitespace-pre-wrap">{{ note.note }}</p>
                    <p class="text-xs text-muted mt-2">
                      {{ formatDate(note.created_at) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
              <UButton
                :color="note.done ? 'success' : 'neutral'"
                variant="ghost"
                :icon="note.done ? 'i-ph-check-circle' : 'i-ph-circle-dashed'"
                size="sm"
                @click="toggleNoteDone(note)"
              />
                    <UPopover :content="{ side: 'bottom', align: 'end' }">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-ph-dots-three-vertical"
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
              <h3 class="text-lg font-semibold text-default">Quick Actions</h3>
            </template>
            <div class="space-y-2">
              <UButton
                color="primary"
                variant="outline"
                block
                icon="i-ph-pencil"
                @click="router.push(`/tracks/${track.id}/edit`)"
              >
                Edit Track
              </UButton>
            </div>
          </UCard>

          <!-- Track Metadata -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-default">Metadata</h3>
            </template>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-muted">Created</p>
                <p class="text-default font-medium">{{ formatDate(track.created_at) }}</p>
              </div>
              <div>
                <p class="text-muted">Last Updated</p>
                <p class="text-default font-medium">{{ formatDate(track.updated_at) }}</p>
              </div>
              <div v-if="track.isrc_code">
                <p class="text-muted">ISRC Code</p>
                <p class="text-default font-medium">{{ track.isrc_code }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Upload Audio Modal -->
      <UModal v-model:open="showUploadModal" title="Upload Audio File">
        <template #body>
          <div class="space-y-4">
            <div>
              <label for="audio-name" class="block text-sm font-medium text-default mb-1">
                Name (optional)
              </label>
              <UInput
                id="audio-name"
                v-model="newAudioName"
                placeholder="Audio file name"
                :disabled="uploadingAudio"
              />
            </div>
            <div>
              <label for="audio-description" class="block text-sm font-medium text-default mb-1">
                Description (optional)
              </label>
              <UTextarea
                id="audio-description"
                v-model="newAudioDescription"
                placeholder="File description"
                :rows="5"
                class="w-full"
                :disabled="uploadingAudio"
              />
            </div>
            <div>
              <label for="audio-version" class="block text-sm font-medium text-default mb-1">
                Version (optional)
              </label>
              <UInput
                id="audio-version"
                v-model="newAudioVersion"
                placeholder="e.g., v1, v2, final, master"
                :disabled="uploadingAudio"
              />
              <p class="mt-1 text-xs text-muted">
                Track different versions of the same audio file
              </p>
            </div>
            <div>
              <label for="audio-mixdown-date" class="block text-sm font-medium text-default mb-1">
                Mixdown Date (optional)
              </label>
              <UInput
                id="audio-mixdown-date"
                v-model="newAudioMixdownDate"
                type="date"
                :disabled="uploadingAudio"
              />
            </div>
            <AudioUpload
              ref="audioUploadRef"
              :track-id="track?.id"
              :max-size-m-b="100"
              @uploaded="handleAudioUploaded"
              @error="handleAudioUploadError"
            />
            <UAlert v-if="audioUploadError" color="error" variant="soft" :title="audioUploadError" />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeUploadModal"
              :disabled="uploadingAudio"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="uploadingAudio"
              :disabled="!audioUploadRef?.selectedFile"
              @click="handleUploadAudio"
            >
              Upload
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Add Note Modal -->
      <UModal v-model:open="showNoteModal" title="Add Note">
        <template #body>
          <form id="add-note-form" @submit.prevent="handleAddNote" class="space-y-4">
            <div>
              <label for="note-text" class="block text-sm font-medium text-default mb-1">
                Note
              </label>
              <UTextarea
                id="note-text"
                v-model="newNote.note"
                placeholder="Enter your note..."
                :rows="5"
                class="w-full"
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
              <label for="edit-note-text" class="block text-sm font-medium text-default mb-1">
                Note
              </label>
              <UTextarea
                id="edit-note-text"
                v-model="editNote.note"
                placeholder="Enter your note..."
                :rows="5"
                class="w-full"
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

      <!-- Edit Audio Modal -->
      <UModal v-model:open="showEditAudioModal" title="Edit Audio File">
        <template #body>
          <form id="edit-audio-form" @submit.prevent="handleEditAudio" class="space-y-4">
            <div>
              <label for="edit-audio-name" class="block text-sm font-medium text-default mb-1">
                Name
              </label>
              <UInput
                id="edit-audio-name"
                v-model="editAudio.name"
                placeholder="Audio file name"
                required
                :disabled="editingAudio"
              />
            </div>
            <div>
              <label for="edit-audio-description" class="block text-sm font-medium text-default mb-1">
                Description
              </label>
              <UTextarea
                id="edit-audio-description"
                v-model="editAudio.description"
                placeholder="File description"
                :rows="5"
                class="w-full"
                :disabled="editingAudio"
              />
            </div>
            <div>
              <label for="edit-audio-version" class="block text-sm font-medium text-default mb-1">
                Version
              </label>
              <UInput
                id="edit-audio-version"
                v-model="editAudio.version"
                placeholder="e.g., v1, v2, final, master"
                :disabled="editingAudio"
              />
              <p class="mt-1 text-xs text-muted">
                Track different versions of the same audio file
              </p>
            </div>
            <div>
              <label for="edit-audio-mixdown-date" class="block text-sm font-medium text-default mb-1">
                Mixdown Date
              </label>
              <UInput
                id="edit-audio-mixdown-date"
                v-model="editAudio.mixdown_date"
                type="date"
                :disabled="editingAudio"
              />
            </div>
            <UAlert v-if="audioEditError" color="error" variant="soft" :title="audioEditError" />
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeEditAudioModal"
              :disabled="editingAudio"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              form="edit-audio-form"
              color="primary"
              :loading="editingAudio"
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
import type { Artist } from '~/composables/useArtists'
import type { Note, NoteInsert, NoteUpdate } from '~/composables/useNotes'
import type { AudioFile } from '~/composables/useAudio'
import type { TrackStatusWithSteps, TemplateWithStatuses } from '~/composables/useWorkflow'

const route = useRoute()
const router = useRouter()
const { getTrack, updateTrack, deleteTrack } = useTracks()
const { getArtist } = useArtists()
const { getNotes, createNote, updateNote, deleteNote } = useNotes()
const { getAudioFiles, createAudioFile, updateAudioFile, deleteAudioFile } = useAudio()
const {
  getTemplateWithStatuses,
  getTrackStatusWithSteps,
  getCompletedSteps,
  completeStep,
  uncompleteStep,
} = useWorkflow()

const track = ref<Track | null>(null)
const artist = ref<Artist | null>(null)
const audioFiles = ref<AudioFile[]>([])
const notes = ref<Note[]>([])
const workflowStatuses = ref<TrackStatusWithSteps[]>([])
const completedStepIds = ref<Set<string>>(new Set())
const loading = ref(true)
const error = ref('')
const showUploadModal = ref(false)
const showNoteModal = ref(false)
const showEditNoteModal = ref(false)
const showEditAudioModal = ref(false)
const addingNote = ref(false)
const editingNote = ref(false)
const editingAudio = ref(false)
const noteError = ref('')
const audioEditError = ref('')
const editingNoteId = ref<string | null>(null)
const editingAudioId = ref<string | null>(null)
const uploadingAudio = ref(false)
const audioUploadError = ref('')
const audioUploadRef = ref<any>(null)
const newAudioName = ref('')
const newAudioDescription = ref('')
const newAudioVersion = ref('')
const newAudioMixdownDate = ref('')
const currentlyPlayingId = ref<string | null>(null)
const audioPlayers = ref<Map<string, HTMLAudioElement>>(new Map())
const editAudio = ref<{
  name: string
  description: string
  version: string
  mixdown_date: string
}>({
  name: '',
  description: '',
  version: '',
  mixdown_date: '',
})

const newNote = ref<NoteInsert>({
  note: '',
  track_id: '',
})

const editNote = ref<NoteUpdate>({
  note: '',
})

// Load track data
onMounted(async () => {
  await loadTrack()
  if (track.value) {
    await loadAudioFiles()
    await loadNotes()
    await loadWorkflow()
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
      // Load artist information
      if (track.value.artist_id) {
        try {
          artist.value = await getArtist(track.value.artist_id)
        } catch (err: any) {
          console.error('Failed to load artist:', err)
        }
      }
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

const loadWorkflow = async () => {
  if (!track.value) return

  try {
    // Load completed steps for this track (gracefully handles missing table)
    try {
      const completedSteps = await getCompletedSteps(track.value.id)
      completedStepIds.value = new Set(completedSteps)
    } catch (err: any) {
      // If table doesn't exist, just use empty set
      console.warn('Could not load completed steps:', err)
      completedStepIds.value = new Set()
    }

    // If track has a template, load it with statuses
    if (track.value.template_id) {
      const template = await getTemplateWithStatuses(track.value.template_id)
      if (template && template.statuses) {
        // Load steps for each status
        const statusesWithSteps: TrackStatusWithSteps[] = []
        for (const status of template.statuses) {
          try {
            const statusWithSteps = await getTrackStatusWithSteps(status.id)
            if (statusWithSteps) {
              // Mark steps as done if they're in completed steps
              if (statusWithSteps.steps) {
                statusWithSteps.steps = statusWithSteps.steps.map(step => ({
                  ...step,
                  done: completedStepIds.value.has(step.id),
                }))
              }
              statusesWithSteps.push(statusWithSteps)
            }
          } catch (err: any) {
            console.error(`Failed to load steps for status ${status.id}:`, err)
            // Continue with other statuses even if one fails
          }
        }
        workflowStatuses.value = statusesWithSteps
      }
    } else if (track.value.track_status_id) {
      // If no template but has a status, load just that status
      try {
        const status = await getTrackStatusWithSteps(track.value.track_status_id)
        if (status) {
          // Mark steps as done if they're in completed steps
          if (status.steps) {
            status.steps = status.steps.map(step => ({
              ...step,
              done: completedStepIds.value.has(step.id),
            }))
          }
          workflowStatuses.value = [status]
        }
      } catch (err: any) {
        console.error('Failed to load status with steps:', err)
      }
    }
  } catch (err: any) {
    console.error('Failed to load workflow:', err)
    workflowStatuses.value = []
  }
}

const handleStatusSelected = async (statusId: string) => {
  if (!track.value) return

  try {
    await updateTrack(track.value.id, {
      track_status_id: statusId,
      step_id: null, // Reset step when changing status
    })
    track.value.track_status_id = statusId
    track.value.step_id = null
    await loadWorkflow()
  } catch (err: any) {
    console.error('Failed to update track status:', err)
  }
}

const handleStepCompleted = async (stepId: string) => {
  if (!track.value) return

  try {
    // Find the current status and the step being completed
    const currentStatus = workflowStatuses.value.find(
      status => status.id === track.value?.track_status_id
    )
    
    if (!currentStatus || !currentStatus.steps) {
      // Fallback to original behavior if status not found
      await completeStep(track.value.id, stepId)
      await updateTrack(track.value.id, { step_id: stepId })
      track.value.step_id = stepId
      await loadWorkflow()
      return
    }

    // Find the step index in the steps array (steps are already sorted by order_index)
    const stepIndex = currentStatus.steps.findIndex(step => step.id === stepId)
    
    if (stepIndex === -1) {
      // Step not found, fallback to original behavior
      await completeStep(track.value.id, stepId)
      await updateTrack(track.value.id, { step_id: stepId })
      track.value.step_id = stepId
      await loadWorkflow()
      return
    }

    // Check if status is linear (non_linear is false or undefined by default)
    const isLinear = currentStatus.non_linear !== true

    // Steps to complete: the clicked step + all previous steps if linear
    const stepsToComplete: string[] = []
    
    if (isLinear) {
      // Find the current status index in the workflowStatuses array
      const currentStatusIndex = workflowStatuses.value.findIndex(
        status => status.id === currentStatus.id
      )
      
      // If there's a previous status, complete its last step
      if (currentStatusIndex > 0) {
        const previousStatus = workflowStatuses.value[currentStatusIndex - 1]
        if (previousStatus && previousStatus.steps && previousStatus.steps.length > 0) {
          const lastStepOfPreviousStatus = previousStatus.steps[previousStatus.steps.length - 1]
          if (lastStepOfPreviousStatus && !completedStepIds.value.has(lastStepOfPreviousStatus.id)) {
            stepsToComplete.push(lastStepOfPreviousStatus.id)
          }
        }
      }
      
      // Complete all previous steps in current status (from index 0 to stepIndex)
      for (let i = 0; i <= stepIndex; i++) {
        const step = currentStatus.steps[i]
        if (step && !completedStepIds.value.has(step.id)) {
          stepsToComplete.push(step.id)
        }
      }
    } else {
      // Non-linear: only complete the clicked step
      stepsToComplete.push(stepId)
    }

    // Complete all steps in parallel
    await Promise.all(
      stepsToComplete.map(stepIdToComplete => completeStep(track.value!.id, stepIdToComplete))
    )

    // Check if this was the last step in the current status
    const isLastStep = stepIndex === currentStatus.steps.length - 1
    const currentStatusIndex = workflowStatuses.value.findIndex(
      status => status.id === currentStatus.id
    )
    
    // If this was the last step and there's a next status, advance to it
    if (isLastStep && currentStatusIndex >= 0 && currentStatusIndex < workflowStatuses.value.length - 1) {
      const nextStatus = workflowStatuses.value[currentStatusIndex + 1]
      if (nextStatus && nextStatus.steps && nextStatus.steps.length > 0) {
        // Move to the first step of the next status
        const firstStepOfNextStatus = nextStatus.steps[0]
        if (firstStepOfNextStatus) {
          await updateTrack(track.value.id, {
            track_status_id: nextStatus.id,
            step_id: firstStepOfNextStatus.id,
          })
          track.value.track_status_id = nextStatus.id
          track.value.step_id = firstStepOfNextStatus.id
          await loadWorkflow()
          return
        }
      }
    }

    // Update track's current step_id to the clicked step
    await updateTrack(track.value.id, {
      step_id: stepId,
    })
    track.value.step_id = stepId
    await loadWorkflow()
  } catch (err: any) {
    console.error('Failed to complete step:', err)
  }
}

const handleStepUncompleted = async (stepId: string) => {
  if (!track.value) return

  try {
    // Mark step as incomplete (remove from track_steps table)
    await uncompleteStep(track.value.id, stepId)
    await loadWorkflow()
  } catch (err: any) {
    console.error('Failed to uncomplete step:', err)
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

const toggleAudio = (audio: AudioFile) => {
  if (!audio.file_url) return
  
  if (currentlyPlayingId.value === audio.id) {
    // Pause and hide player
    const player = audioPlayers.value.get(audio.id)
    if (player) {
      player.pause()
    }
    currentlyPlayingId.value = null
  } else {
    // Stop any currently playing audio
    if (currentlyPlayingId.value) {
      const currentPlayer = audioPlayers.value.get(currentlyPlayingId.value)
      if (currentPlayer) {
        currentPlayer.pause()
      }
    }
    // Show player for this audio
    currentlyPlayingId.value = audio.id
    // Wait for next tick to ensure audio element is rendered
    nextTick(() => {
      const player = audioPlayers.value.get(audio.id)
      if (player) {
        player.play().catch((err) => {
          console.error('Failed to play audio:', err)
        })
      }
    })
  }
}

const handleAudioEnded = () => {
  currentlyPlayingId.value = null
}

const handleAudioPause = (audioId: string) => {
  if (currentlyPlayingId.value === audioId) {
    currentlyPlayingId.value = null
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

const getTemplateMenuItems = () => {
  if (!track.value) return []
  return [
    [
      {
        label: 'Edit Track',
        icon: 'i-ph-pencil',
        click: async () => {
          if (track.value) {
            await router.push(`/tracks/${track.value.id}/edit`)
          }
        },
      },
    ],
    [
      {
        label: 'Delete Track',
        icon: 'i-ph-trash',
        color: 'error' as const,
        click: handleDeleteTrack,
      },
    ],
  ]
}

const getAudioMenuItems = (audio: AudioFile) => {
  return [
    {
      label: 'Edit',
      icon: 'i-ph-pencil',
      click: () => {
        editingAudioId.value = audio.id
        editAudio.value = {
          name: audio.name,
          description: audio.description || '',
          version: audio.version || '',
          mixdown_date: audio.mixdown_date ? (new Date(audio.mixdown_date).toISOString().split('T')[0] || '') : '',
        }
        showEditAudioModal.value = true
      },
    },
    {
      label: 'Download',
      icon: 'i-ph-download',
      click: () => {
        if (audio.file_url) {
          window.open(audio.file_url, '_blank')
        }
      },
    },
    {
      label: 'Delete',
      icon: 'i-ph-trash',
      click: async () => {
        if (confirm('Are you sure you want to delete this audio file? This will remove it from R2 storage and cannot be undone.')) {
          try {
            await deleteAudioFile(audio.id)
            await loadAudioFiles()
          } catch (err: any) {
            console.error('Failed to delete audio file:', err)
            alert(err.message || 'Failed to delete audio file')
          }
        }
      },
    },
  ]
}

const getNoteMenuItems = (note: Note) => {
  return [
    {
      label: 'Edit',
      icon: 'i-ph-pencil',
      click: () => {
        editingNoteId.value = note.id
        editNote.value = { note: note.note }
        showEditNoteModal.value = true
      },
    },
    {
      label: 'Delete',
      icon: 'i-ph-trash',
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

const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleUploadAudio = async () => {
  if (!audioUploadRef.value || !track.value) return

  uploadingAudio.value = true
  audioUploadError.value = ''

  try {
    await audioUploadRef.value.upload(
      newAudioName.value || undefined,
      newAudioDescription.value || undefined,
      newAudioVersion.value || undefined
    )
  } catch (err: any) {
    audioUploadError.value = err.message || 'Upload failed'
  } finally {
    uploadingAudio.value = false
  }
}

const handleAudioUploaded = async (result: {
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
}) => {
  if (!track.value) return

  const user = useSupabaseUser()

  try {
    // Save to database
    await createAudioFile({
      name: newAudioName.value || result.fileName,
      slug: result.slug,
      file_url: result.fileUrl,
      track_id: track.value.id,
      description: newAudioDescription.value || null,
      version: result.version || newAudioVersion.value || null,
      duration_seconds: result.duration_seconds || null,
      format: result.format || null,
      bitrate: result.bitrate || null,
      sample_rate: result.sample_rate || null,
      file_size_bytes: result.file_size_bytes || null,
      mixdown_date: newAudioMixdownDate.value ? new Date(newAudioMixdownDate.value).toISOString() : null,
      created_by: user.value?.id || null,
    })

    // Reload audio files
    await loadAudioFiles()

    // Close modal and reset
    closeUploadModal()
  } catch (err: any) {
    audioUploadError.value = err.message || 'Failed to save audio file to database'
    console.error('Failed to save audio file:', err)
  }
}

const handleAudioUploadError = (errorMessage: string) => {
  audioUploadError.value = errorMessage
}

const closeUploadModal = () => {
  showUploadModal.value = false
  newAudioName.value = ''
  newAudioDescription.value = ''
  newAudioVersion.value = ''
  newAudioMixdownDate.value = ''
  audioUploadError.value = ''
  audioUploadRef.value?.clearFile()
}

const closeEditAudioModal = () => {
  showEditAudioModal.value = false
  editingAudioId.value = null
  editAudio.value = { name: '', description: '', version: '', mixdown_date: '' }
  audioEditError.value = ''
}

const handleEditAudio = async () => {
  if (!editingAudioId.value) return

  editingAudio.value = true
  audioEditError.value = ''

  try {
    await updateAudioFile(editingAudioId.value, {
      name: editAudio.value.name,
      description: editAudio.value.description || null,
      version: editAudio.value.version || null,
      mixdown_date: editAudio.value.mixdown_date ? new Date(editAudio.value.mixdown_date).toISOString() : null,
    })

    await loadAudioFiles()

    closeEditAudioModal()
  } catch (err: any) {
    audioEditError.value = err.message || 'Failed to update audio file'
    console.error('Failed to update audio file:', err)
  } finally {
    editingAudio.value = false
  }
}

useSeoMeta({
  title: () => (track.value ? `${track.value.name} - MusicAid` : 'Track - MusicAid'),
  description: () => (track.value ? `Track details for ${track.value.name}` : 'Track details'),
})
</script>

