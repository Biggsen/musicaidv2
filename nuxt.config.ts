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
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  // UI configuration - enable dark mode
  colorMode: {
    preference: 'system',
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
    // Don't let Nitro bundle the AWS SDK
    externals: {
      inline: [],
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
    // R2 credentials (server-side only)
    r2AccountId: process.env.R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || '',
    r2PublicUrl: process.env.R2_PUBLIC_URL || '',
    // R2 endpoint URL
    r2Endpoint: process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      r2PublicUrl: process.env.R2_PUBLIC_URL || '',
    },
  },
})
