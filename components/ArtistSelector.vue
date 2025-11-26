<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <USelect
      :model-value="modelValue"
      :items="artistOptions"
      :placeholder="placeholder"
      :disabled="loading || disabled"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { Artist } from '~/composables/useArtists'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an artist',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { getArtists } = useArtists()

const artists = ref<Artist[]>([])
const loading = ref(true)

const artistOptions = computed(() => {
  return artists.value.map(artist => ({
    label: artist.name,
    value: artist.id,
  }))
})

onMounted(async () => {
  await loadArtists()
})

const loadArtists = async () => {
  loading.value = true
  try {
    artists.value = await getArtists()
  } catch (err: any) {
    console.error('Failed to load artists:', err)
  } finally {
    loading.value = false
  }
}

const handleChange = (value: string | undefined) => {
  emit('update:modelValue', value)
}
</script>



