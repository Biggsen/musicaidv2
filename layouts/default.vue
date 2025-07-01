<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <NuxtLink to="/" class="text-xl font-bold text-gray-900">
                MusicAid
              </NuxtLink>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <NuxtLink 
                to="/" 
                class="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': $route.path === '/' }"
              >
                Home
              </NuxtLink>
              <NuxtLink 
                to="/about" 
                class="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': $route.path === '/about' }"
              >
                About
              </NuxtLink>
            </div>
          </div>
          
          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            <button class="btn-primary">
              Get Started
            </button>
          </div>
          
          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <ClientOnly>
                <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
                <template #fallback>
                  <span class="block w-6 h-6">☰</span>
                </template>
              </ClientOnly>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-show="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          <NuxtLink 
            to="/" 
            class="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600"
            @click="mobileMenuOpen = false"
          >
            Home
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
            @click="mobileMenuOpen = false"
          >
            About
          </NuxtLink>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          © 2025 MusicAid. Built with Nuxt 3.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)

// Close mobile menu when route changes
const route = useRoute()
watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style> 