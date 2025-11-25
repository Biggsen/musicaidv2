<script setup lang="ts">
// Global app configuration
useHead({
  title: 'MusicAid',
  meta: [{ name: 'description', content: 'Collaborative music creation platform' }],
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
