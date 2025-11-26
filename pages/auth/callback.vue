<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
        <p class="text-gray-600">Completing authentication...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500"> Return to login </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const supabase = useSupabase()
const router = useRouter()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data, error: authError } = await supabase.auth.getSession()

    if (authError) throw authError

    if (data.session) {
      await router.push('/')
    } else {
      error.value = 'Authentication failed'
      loading.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during authentication'
    loading.value = false
  }
})
</script>



