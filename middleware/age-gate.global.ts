export default defineNuxtRouteMiddleware((to, from) => {
    // Whitelist public routes where age verification isn't strictly blocking
    // e.g. the age gate itself, login (though login usually implies entry, preventing login until verified is better)
    // Actually, user flow: Welcome -> Enter -> Login -> Feed

    const publicRoutes = ['/welcome', '/legal/content-policy']
    if (publicRoutes.includes(to.path)) return

    const ageCookie = useCookie('age_verified')

    if (!ageCookie.value) {
        // If not verified, force redirect to Age Gate
        console.log('[AgeGate] No verification cookie found. Redirecting to /welcome')
        return navigateTo('/welcome')
    }
})
