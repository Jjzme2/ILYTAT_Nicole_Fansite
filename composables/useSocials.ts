import { Mail } from 'lucide-vue-next'
import { defineAsyncComponent } from 'vue'

// Import Lucide icons that we might fallback to or use
// But for the main ones we will use our new components
// We need to resolve the components. Since we don't have them yet, I'll name them as strings
// and ensure they are auto-imported or globally registered, OR I can define them here if they are simple functional components.

// Actually, defining simple functional components with h() or just objects here is cleaner than separate files for small icons?
// But separate files are better for maintenance.
// I'll assume I will create: LogoTiktok, LogoTwitter, LogoInstagram in global components dir or manually import them if using separate files.

// Let's rely on Nuxt's auto-import for components in /components
// So 'LogoTiktok' string should work if I use <resolveComponent> or just let <component :is> handle it if it's registered.
// However, passing a string to :is only works if it's a registered component. Nuxt auto-imports are usually available.

export const useSocials = () => {
    const config = useAppConfig()

    // We can use resolveComponent if we are inside setup, but this is a composable.
    // It's safer to import the components directly if we create them.
    // Let's plan to create them in /components/logos/ and let Nuxt auto import as 'LogosTiktok' etc.

    // For now, I will define the list and assume the components exist.
    // I will use component names as strings "LogosInstagram", "LogosTwitter", etc. which Nuxt maps to components/logos/Instagram.vue -> <LogosInstagram />

    const socialLinks = computed(() => {
        const s = config.socials || {}
        const links = []

        // Helper to process social entries
        const processSocial = (key, name, defaultColor) => {
            const entry = s[key]
            if (!entry) return

            // Support both string (legacy) and object formats
            const url = typeof entry === 'string' ? entry : entry.url
            const icon = typeof entry === 'object' ? entry.icon : null

            if (url) {
                links.push({
                    name,
                    url,
                    icon, // This is now a URL string
                    color: defaultColor
                })
            }
        }

        processSocial('instagram', 'Instagram', 'hover:border-pink-500')
        processSocial('twitter', 'X (Twitter)', 'hover:border-blue-400')
        processSocial('email', 'Email', 'hover:border-gray-800')
        processSocial('tiktok', 'TikTok', 'hover:border-black')
        processSocial('youtube', 'YouTube', 'hover:border-red-600')

        return links
    })

    return {
        socialLinks
    }
}
