export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return

    const { user, isCreator, isAdmin, isDeveloper, roles, loading } = useAuth()

    console.log('[Middleware:Admin] Start', { path: to.path, loading: loading.value })

    // Wait for auth to initialize if it hasn't
    if (loading.value) {
        console.log('[Middleware:Admin] Waiting for auth...')
        await new Promise(resolve => {
            const timer = setTimeout(() => {
                if (loading.value) {
                    console.warn('[Middleware:Admin] Timeout waiting for auth (8s)')
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

    console.log('[Middleware:Admin] Check', {
        hasUser: !!user.value,
        uid: user.value?.uid,
        roles: roles.value,
        isCreator: isCreator.value,
        isDeveloper: isDeveloper.value
    })

    if (!user.value) {
        console.log('[Middleware:Admin] No user, redirecting to login')
        return navigateTo('/login')
    }

    if (!isAdmin.value && !isCreator.value && !isDeveloper.value) {
        console.log('[Middleware:Admin] Not admin/creator/dev, redirecting to feed')
        return navigateTo('/feed')
    }

    console.log('[Middleware:Admin] Access Granted')
})
