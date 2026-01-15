export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return

    const { user, isCreator, role, loading } = useAuth()

    console.log('[Middleware:Admin] Start', { path: to.path, loading: loading.value })

    // Wait for auth to initialize if it hasn't
    if (loading.value) {
        console.log('[Middleware:Admin] Waiting for auth...')
        await Promise.race([
            new Promise(resolve => {
                const unwatch = watch(loading, (isLoading) => {
                    if (!isLoading) {
                        unwatch()
                        resolve(true)
                    }
                })
            }),
            new Promise(resolve => setTimeout(() => {
                console.warn('[Middleware:Admin] Timeout waiting for auth')
                resolve(false)
            }, 5000)) // 5s timeout
        ])
    }

    console.log('[Middleware:Admin] Check', {
        hasUser: !!user.value,
        uid: user.value?.uid,
        role: role.value,
        isCreator: isCreator.value
    })

    if (!user.value) {
        console.log('[Middleware:Admin] No user, redirecting to login')
        return navigateTo('/login')
    }

    if (!isCreator.value) {
        console.log('[Middleware:Admin] Not admin/creator, redirecting to feed')
        return navigateTo('/feed')
    }

    console.log('[Middleware:Admin] Access Granted')
})
