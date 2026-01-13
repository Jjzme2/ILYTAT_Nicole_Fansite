import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey as string,
        authDomain: config.public.firebaseAuthDomain as string,
        projectId: config.public.firebaseProjectId as string,
        storageBucket: config.public.firebaseStorageBucket as string,
        messagingSenderId: config.public.firebaseMessagingSenderId as string,
        appId: config.public.firebaseAppId as string
    }

    const apps = getApps()
    const app = apps.length ? apps[0] : initializeApp(firebaseConfig)

    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    return {
        provide: {
            auth,
            db,
            storage
        }
    }
})
