// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  // UI configuration - disable dark mode
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Enable SSR for full-stack capabilities
  ssr: true,

  // API configuration
  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: true,
    },
  },

  // CSS configuration
  css: ['~/assets/css/main.css'],

  // Experimental features to help with hydration
  experimental: {
    payloadExtraction: false,
  },

  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/', '/about', '/login', '/register', '/auth/callback'],
    },
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },
})
