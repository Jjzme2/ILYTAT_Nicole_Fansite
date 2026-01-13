<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md space-y-8 text-center">
        <!-- Header -->
        <div class="mb-10">
            <h1 class="text-3xl font-bold tracking-tight mb-2">{{ config.meta.name }}</h1>
            <p class="text-muted uppercase tracking-widest text-xs">{{ config.meta.tagline }}</p>
        </div>

        <!-- Links -->
        <div class="space-y-4">
            <NuxtLink 
                v-if="isAdmin"
                to="/admin"
                class="block w-full py-4 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-[1.02] transition font-bold shadow-lg"
            >
                ⚡ Admin Dashboard
            </NuxtLink>

            <a 
                v-for="link in socialLinks"
                :key="link.name"
                :href="link.url" 
                target="_blank"
                :class="['block w-full py-4 px-6 bg-surface border border-border rounded-xl hover:scale-[1.02] transition font-medium text-text shadow-sm flex items-center justify-center gap-3', link.color]"
            >
                <img v-if="typeof link.icon === 'string'" :src="link.icon" class="w-6 h-6 object-contain" alt="" />
                <component v-else :is="link.icon" class="w-5 h-5" />
                {{ link.name }}
            </a>

            <NuxtLink 
                to="/media-kit"
                class="block w-full py-4 px-6 bg-surface border border-border rounded-xl hover:border-text hover:scale-[1.02] transition font-medium text-text shadow-sm"
            >
                ✨ Media Kit
            </NuxtLink>

            <!-- Logged In State -->
            <div v-if="user" class="space-y-4">
                <div class="p-4 bg-surface border border-border rounded-xl">
                    <p class="text-sm text-muted mb-1">Welcome back,</p>
                    <p class="font-bold text-text">{{ user.email }}</p>
                </div>

                <NuxtLink 
                    to="/feed"
                    class="block w-full py-4 px-6 bg-primary text-white rounded-xl hover:opacity-90 hover:scale-[1.02] transition font-bold shadow-lg"
                >
                    🚀 Enter The Circle
                </NuxtLink>
            </div>

            <!-- Guest State -->
            <NuxtLink 
                v-else
                to="/login"
                class="block w-full py-4 px-6 bg-text text-background rounded-xl hover:opacity-90 hover:scale-[1.02] transition font-bold shadow-lg"
            >
                🔓 Member Login
            </NuxtLink>
        </div>

        <!-- Public Teaser Feed -->
        <div v-if="publicPosts.length > 0" class="mt-12 w-full text-left">
            <h3 class="text-xs font-bold text-muted uppercase tracking-widest mb-6 text-center">Latest Public Updates</h3>
            
            <div class="space-y-6">
                <article v-for="post in publicPosts" :key="post.id" class="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    
                    <!-- Media -->
                    <div v-if="post.type !== 'text'" class="aspect-video w-full bg-black relative group">
                         <div v-if="post.type === 'video'" class="w-full h-full">
                             <!-- YouTube Embed -->
                             <iframe 
                                v-if="post.mediaUrl && (post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be'))"
                                :src="getEmbedUrl(post.mediaUrl)" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                                class="w-full h-full"
                            ></iframe>
                            <!-- Native Video -->
                            <video 
                                v-else
                                :src="post.mediaUrl || post.imageUrl" 
                                controls
                                class="w-full h-full object-contain"
                            ></video>
                        </div>
                        
                        <div v-else-if="post.type === 'audio'" class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                             <audio :src="post.mediaUrl" controls class="w-full max-w-md"></audio>
                        </div>

                        <img 
                            v-else
                            :src="post.mediaUrl || post.imageUrl" 
                            loading="lazy"
                            class="object-contain w-full h-full"
                        />
                    </div>

                    <!-- Text / Caption -->
                    <div class="p-5">
                         <div class="text-text text-sm mb-2" v-if="post.caption">
                            <span class="font-bold mr-1">Nicole Christine</span> {{ post.caption }}
                        </div>
                        <p class="text-[10px] text-muted font-medium uppercase tracking-wider">
                            {{ formatDate(post.createdAt) }}
                        </p>
                    </div>

                </article>
            </div>
             <div class="text-center mt-8">
                 <NuxtLink to="/feed" class="text-sm font-bold border-b border-text pb-0.5 hover:text-muted transition">View All Posts</NuxtLink>
            </div>
        </div>


        <!-- Footer -->
        <footer class="pt-10 text-xs text-muted">
            <p>&copy; {{ new Date().getFullYear() }} {{ config.meta.copyright }}</p>
            <p class="mt-2 opacity-75">
                Made with the help of <a href="https://deepmind.google/technologies/antigravity/" target="_blank" class="hover:underline hover:text-text">Google Antigravity</a>.
            </p>
        </footer>
    </div>
  </div>
</template>

<script setup>
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'

const config = useAppConfig()
const { isAdmin, user } = useAuth()
const { $db } = useNuxtApp()
const { socialLinks } = useSocials()

definePageMeta({ layout: false })

const publicPosts = ref([])

onMounted(async () => {
    try {
        const q = query(
            collection($db, 'posts'), 
            orderBy('createdAt', 'desc'),
            limit(50) // Fetch more to filter locally
        )
        const snapshot = await getDocs(q)
        // Filter for isFree == true locally to avoid missing index error
        publicPosts.value = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(post => post.isFree === true)
            .slice(0, 10)
    } catch (e) {
        console.error('Error fetching public posts:', e)
    }
})

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const getEmbedUrl = (url) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch')) {
        return url.replace('watch?v=', 'embed/')
    } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]
        return `https://www.youtube.com/embed/${id}`
    }
    return url
}
</script>
