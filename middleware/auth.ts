export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return

    const { user, loading } = useAuth()

    // If still loading, we might want to wait or let App.vue handle it.
    // But if we are here, we want to protect the route.

    if (!loading.value && !user.value) {
        return navigateTo('/login')
    }

    // Watcher in App.vue also handles redirects if loading state finishes later.
})
