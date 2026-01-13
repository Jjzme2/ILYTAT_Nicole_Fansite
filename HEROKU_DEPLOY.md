# Heroku Deployment Guide

The app is configured for Heroku deployment.

## Prerequisites
1.  Heroku Account.
2.  Heroku CLI installed.

## 1. Setup App
```bash
heroku create ilytat-fans
heroku buildpacks:set heroku/nodejs
```

## 2. Environment Variables
You MUST set these variables in Heroku Settings -> Config Vars:

| Key | Value |
| :--- | :--- |
| `NUXT_PUBLIC_FIREBASE_API_KEY` | *[Your Firebase API Key]* |
| `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *[Your Auth Domain]* |
| `NUXT_PUBLIC_FIREBASE_PROJECT_ID` | *[Your Project ID]* |
| `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *[Your Storage Bucket]* |
| `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *[Your Sender ID]* |
| `NUXT_PUBLIC_FIREBASE_APP_ID` | *[Your App ID]* |
| `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | *[Your Stripe Key]* |
| `NUXT_PUBLIC_STRIPE_PRICE_ID` | *[Your Price ID]* |
| `NUXT_FIREBASE_ADMIN_PROJECT_ID` | *[Your Project ID]* |
| `NUXT_FIREBASE_ADMIN_CLIENT_EMAIL` | *[Your Service Account Email]* |
| `NUXT_FIREBASE_ADMIN_PRIVATE_KEY` | *[Your Private Key (Replace \n with real newlines if needed)]* |
| `HOST` | `0.0.0.0` |
| `NODE_ENV` | `production` |

## 3. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```
