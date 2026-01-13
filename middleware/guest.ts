export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return

    const { user, loading } = useAuth()

    if (!loading.value && user.value) {
        return navigateTo('/feed')
    }
})
