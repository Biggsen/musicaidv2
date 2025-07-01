// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt'
  ],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Enable SSR for full-stack capabilities
  ssr: true,

  // API configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // CSS configuration
  css: ['~/assets/css/main.css'],
  
  // Experimental features to help with hydration
  experimental: {
    payloadExtraction: false
  }
})