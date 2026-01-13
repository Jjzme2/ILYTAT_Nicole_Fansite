export default defineNuxtPlugin((nuxtApp) => {
    const { initAuth } = useAuth()
    initAuth()
})
