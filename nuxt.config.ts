// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configuration
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (server-side only)
    stripeSecretKey: '', // NUXT_STRIPE_SECRET_KEY
    stripeWebhookSecret: '',
    firebaseAdminServiceAccount: '', // JSON string or path
    firebaseAdminProjectId: '',
    firebaseAdminClientEmail: '',
    firebaseAdminPrivateKey: '',
    // Public keys (client-side)
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      stripePublishableKey: '',
      stripePriceId: ''
    }
  },
  app: {
    head: {
      title: 'Nicole Circle',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Exclusive content platform for its.nicole.christine' }
      ]
    }
  },
  devtools: { enabled: true },
  devServer: {
    port: 3000
  }
})
