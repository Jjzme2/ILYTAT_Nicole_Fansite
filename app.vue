<template>
  <div class="min-h-screen bg-background text-text font-sans antialiased transition-colors duration-300">
    
    <!-- Loading Screen -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-background z-50">
         <LucideLoader class="w-10 h-10 animate-spin text-primary" />
    </div>

    <!-- Main App -->
    <div v-show="!loading" class="flex flex-col min-h-screen">
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
            }
        </component>
    </Head>
  </div>
</template>

<script setup>
import { Loader as LucideLoader } from 'lucide-vue-next'
const config = useAppConfig()
const { themeStyles, activeTheme } = useTheme()

const { socialLinks } = useSocials()

const { loading, user } = useAuth()
const router = useRouter()
const route = useRoute()

watch(loading, (newLoading) => {
  if (!newLoading) {
    // Post-load redirect check
    if (route.path === '/feed' && !user.value) {
      router.push('/login')
    }
    if (route.path === '/login' && user.value) {
      router.push('/feed')
    }
  }
})
</script>

