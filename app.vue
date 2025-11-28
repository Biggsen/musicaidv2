<script setup lang="ts">
import type { UserProfile } from '~/composables/useAuth'
import type { NavigationMenuItem } from '@nuxt/ui'

// Global app configuration
useHead({
  title: 'MusicAid',
  meta: [{ name: 'description', content: 'Collaborative music creation platform' }],
})

const { getUserProfile, signOut } = useAuth()
const user = useSupabaseUser()
const userProfile = ref<UserProfile | null>(null)
const route = useRoute()

// Color mode
const colorMode = useColorMode()
const isDarkMode = computed({
  get: () => colorMode.value === 'dark',
  set: (value) => {
    colorMode.preference = value ? 'dark' : 'light'
  }
})

// Navigation items
const navItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    {
      label: 'Home',
      to: '/',
      active: route.path === '/'
    },
    {
      label: 'About',
      to: '/about',
      active: route.path === '/about'
    }
  ]

  if (user.value) {
    items.splice(1, 0,
      {
        label: 'Artists',
        to: '/artists',
        active: route.path.startsWith('/artists')
      },
      {
        label: 'Tracks',
        to: '/tracks',
        active: route.path.startsWith('/tracks')
      },
      {
        label: 'Albums',
        to: '/albums',
        active: route.path.startsWith('/albums')
      },
      {
        label: 'Templates',
        to: '/templates',
        active: route.path.startsWith('/templates')
      },
      {
        label: 'Statuses',
        to: '/statuses',
        active: route.path.startsWith('/statuses')
      },
      {
        label: 'Steps',
        to: '/steps',
        active: route.path.startsWith('/steps')
      }
    )
  }

  return items
})

// Fetch user profile when user is logged in (client-side only)
onMounted(async () => {
  await nextTick()
  if (user.value?.id) {
    userProfile.value = await getUserProfile()
  }
})

watch(user, async newUser => {
  if (newUser?.id && process.client) {
    userProfile.value = await getUserProfile()
  } else {
    userProfile.value = null
  }
})

// Handle logout
const handleLogout = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>

<template>
  <UApp>
    <UHeader title="MusicAid">
      <template #title>
        <Logo />
      </template>

      <ClientOnly>
        <UNavigationMenu :items="navItems" />
        <template #fallback>
          <div class="hidden lg:flex"></div>
        </template>
      </ClientOnly>

      <template #right>
        <div class="flex items-center gap-1.5">
          <ClientOnly>
            <USwitch
              v-model="isDarkMode"
              unchecked-icon="i-heroicons-sun"
              checked-icon="i-heroicons-moon"
            />
            <template #fallback>
              <div class="w-9 h-9"></div>
            </template>
          </ClientOnly>
          <ClientOnly>
            <template v-if="user">
              <span class="text-sm text-muted hidden sm:inline">{{ userProfile?.name || user.email }}</span>
              <UButton
                @click="handleLogout"
                color="primary"
                variant="ghost"
                size="sm"
              >
                Logout
              </UButton>
            </template>
            <template v-else>
              <UButton
                to="/login"
                color="primary"
                variant="ghost"
                size="sm"
              >
                Login
              </UButton>
              <UButton
                to="/register"
                color="primary"
                size="sm"
              >
                Get Started
              </UButton>
            </template>
          </ClientOnly>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-default pb-4">
            <span class="text-sm font-medium text-default">Theme</span>
            <ClientOnly>
              <USwitch
                v-model="isDarkMode"
                unchecked-icon="i-heroicons-sun"
                checked-icon="i-heroicons-moon"
              />
              <template #fallback>
                <div class="w-9 h-9"></div>
              </template>
            </ClientOnly>
          </div>
          <ClientOnly>
            <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
            <template #fallback>
              <div></div>
            </template>
          </ClientOnly>
          <ClientOnly>
            <template v-if="user">
              <div class="border-t border-default pt-4">
                <div class="px-2.5 py-2 text-base font-medium text-muted">
                  {{ userProfile?.name || user.email }}
                </div>
                <UButton
                  @click="handleLogout"
                  color="primary"
                  variant="ghost"
                  class="w-full justify-start -mx-2.5"
                  size="sm"
                >
                  Logout
                </UButton>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col gap-2 pt-4 border-t border-default">
                <UButton
                  to="/login"
                  color="primary"
                  variant="ghost"
                  class="w-full justify-start -mx-2.5"
                  size="sm"
                >
                  Login
                </UButton>
                <UButton
                  to="/register"
                  color="primary"
                  class="w-full justify-start -mx-2.5"
                  size="sm"
                >
                  Get Started
                </UButton>
              </div>
            </template>
          </ClientOnly>
        </div>
      </template>
    </UHeader>

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">© {{ new Date().getFullYear() }} MusicAid. Built with Nuxt 3.</p>
      </template>
    </UFooter>
  </UApp>
</template>
