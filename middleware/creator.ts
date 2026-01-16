export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return

    const { user, isAdmin, loading } = useAuth()

    // Wait for auth
    if (loading.value) {
        console.log('[Middleware:Creator] Waiting for auth...')
        await new Promise(resolve => {
            const timer = setTimeout(() => {
                if (loading.value) {
                    console.warn('[Middleware:Creator] Timeout waiting for auth (8s)')
                    resolve(false)
                }
            }, 8000)

            const unwatch = watch(loading, (isLoading) => {
                if (!isLoading) {
                    clearTimeout(timer)
                    unwatch()
                    resolve(true)
                }
            }, { immediate: true })
        })
    }

    if (!user.value) return navigateTo('/login')

    // Creator Check (Admins allowed too because isAdmin includes isCreator)
    if (!isAdmin.value) {
        console.log('[Middleware:Creator] Access Denied. Role is not creator/admin.')
        return navigateTo('/feed')
    }
})
