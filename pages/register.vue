<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>

      <UCard class="bg-white">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
          />

          <UAlert
            v-if="successMessage"
            color="success"
            variant="soft"
            :title="successMessage"
          />

          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <UInput
              id="name"
              v-model="name"
              type="text"
              placeholder="Full name"
              autocomplete="name"
              required
              class="bg-white"
            />
          </div>

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
              autocomplete="new-password"
              required
              class="bg-white"
            />
          </div>

          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <UInput
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm password"
              autocomplete="new-password"
              required
              class="bg-white"
              :error="password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined"
            />
          </div>

          <UButton
            type="submit"
            :loading="loading"
            :disabled="password !== confirmPassword"
            color="primary"
            block
            size="lg"
          >
            Create account
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

const { signUp } = useAuth()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    const { data, error: signUpError } = await signUp(email.value, password.value, name.value)

    if (signUpError) {
      throw signUpError
    }

    // Check if email confirmation is required
    if (data.session) {
      // User is automatically signed in (email confirmation disabled)
      await router.push('/')
    } else {
      // Email confirmation is required
      successMessage.value =
        'Account created! Please check your email to confirm your account before signing in.'
      // Clear form
      name.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Register - MusicAid',
  description: 'Create your MusicAid account',
})
</script>
