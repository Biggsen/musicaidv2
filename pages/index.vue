<template>
  <div>
    <!-- Hero Section -->
    <UPageHero
      title="Welcome to MusicAid"
      description="Manage your music production workflows, track recording sessions, and organize your projects with ease"
      :links="heroLinks"
      :ui="{ root: 'bg-gradient-to-br from-blue-600 to-purple-700' }"
    />

    <!-- Features Section -->
    <UPageSection>
      <UPageHeader
        title="Everything You Need to Manage Your Music Production"
        description="Track workflows, organize recording sessions, manage artists and tracks, and keep your production process organized from start to finish."
      />

      <UPageGrid>
        <UPageFeature
          title="Workflow Management"
          description="Create custom workflow templates, track production stages, and manage your projects through every step of the process."
        >
          <template #icon>
            <ClientOnly>
              <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-primary" />
              <template #fallback>
                <span class="text-primary text-xl">⚡</span>
              </template>
            </ClientOnly>
          </template>
        </UPageFeature>

        <UPageFeature
          title="Recording Tracking"
          description="Organize recording sessions, track instrument recordings, and manage audio files for all your projects in one place."
        >
          <template #icon>
            <ClientOnly>
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-success" />
              <template #fallback>
                <span class="text-success text-xl">👥</span>
              </template>
            </ClientOnly>
          </template>
        </UPageFeature>

        <UPageFeature
          title="Project Organization"
          description="Manage artists, tracks, albums, and templates. Keep notes, track statuses, and organize your entire music production workflow."
        >
          <template #icon>
            <ClientOnly>
              <UIcon name="i-heroicons-musical-note" class="w-6 h-6 text-primary" />
              <template #fallback>
                <span class="text-primary text-xl">🎵</span>
              </template>
            </ClientOnly>
          </template>
        </UPageFeature>
      </UPageGrid>
    </UPageSection>

    <!-- CTA Section -->
    <UPageCTA
      title="Ready to Get Started?"
      description="Start organizing your music production workflow today. Track your projects, manage recording sessions, and keep everything in sync."
      :links="ctaLinks"
      :ui="{ root: 'bg-default text-inverted' }"
    />
  </div>
</template>

<script setup lang="ts">
// Page metadata
useSeoMeta({
  title: 'MusicAid - Music Production & Recording Management System',
  description:
    'Manage your music production workflows, track recording sessions, and organize your projects. Built for artists, producers, and studios.',
})

// Hero section links
const heroLinks = [
  {
    label: 'Get Started',
    to: '/register',
    color: 'primary' as const,
    variant: 'solid' as const,
    size: 'lg' as const,
  },
  {
    label: 'Learn More',
    to: '/about',
    color: 'primary' as const,
    variant: 'outline' as const,
    size: 'lg' as const,
  },
]

// CTA section links
const ctaLinks = [
  {
    label: 'Start Building',
    to: '/register',
    color: 'success' as const,
    size: 'lg' as const,
  },
]
</script>

<style scoped>
/* Page-specific styles if needed */
</style>
