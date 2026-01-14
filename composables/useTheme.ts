export const useTheme = () => {
    const config = useAppConfig()

    // Use a shared state for the active theme to ensure all components stay in sync
    // Initialize from cookie if available, otherwise default
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

    // Sync state changes back to cookie
    watch(activeTheme, (newVal) => {
        cookie.value = newVal
        config.theme.active = newVal
    })

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
