<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>
      <div class="flex items-center gap-2 mb-4">
        <UBadge
          v-for="status in statuses"
          :key="status.id"
          :color="getStatusColor(status)"
          :variant="currentStatusId === status.id ? 'solid' : 'soft'"
          class="cursor-pointer"
          @click="selectStatus(status)"
        >
          {{ status.name }}
        </UBadge>
      </div>
    </div>

    <!-- Status Steps -->
    <div v-if="currentStatus && currentStatus.steps && currentStatus.steps.length > 0">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Steps</h4>
      <div class="space-y-2">
        <div
          v-for="step in currentStatus.steps"
          :key="step.id"
          class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
          :class="{ 'bg-blue-50 border-blue-300': currentStepId === step.id }"
        >
          <UIcon
            :name="step.done ? 'i-heroicons-check-circle' : 'i-heroicons-circle-stack'"
            :class="step.done ? 'text-green-600' : 'text-gray-400'"
            class="w-5 h-5"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ step.name }}</p>
            <p v-if="step.description" class="text-sm text-gray-600">{{ step.description }}</p>
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
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="progressPercentage > 0" class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>Overall Progress</span>
        <span>{{ Math.round(progressPercentage) }}%</span>
      </div>
      <UProgress :value="progressPercentage" />
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
  steps?: Step[]
}

interface Props {
  statuses: TrackStatus[]
  currentStatusId?: string | null
  currentStepId?: string | null
  trackId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'status-selected': [statusId: string]
  'step-completed': [stepId: string]
}>()

const currentStatus = computed(() => {
  if (!props.currentStatusId) return null
  return props.statuses.find(s => s.id === props.currentStatusId) || null
})

const progressPercentage = computed(() => {
  if (!currentStatus.value || !currentStatus.value.steps || currentStatus.value.steps.length === 0) {
    return 0
  }
  const completedSteps = currentStatus.value.steps.filter(s => s.done).length
  return (completedSteps / currentStatus.value.steps.length) * 100
})

const getStatusColor = (status: TrackStatus): 'primary' | 'neutral' => {
  if (status.id === props.currentStatusId) return 'primary'
  return 'neutral'
}

const selectStatus = (status: TrackStatus) => {
  emit('status-selected', status.id)
}

const completeStep = (step: Step) => {
  emit('step-completed', step.id)
}
</script>

