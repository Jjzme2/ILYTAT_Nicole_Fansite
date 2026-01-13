import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export const useFirebaseAdmin = () => {
    const config = useRuntimeConfig()
    const apps = getApps()

    if (!apps.length) {
        // Option 1: Granular Env Vars (Preferred by User)
        const privateKey = config.firebaseAdminPrivateKey
        const projectId = config.firebaseAdminProjectId
        const clientEmail = config.firebaseAdminClientEmail

        let serviceAccount: any

        if (privateKey && projectId && clientEmail) {
            serviceAccount = {
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n') // Handle env var newlines
            }
        } else {
            // Option 2: Legacy File Path / JSON String
            serviceAccount = config.firebaseAdminServiceAccount

            if (!serviceAccount) {
                throw new Error('Missing Firebase Admin Configuration. Please set NUXT_FIREBASE_ADMIN_PRIVATE_KEY, _PROJECT_ID, and _CLIENT_EMAIL in your .env')
            }

            if (typeof serviceAccount === 'string' && (serviceAccount.includes('-----BEGIN PRIVATE KEY-----') || serviceAccount.includes('\n'))) {
                throw new Error('Invalid Configuration: NUXT_FIREBASE_ADMIN_SERVICE_ACCOUNT appears to be a raw key. Please use NUXT_FIREBASE_ADMIN_PRIVATE_KEY, NUXT_FIREBASE_ADMIN_CLIENT_EMAIL, and NUXT_FIREBASE_ADMIN_PROJECT_ID instead.')
            }

            try {
                if (typeof serviceAccount === 'string' && serviceAccount.trim().startsWith('{')) {
                    serviceAccount = JSON.parse(serviceAccount)
                }
            } catch (e) {
                console.error('Error parsing service account JSON', e)
            }
        }

        try {
            initializeApp({
                credential: cert(serviceAccount)
            })
        } catch (e: any) {
            console.error('Firebase Admin Init Error:', e.message)
            throw new Error(`Firebase Admin Init Failed: ${e.message}. Check your NUXT_FIREBASE_ADMIN_SERVICE_ACCOUNT in .env`)
        }
    }

    return {
        db: getFirestore()
    }
}
