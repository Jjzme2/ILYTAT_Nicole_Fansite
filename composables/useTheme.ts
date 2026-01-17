import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useTheme = () => {
    const config = useAppConfig()
    const { $db } = useNuxtApp()
    const { user } = useAuth()

    // Use a shared state for the active theme to ensure all components stay in sync
    const cookie = useCookie('activeTheme', {
        default: () => config.theme.active || 'default',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    const activeTheme = useState('activeTheme', () => cookie.value)

    // Validate and fix invalid states immediately
    const themes = config.theme.themes as Record<string, any>
    if (!themes[activeTheme.value]) {
        activeTheme.value = 'default'
    }

    // Sync state changes back to cookie and Firestore
    watch(activeTheme, async (newVal, oldVal) => {
        if (process.server) return

        cookie.value = newVal
        config.theme.active = newVal

        // If theme hasn't actually changed or no DB, don't sync
        if (newVal === oldVal || !$db) return

        // If user is logged in, sync to Firestore
        if (user.value?.uid) {
            try {
                await setDoc(doc($db, 'users', user.value.uid), {
                    preferences: {
                        theme: newVal
                    }
                }, { merge: true })
            } catch (e) {
                console.error('[useTheme] Failed to sync theme to Firestore:', e)
            }
        }
    })

    // Sync from User Profile on login
    if (process.client) {
        watch(user, async (newUser) => {
            if (!newUser?.uid || !$db) return

            try {
                const userDoc = await getDoc(doc($db, 'users', newUser.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    const preferredTheme = data?.preferences?.theme
                    if (preferredTheme && themes[preferredTheme] && preferredTheme !== activeTheme.value) {
                        activeTheme.value = preferredTheme
                    }
                }
            } catch (e) {
                console.error('[useTheme] Failed to fetch theme from Firestore:', e)
            }
        }, { immediate: true })
    }

    // Computed styles for the theme
    const themeStyles = computed(() => {
        const themeKey = activeTheme.value as string
        // Fallback to active in config, then default
        const theme = themes[themeKey] || themes.default || themes['default']

        if (!theme) return {}

        const colors = theme.colors
        return {
            '--color-primary': colors.primary,
            '--color-secondary': colors.secondary,
            '--color-background': colors.background,
            '--color-surface': colors.surface,
            '--color-text': colors.text,
            '--color-muted': colors.muted,
            '--color-border': colors.border,
            '--color-success': colors.success || '#22C55E',
            '--color-error': colors.error || '#EF4444',
            '--color-warning': colors.warning || '#EAB308',
            '--color-info': colors.info || '#3B82F6',
            '--color-glow': colors.glow || colors.primary,
        }
    })

    // Actions
    const setTheme = (themeKey: string) => {
        if (themes[themeKey]) {
            activeTheme.value = themeKey
        }
    }

    return {
        activeTheme,
        themeStyles,
        setTheme,
        themes: config.theme.themes
    }
}
