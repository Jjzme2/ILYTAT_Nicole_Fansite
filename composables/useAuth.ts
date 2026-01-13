import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    updateProfile,
    signInWithPopup,
    type User
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuth = () => {
    const { $auth, $db } = useNuxtApp() as any

    // State
    const user = useState<User | null>('user', () => null)
    const isSubscriber = useState<boolean>('isSubscriber', () => false)
    const role = useState<'admin' | 'user' | 'creator'>('role', () => 'user')
    const loading = useState<boolean>('authLoading', () => true)

    const isAdmin = computed(() => role.value === 'admin')
    const isCreator = computed(() => role.value === 'creator' || role.value === 'admin') // Creators function like admins for content

    // Sync auth state
    const initAuth = () => {
        if (process.server) return
        console.log('[useAuth] Init: Starting listener')

        onAuthStateChanged($auth, async (currentUser) => {
            console.log('[useAuth] Auth State Changed:', currentUser?.uid)
            user.value = currentUser

            if (currentUser) {
                // Security Check: Session Timeout
                const config = useAppConfig()
                const timeoutMinutes = config.security?.sessionTimeoutMinutes || 1440 // Default 24h
                const lastLoginKey = 'lastLogin_' + currentUser.uid
                const lastLoginStr = localStorage.getItem(lastLoginKey)
                const now = Date.now()

                if (lastLoginStr) {
                    const lastLogin = parseInt(lastLoginStr)
                    const diffMinutes = (now - lastLogin) / 1000 / 60
                    if (diffMinutes > timeoutMinutes) {
                        console.log('[useAuth] Session expired (Timeout)')
                        await signOut($auth)
                        navigateTo('/login?expired=true')
                        return
                    }
                } else {
                    // First time seeing this session in this browser instance, mark safe check?
                    // Or set it now.
                    localStorage.setItem(lastLoginKey, now.toString())
                }

                // Check Firestore for profile
                const userDocRef = doc($db, 'users', currentUser.uid)
                const userDoc = await getDoc(userDocRef)

                if (userDoc.exists()) {
                    const data = userDoc.data()
                    console.log('[useAuth] Firestore Data:', data)
                    isSubscriber.value = data?.isSubscriber || false
                    role.value = data?.role || 'user'
                } else {
                    console.log('[useAuth] No Firestore doc, creating default')
                    // Create basic user profile if not exists
                    // Note: If registering, the register function might create this first, but this handles Google Auth or direct path
                    await setDoc(userDocRef, {
                        email: currentUser.email,
                        displayName: currentUser.displayName || '',
                        isSubscriber: false,
                        stripeCustomerId: null,
                        role: 'user',
                        createdAt: new Date()
                    }, { merge: true })
                    isSubscriber.value = false
                    role.value = 'user'
                }
            } else {
                isSubscriber.value = false
                role.value = 'user'
            }

            loading.value = false
            console.log('[useAuth] Init: Complete', { role: role.value, loading: loading.value })
        })
    }

    // Actions
    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword($auth, email, pass)
    }

    const register = async (email: string, pass: string, name: string) => {
        const cred = await createUserWithEmailAndPassword($auth, email, pass)

        if (cred.user) {
            // Update Auth Profile
            await updateProfile(cred.user, {
                displayName: name
            })

            // Create Firestore Profile immediately with name
            const userDocRef = doc($db, 'users', cred.user.uid)
            await setDoc(userDocRef, {
                email: email,
                displayName: name,
                isSubscriber: false,
                stripeCustomerId: null,
                role: 'user',
                createdAt: new Date()
            })

            // Force local update if needed, though onAuthStateChanged should catch it
            user.value = { ...cred.user, displayName: name }
        }
    }

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup($auth, provider)
    }

    const logout = async () => {
        await signOut($auth)
        navigateTo('/login')
    }

    const refreshUser = async () => {
        if (!user.value) return
        loading.value = true
        const userDocRef = doc($db, 'users', user.value.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
            const data = userDoc.data()
            isSubscriber.value = data?.isSubscriber || false
            role.value = data?.role || 'user'
        }
        loading.value = false
    }

    return {
        user,
        isSubscriber,
        role,
        isAdmin,
        isCreator,
        loading,
        initAuth,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser
    }
}
