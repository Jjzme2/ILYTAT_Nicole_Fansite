export default defineNuxtPlugin((nuxtApp) => {

    // 1. Disable Right Click on Images/Videos
    window.addEventListener('contextmenu', (e) => {
        if (e.target instanceof HTMLElement) {
            const tagName = e.target.tagName.toLowerCase()
            // Block context menu on media elements
            if (tagName === 'img' || tagName === 'video' || tagName === 'audio' || e.target.closest('.protected-media')) {
                e.preventDefault()
                // Optional: Show toast? "Content is protected"
                // useToast().error("Content sharing is disabled.") -> Requires Nuxt Context, maybe too aggressive.
                return false
            }
        }
    })

    // 2. Disable Dragging (Drag to Desktop)
    window.addEventListener('dragstart', (e) => {
        if (e.target instanceof HTMLElement) {
            const tagName = e.target.tagName.toLowerCase()
            if (tagName === 'img' || tagName === 'video') {
                e.preventDefault()
                return false
            }
        }
    })

})
