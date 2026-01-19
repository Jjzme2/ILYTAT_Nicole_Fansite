<template>
  <div class="min-h-screen bg-background text-text font-sans antialiased transition-colors duration-300">
    
    <!-- Loading Screen -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-background z-50">
         <LucideLoader class="w-10 h-10 animate-spin text-primary" />
    </div>

    <!-- Main App -->
    <div v-show="!loading" class="flex flex-col min-h-screen">
      <!-- System Messages (Top Banners Push Content) -->
      <SystemAnnouncer />
      
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      
      <footer class="border-t border-border py-8 mt-auto bg-background">
        <div class="container mx-auto px-4 text-center">
          <div class="flex justify-center gap-6 mb-6 text-muted">
             <a 
               v-for="link in socialLinks" 
               :key="link.name" 
               :href="link.url" 
               target="_blank" 
               class="hover:text-primary transition transform hover:scale-110"
               :title="link.name"
             >
               <img v-if="typeof link.icon === 'string'" :src="link.icon" class="w-5 h-5 object-contain" alt="" />
               <component v-else :is="link.icon" class="w-5 h-5" />
             </a>
          </div>
          
          <!-- ILYTAT Parenting Brand -->
          <div class="mb-6">
              <img :src="`https://${runtimeConfig.public.mediaDomain}/logo.png`" alt="ILYTAT" class="h-8 mx-auto opacity-50 hover:opacity-80 transition-opacity" />
          </div>

          <div class="text-sm text-muted">
              <p>&copy; {{ new Date().getFullYear() }} {{ config.meta.copyright }}. All rights reserved.</p>
              <p class="mt-2">
                Operated by <span class="font-semibold text-text">{{ config.meta.operator }}</span>.
              </p>
              <p class="mt-4 text-xs opacity-50">
                  Made with the help of <a href="https://deepmind.google/technologies/antigravity/" target="_blank" class="hover:underline">Google Antigravity</a>.
              </p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Global Theme Styles -->
    <Head>
        <!-- SEO Meta Tags from Config -->
        <Title>{{ config.metaDom?.title || 'Nicole Circle' }}</Title>
        <Meta name="description" :content="config.metaDom?.description || ''" />
        <Meta name="keywords" :content="config.metaDom?.keywords || ''" />
        <Meta property="og:title" :content="config.metaDom?.title || 'Nicole Circle'" />
        <Meta property="og:description" :content="config.metaDom?.description || ''" />
        <Meta property="og:image" :content="config.metaDom?.ogImage || '/og-image.png'" />
        <Meta property="og:type" content="website" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:site" :content="config.metaDom?.twitterHandle || ''" />
        <Meta name="twitter:title" :content="config.metaDom?.title || 'Nicole Circle'" />
        <Meta name="twitter:description" :content="config.metaDom?.description || ''" />
        <Meta name="twitter:image" :content="config.metaDom?.ogImage || '/og-image.png'" />
        
        <component :is="'style'">
            :root {
                --color-primary: {{ themeStyles['--color-primary'] }};
                --color-secondary: {{ themeStyles['--color-secondary'] }};
                --color-background: {{ themeStyles['--color-background'] }};
                --color-surface: {{ themeStyles['--color-surface'] }};
                --color-text: {{ themeStyles['--color-text'] }};
                --color-muted: {{ themeStyles['--color-muted'] }};
                --color-border: {{ themeStyles['--color-border'] }};
                --color-success: {{ themeStyles['--color-success'] }};
                --color-error: {{ themeStyles['--color-error'] }};
                --color-warning: {{ themeStyles['--color-warning'] }};
                --color-info: {{ themeStyles['--color-info'] }};
                --color-glow: {{ themeStyles['--color-glow'] }};
            }
        </component>
    </Head>
    
    <!-- Toast Notifications -->
    <ToastNotification />

    <!-- Floating Navigation Button -->
    <NuxtLink 
        v-if="showFloatingNav"
        :to="user ? '/hub' : '/'"
        class="fixed bottom-6 right-6 z-40 p-4 bg-primary text-white rounded-full shadow-xl shadow-primary/30 hover:scale-110 hover:shadow-2xl transition-all duration-300 group"
        title="Go Home"
    >
        <Home class="w-5 h-5 group-hover:rotate-12 transition-transform" />
    </NuxtLink>



    <!-- Auth State Glow -->
    <div 
        class="fixed inset-0 pointer-events-none"
        :class="glowConfig.class"
        :style="glowConfig.style"
    ></div>
  </div>
</template>

<script setup>
import { Loader as LucideLoader, Home } from 'lucide-vue-next'
const config = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const { themeStyles, activeTheme } = useTheme()

const { socialLinks } = useSocials()

const { loading, user } = useAuth()
const router = useRouter()
const route = useRoute()

// Pages where we hide the floating nav (already have navigation)
const hiddenNavPages = ['/', '/hub', '/login', '/register', '/admin', '/creator']
const showFloatingNav = computed(() => {
    return !hiddenNavPages.includes(route.path) && !loading.value
})

// --- Glow Configuration ---
const glowActive = ref(false)
let glowTimer = null

const triggerGlow = () => {
    glowActive.value = true
    if (glowTimer) clearTimeout(glowTimer)
    glowTimer = setTimeout(() => {
        glowActive.value = false
    }, 2500) // ~2-3 seconds duration
}

// Trigger on mount if we want an initial hello, otherwise only on change?
// User said "after the user logs in or out", implies change. 
// But if I refresh and I'm logged in, do I see it? Maybe not perpetual means not just state-based.
// Let's stick to watching `user`.

watch(user, () => {
    triggerGlow()
})

const glowConfig = computed(() => {
    const ui = config.ui.glow
    const isActive = glowActive.value
    
    // Aesthetic Transition Constants
    const opacity = isActive ? '0.8' : '0'
    const scale = isActive ? '1.05' : '1' // Breathe in
    const duration = isActive ? '800ms' : '2000ms' // Fast in, slow linger out
    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)' // Standard organic curve
    
    const commonStyle = {
        transform: `scale(${scale})`,
        opacity: opacity,
        transition: `opacity ${duration} ${easing}, transform ${duration} ${easing}`,
        willChange: 'opacity, transform'
    }

    if (user.value) {
        // Logged In
        return {
            class: 'fixed inset-0 pointer-events-none', // Ensure fixed positioning
            style: {
                ...commonStyle,
                background: ui.loggedIn.style.backgroundHelper(themeStyles.value['--color-glow']),
                boxShadow: ui.loggedIn.style.boxShadowHelper(themeStyles.value['--color-glow']),
                filter: ui.loggedIn.style.filter,
                animation: ui.loggedIn.style.animation, // Pulse persists while visible
                zIndex: ui.loggedIn.style.zIndex
            }
        }
    } else {
        // Logged Out
        return {
            class: 'fixed inset-0 pointer-events-none',
            style: {
                ...commonStyle,
                background: ui.loggedOut.style.backgroundHelper(),
                boxShadow: ui.loggedOut.style.boxShadowHelper(),
                filter: ui.loggedOut.style.filter,
                animation: ui.loggedOut.style.animation,
                zIndex: ui.loggedOut.style.zIndex
            }
        }
    }
})

watch(loading, (newLoading) => {
  if (!newLoading) {
    // Post-load redirect check
    if (route.path === '/feed' && !user.value) {
      router.push('/login')
    }
    if (route.path === '/login' && user.value) {
      router.push('/feed')
    }
    // Also trigger glow on initial load completion? "logs in or out"
    // Let's trigger it once on load so they see *something* happens
    triggerGlow()
  }
})
</script>

<style>
@keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
}
</style>

