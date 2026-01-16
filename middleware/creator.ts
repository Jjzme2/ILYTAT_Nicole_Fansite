export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return

    const { user, isCreator, loading } = useAuth()

    // Wait for auth
    if (loading.value) {
        await new Promise(resolve => {
            const unwatch = watch(loading, (isLoading) => {
                if (!isLoading) {
                    unwatch()
                    resolve(true)
                }
            })
        })
    }

    if (!user.value) return navigateTo('/login')

    // Strict Creator Check
    if (user.value.role !== 'creator') {
        console.log('[Middleware:Creator] Access Denied. Role is not creator.')
        return navigateTo('/feed')
    }
})
