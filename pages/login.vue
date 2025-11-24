<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to MusicAid</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </NuxtLink>
        </p>
      </div>

      <UCard class="bg-white">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <UAlert
            v-if="registered"
            color="success"
            variant="soft"
            title="Account created!"
            description="Please check your email to confirm your account, then sign in."
          />

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
          />

          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <UInput
              id="email"
              v-model="email"
              type="email"
              placeholder="Email address"
              autocomplete="email"
              required
              class="bg-white"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <UInput
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              required
              class="bg-white"
            />
          </div>

          <UButton
            type="submit"
            :loading="loading"
            color="primary"
            block
            size="lg"
          >
            Sign in
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { signIn } = useAuth()
const router = useRouter()

const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const registered = computed(() => route.query.registered === 'true')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await signIn(email.value, password.value)
    await router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Failed to sign in. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Login - MusicAid',
  description: 'Sign in to your MusicAid account',
})
</script>
