<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">Welcome to MusicAid</h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Manage your music production workflows, track recording sessions, and organize your
            projects with ease
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/register"
              class="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Get Started
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Music Production
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Track workflows, organize recording sessions, manage artists and tracks, and keep your
            production process organized from start to finish.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="card text-center">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <ClientOnly>
                <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-blue-600" />
                <template #fallback>
                  <span class="text-blue-600 text-xl">⚡</span>
                </template>
              </ClientOnly>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Workflow Management</h3>
            <p class="text-gray-600">
              Create custom workflow templates, track production stages, and manage your projects
              through every step of the process.
            </p>
          </div>

          <div class="card text-center">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <ClientOnly>
                <UIcon name="i-heroicons-users" class="w-6 h-6 text-green-600" />
                <template #fallback>
                  <span class="text-green-600 text-xl">👥</span>
                </template>
              </ClientOnly>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Recording Tracking</h3>
            <p class="text-gray-600">
              Organize recording sessions, track instrument recordings, and manage audio files for
              all your projects in one place.
            </p>
          </div>

          <div class="card text-center">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <ClientOnly>
                <UIcon name="i-heroicons-musical-note" class="w-6 h-6 text-purple-600" />
                <template #fallback>
                  <span class="text-purple-600 text-xl">🎵</span>
                </template>
              </ClientOnly>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Project Organization</h3>
            <p class="text-gray-600">
              Manage artists, tracks, albums, and templates. Keep notes, track statuses, and
              organize your entire music production workflow.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Start organizing your music production workflow today. Track your projects, manage
          recording sessions, and keep everything in sync.
        </p>
        <UButton
          to="/register"
          color="success"
          size="lg"
        >
          Start Building
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useSeoMeta({
  title: 'MusicAid - Music Production & Recording Management System',
  description:
    'Manage your music production workflows, track recording sessions, and organize your projects. Built for artists, producers, and studios.',
})

// Optional: Add page-specific logic here
</script>

<style scoped>
/* Page-specific styles if needed */
</style>
