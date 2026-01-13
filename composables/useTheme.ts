export const useTheme = () => {
    const config = useAppConfig()

    // State
    // We use a cookie to persist the theme across page loads
    // This assumes the user wants their theme preference remembered
    const activeTheme = useCookie('activeTheme', {
        default: () => config.theme.active || 'default',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    // Computed styles for the theme
    const themeStyles = computed(() => {
        const themeKey = activeTheme.value
        // Fallback to active in config, then default
        const theme = config.theme.themes[themeKey] || config.theme.themes.default || config.theme.themes['default']

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
        }
    })

    // Actions
    const setTheme = (themeKey: string) => {
        if (config.theme.themes[themeKey]) {
            activeTheme.value = themeKey
            // Also update the config state in memory for immediate reactivity in some contexts if needed
            // But usually the cookie + computed is enough
            config.theme.active = themeKey
        }
    }

    return {
        activeTheme,
        themeStyles,
        setTheme,
        themes: config.theme.themes
    }
}
