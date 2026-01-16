// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configuration
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss', 'nuxt-gtag'],
  gtag: {
    id: 'G-XXXXXXXXXX' // TODO: Replace with actual Google Analytics ID
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (server-side only)
    stripeSecretKey: '', // NUXT_STRIPE_SECRET_KEY
    stripeWebhookSecret: '',
    firebaseAdminServiceAccount: '', // JSON string or path
    firebaseAdminProjectId: '',
    firebaseAdminClientEmail: '',
    firebaseAdminPrivateKey: '',
    // SendGrid Email Config (Primary)
    sendgridApiKey: '', // NUXT_SENDGRID_API_KEY
    sendgridFromEmail: 'noreply@ilytat.com', // NUXT_SENDGRID_FROM_EMAIL
    // SMTP Email Config (Fallback)
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: 'false',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '', // NUXT_SMTP_FROM - must match smtpUser for Zoho
    // Daily Reports
    reportEmail: '', // NUXT_REPORT_EMAIL - CSV list of emails to receive daily reports
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
