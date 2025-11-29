<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-default mb-4">Workflow Status</h3>
      <div class="flex items-center gap-2 mb-4">
        <UBadge
          v-for="status in displayedStatuses"
          :key="status.id"
          :color="getStatusColor(status)"
          :variant="currentStatusId === status.id ? 'solid' : 'soft'"
          :class="{ 'cursor-pointer': isClickableStatus(status) }"
          @click="handleStatusClick(status)"
        >
          <div class="flex items-center gap-1.5">
            <span>{{ status.name }}</span>
            <UIcon
              v-if="isStatusComplete(status)"
              name="i-ph-check-circle"
              class="w-4 h-4"
            />
          </div>
        </UBadge>
      </div>
    </div>

    <!-- Status Steps -->
    <div v-if="currentStatus && currentStatus.steps && currentStatus.steps.length > 0">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-default">{{ isExpanded ? 'Steps' : 'Next step' }}</h4>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :icon="isExpanded ? 'i-ph-caret-up' : 'i-ph-caret-down'"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Show Next Only' : 'Show All' }}
        </UButton>
      </div>
      <div class="space-y-2">
        <div
          v-for="step in displayedSteps"
          :key="step.id"
          class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
          :class="{
            'bg-blue-50 border-blue-300 dark:bg-blue-500/10 dark:border-blue-500':
              currentStepId === step.id
          }"
        >
          <UIcon
            :name="step.done ? 'i-ph-check-circle' : 'i-ph-circle-dashed'"
            :class="step.done ? 'text-success' : 'text-dimmed'"
            class="w-5 h-5"
          />
          <div class="flex-1">
            <p class="font-medium text-default">{{ step.name }}</p>
            <p v-if="step.description" class="text-sm text-muted">{{ step.description }}</p>
          </div>
          <UButton
            v-if="!step.done"
            color="primary"
            size="sm"
            variant="ghost"
            @click="completeStep(step)"
          >
            Complete
          </UButton>
          <UButton
            v-else
            color="neutral"
            size="sm"
            variant="ghost"
            icon="i-ph-x"
            @click="uncompleteStep(step)"
          >
            Undo
          </UButton>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="hasSteps" class="space-y-2">
      <div class="flex justify-between text-sm text-muted">
        <span>Overall Progress</span>
        <span>{{ Math.round(progressValue) }}%</span>
      </div>
      <UProgress v-model="progressValue" :max="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  id: string
  name: string
  description?: string | null
  done?: boolean
}

interface TrackStatus {
  id: string
  name: string
  key: string
  non_linear?: boolean
  steps?: Step[]
}

interface Props {
  statuses: TrackStatus[]
  currentStatusId?: string | null
  currentStepId?: string | null
  trackId?: string
  completedStepIds?: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'status-selected': [statusId: string]
  'step-completed': [stepId: string]
  'step-uncompleted': [stepId: string]
}>()

const currentStatus = computed(() => {
  if (!props.currentStatusId) return null
  return props.statuses.find(s => s.id === props.currentStatusId) || null
})

// Determine which statuses to display
const displayedStatuses = computed<TrackStatus[]>(() => {
  // When in "next step" state (not expanded), show completed statuses + current status
  if (!isExpanded.value && currentStatus.value) {
    const currentStatusIndex = props.statuses.findIndex(s => s.id === currentStatus.value!.id)
    if (currentStatusIndex === -1) {
      return [currentStatus.value]
    }
    
    // Get all statuses up to and including the current one
    const statusesToShow: TrackStatus[] = []
    for (let i = 0; i <= currentStatusIndex; i++) {
      const status = props.statuses[i]
      if (status) {
        // Only include completed statuses before the current one, or the current one itself
        if (i < currentStatusIndex) {
          if (isStatusComplete(status)) {
            statusesToShow.push(status)
          }
        } else {
          // Always include the current status
          statusesToShow.push(status)
        }
      }
    }
    return statusesToShow
  }
  // When expanded, show all statuses
  return props.statuses
})

const hasSteps = computed(() => {
  if (!props.statuses || props.statuses.length === 0) {
    return false
  }
  return props.statuses.some(status => status.steps && status.steps.length > 0)
})

const progressPercentage = computed(() => {
  // Calculate progress based on completed steps
  if (!props.statuses || props.statuses.length === 0) {
    return 0
  }

  // Count total steps across all statuses
  let totalSteps = 0
  let completedSteps = 0
  const completedSet = new Set(props.completedStepIds || [])

  for (const status of props.statuses) {
    if (status.steps && status.steps.length > 0) {
      totalSteps += status.steps.length
      // Count completed steps in this status
      for (const step of status.steps) {
        if (completedSet.has(step.id)) {
          completedSteps++
        }
      }
    }
  }

  if (totalSteps === 0) {
    return 0
  }

  const percentage = (completedSteps / totalSteps) * 100
  // Ensure we return a valid number between 0 and 100
  return Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage))
})

const progressValue = ref(0)
const isExpanded = ref(false)

watch(progressPercentage, (newValue) => {
  const value = typeof newValue === 'number' && !isNaN(newValue) ? newValue : 0
  progressValue.value = Math.max(0, Math.min(100, value))
}, { immediate: true })

// Find the next incomplete step
const nextIncompleteStep = computed(() => {
  if (!currentStatus.value || !currentStatus.value.steps) return null
  
  const completedSet = new Set(props.completedStepIds || [])
  return currentStatus.value.steps.find(step => !completedSet.has(step.id)) || null
})

// Determine which steps to display
const displayedSteps = computed<Step[]>(() => {
  if (!currentStatus.value || !currentStatus.value.steps) return []
  
  if (isExpanded.value) {
    // Show all steps
    return currentStatus.value.steps
  } else {
    // Show only the next incomplete step
    if (nextIncompleteStep.value) {
      return [nextIncompleteStep.value]
    }
    // If all steps are complete, show the last step
    if (currentStatus.value.steps.length > 0) {
      const lastStep = currentStatus.value.steps[currentStatus.value.steps.length - 1]
      return lastStep ? [lastStep] : []
    }
    return []
  }
})

const getStatusColor = (status: TrackStatus): 'primary' | 'neutral' => {
  if (status.id === props.currentStatusId) return 'primary'
  return 'neutral'
}

// Check if all steps in a status are completed
const isStatusComplete = (status: TrackStatus): boolean => {
  if (!status.steps || status.steps.length === 0) {
    return false
  }
  
  const completedSet = new Set(props.completedStepIds || [])
  return status.steps.every(step => completedSet.has(step.id))
}

const selectStatus = (status: TrackStatus) => {
  emit('status-selected', status.id)
}

// Check if a status is clickable
const isClickableStatus = (status: TrackStatus): boolean => {
  // Only clickable when expanded, and not if it's a completed status in next step view
  if (!isExpanded.value) {
    // In next step view, only the current status should be clickable (but it's not clickable in next step view)
    return false
  }
  // When expanded, all statuses are clickable
  return true
}

const handleStatusClick = (status: TrackStatus) => {
  // Only allow status selection when expanded and status is clickable
  if (isClickableStatus(status)) {
    selectStatus(status)
  }
}

const completeStep = (step: Step) => {
  emit('step-completed', step.id)
}

const uncompleteStep = (step: Step) => {
  emit('step-uncompleted', step.id)
}
</script>

