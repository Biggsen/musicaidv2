<template>
  <div class="py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About MusicAid</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Building the future of collaborative music creation with modern web technologies.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-gray-600 mb-6">
            MusicAid is designed to revolutionize how musicians collaborate and create together.
            We're building a platform that combines the power of modern web technologies with
            intuitive design to make music creation more accessible and collaborative than ever
            before.
          </p>
          <p class="text-gray-600">
            Built with Nuxt 3, TypeScript, TailwindCSS, and powered by modern development practices,
            MusicAid provides a robust foundation for musical creativity.
          </p>
        </div>

        <div class="card">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Technology Stack</h3>
          <ul class="space-y-3">
            <li class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-3" />
              <span>Nuxt 3 with TypeScript</span>
            </li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-3" />
              <span>TailwindCSS & Nuxt UI</span>
            </li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-3" />
              <span>Pinia State Management</span>
            </li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-3" />
              <span>ESLint & Prettier</span>
            </li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mr-3" />
              <span>Full-Stack Capabilities</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Start Building?</h2>
        <p class="text-gray-600 mb-8">
          The foundation is set up and ready for development. Let's create something amazing
          together!
        </p>
        <NuxtLink to="/" class="btn-primary"> Back to Home </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useSeoMeta({
  title: 'About - MusicAid',
  description:
    'Learn about MusicAid, the collaborative music creation platform built with modern web technologies.',
})
</script>
