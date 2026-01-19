// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configuration
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss', 'nuxt-gtag'],
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || ''
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (server-side only)
    adminSecret: '', // NUXT_ADMIN_SECRET
    stripeSecretKey: '', // NUXT_STRIPE_SECRET_KEY
    stripeWebhookSecret: '',
    firebaseAdminServiceAccount: '', // JSON string or path
    firebaseAdminProjectId: '',
    firebaseAdminClientEmail: '',
    firebaseAdminPrivateKey: '',
    // EmailJS Config (Primary)
    emailjs: {
      serviceId: '', // NUXT_EMAILJS_SERVICE_ID
      generalTemplateId: '', // NUXT_EMAILJS_GENERAL_TEMPLATE_ID
      dailyReportTemplateId: '', // NUXT_EMAILJS_DAILY_REPORT_TEMPLATE_ID
      publicKey: '', // NUXT_EMAILJS_PUBLIC_KEY
      privateKey: '', // NUXT_EMAILJS_PRIVATE_KEY
      fromEmail: 'noreply@ilytat.com' // NUXT_EMAILJS_FROM_EMAIL
    },
    // SMTP Email Config (Fallback)
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: 'false',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '', // NUXT_SMTP_FROM - must match smtpUser for Zoho
    // Daily Reports
    reportEmail: '', // NUXT_REPORT_EMAIL - CSV list of emails to receive daily reports
    // Private (Server-Side Only)
    r2: {
      accountId: '', // NUXT_R2_ACCOUNT_ID
      accessKeyId: '', // NUXT_R2_ACCESS_KEY_ID
      secretAccessKey: '', // NUXT_R2_SECRET_ACCESS_KEY
      bucketName: '' // NUXT_R2_BUCKET_NAME
    },
    // Public keys (client-side)
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      stripePublishableKey: '',
      stripePriceId: '',
      mediaDomain: 'media.ilytat.com'
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
