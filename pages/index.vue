<template>
  <div class="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-background to-surface text-text">
    
    <!-- Hero Section -->
    <div class="w-full max-w-2xl text-center mt-12 mb-16 space-y-6">
        <div class="relative inline-block mb-4">
           <!-- Placeholder for a user/hero avatar or logo if needed, using text for now or config image if available -->
           <div class="w-24 h-24 mx-auto bg-primary rounded-full blur-[40px] opacity-40 absolute top-0 left-1/2 -translate-x-1/2"></div>
           <h1 class="relative text-5xl md:text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
               <span class="cursor-help relative group" @mouseenter="setRandomMessage">
                   {{ config.meta.name }}
                   <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[280px] md:max-w-md px-5 py-3 bg-zinc-900/95 backdrop-blur text-white text-base font-medium rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-2xl shadow-black/20 scale-95 group-hover:scale-100 transform origin-bottom z-50 text-center leading-relaxed tracking-wide border border-white/10">
                        {{ currentHoverMessage }}
                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900/95"></div>
                    </span>
               </span>
           </h1>
        </div>
        
        <p class="text-xl md:text-2xl font-medium text-muted">
            Welcome to the <span class="text-text font-bold">Inner Circle</span>.
        </p>
        <p class="text-base text-muted/80 max-w-lg mx-auto leading-relaxed">
            The official community for exclusive content, behind-the-scenes access, and direct connection. This is more than a fanbase—it's a family.
        </p>

        <!-- Primary CTA -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <template v-if="user">
                 <NuxtLink 
                    to="/feed"
                    class="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                >
                    🚀 Enter The Circle
                </NuxtLink>
            </template>
            <template v-else>
                 <NuxtLink 
                    to="/register"
                    class="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                >
                    Join the Family
                </NuxtLink>
                 <NuxtLink 
                    to="/login"
                    class="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text font-bold rounded-full hover:bg-white/5 transition-all"
                >
                    Member Login
                </NuxtLink>
            </template>
        </div>
    </div>


    <!-- Content & Community Preview -->
    <div class="w-full max-w-4xl space-y-12">
        
        <!-- Public Feed / Highlights -->
        <div v-if="publicPosts.length > 0">
            <div class="flex items-center justify-between mb-8 px-4">
                <h3 class="text-sm font-bold text-muted uppercase tracking-widest">Community Highlights</h3>
                 <span class="text-xs text-muted/50">Latest Updates</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <article v-for="post in publicPosts" :key="post.id" class="group bg-surface/50 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden hover:shadow-xl">
                    
                    <!-- Media Preview -->
                    <div class="aspect-video w-full bg-black relative overflow-hidden">
                        <template v-if="post.type !== 'text'">
                            <SecureResource v-if="post.storageKey" :storageKey="post.storageKey" :postId="post.id">
                                <template #default="{ src, loading }">
                                    
                                    <!-- Image -->
                                    <div v-if="post.type === 'image' || !post.type" class="w-full h-full">
                                        <div v-if="loading" class="w-full h-full bg-surface animate-pulse"></div>
                                        <img 
                                            v-else
                                            :src="src" 
                                            loading="lazy"
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>

                                    <!-- Video -->
                                    <div v-else-if="post.type === 'video'" class="w-full h-full bg-black">
                                         <div v-if="loading" class="w-full h-full flex items-center justify-center text-muted">Loading...</div>
                                         <video 
                                            v-else
                                            :src="src" 
                                            controls
                                            class="w-full h-full object-cover"
                                            :poster="post.thumbnailUrl"
                                        ></video>
                                    </div>
                                    
                                    <!-- Audio -->
                                    <div v-else-if="post.type === 'audio'" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
                                         <div v-if="loading" class="text-white text-xs">Loading...</div>
                                         <div v-else class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            🎤
                                        </div>
                                         <!-- Optional: Play button or similar -->
                                    </div>

                                </template>
                            </SecureResource>

                            <template v-else>
                                <img 
                                    v-if="post.type === 'image' || !post.type"
                                    :src="post.mediaUrl || post.imageUrl" 
                                    loading="lazy"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div v-else-if="post.type === 'video'" class="w-full h-full bg-black">
                                    <iframe 
                                        v-if="post.mediaUrl && (post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be'))"
                                        :src="getEmbedUrl(post.mediaUrl)" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen
                                        class="w-full h-full"
                                    ></iframe>
                                    <video 
                                        v-else
                                        :src="post.mediaUrl" 
                                        controls
                                        class="w-full h-full object-cover"
                                        :poster="post.thumbnailUrl"
                                    ></video>
                                </div>
                                <div v-else-if="post.type === 'audio'" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
                                    <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        🎤
                                    </div>
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="w-full h-full flex items-center justify-center p-6 bg-surface text-center">
                                <p class="text-sm text-muted italic line-clamp-3">"{{ post.caption }}"</p>
                            </div>
                        </template>
                    </div>

                    <!-- Mini Content -->
                    <div class="p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">N</div>
                            <span class="text-xs font-bold text-text">Nicole</span>
                            <span class="text-[10px] text-muted ml-auto">{{ formatDate(post.createdAt) }}</span>
                        </div>
                        <p v-if="post.caption" class="text-sm text-text/80 line-clamp-2">{{ post.caption }}</p>
                    </div>

                </article>
            </div>

             <div class="text-center mt-10">
                 <NuxtLink to="/feed" class="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition">
                     See All Posts <span aria-hidden="true">&rarr;</span>
                 </NuxtLink>
            </div>
        </div>

        <!-- Social Footer Links -->
        <div class="border-t border-border pt-12 mt-12">
            <div class="flex flex-wrap justify-center gap-4 mb-8">
                 <a 
                    v-for="link in socialLinks"
                    :key="link.name"
                    :href="link.url" 
                    target="_blank"
                    :class="['flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-white/5 border border-transparent hover:border-border transition text-sm font-medium text-muted hover:text-text', link.color]"
                >
                    <img v-if="typeof link.icon === 'string'" :src="link.icon" class="w-4 h-4 object-contain opacity-70" alt="" />
                    <component v-else :is="link.icon" class="w-4 h-4 opacity-70" />
                    {{ link.name }}
                </a>
                 <NuxtLink 
                    to="/media-kit"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-white/5 border border-transparent hover:border-border transition text-sm font-medium text-muted hover:text-text"
                >
                    ✨ Media Kit
                </NuxtLink>
            </div>
            
            <footer class="text-center text-xs text-muted/40 pb-8">
                <p>&copy; {{ new Date().getFullYear() }} {{ config.meta.copyright }}</p>
                <div v-if="isAdmin" class="mt-4">
                     <NuxtLink to="/admin" class="text-red-500 hover:text-red-400 font-bold">Admin Dashboard</NuxtLink>
                </div>
            </footer>
        </div>

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

// Hover Messages
const currentHoverMessage = ref('Have a beautiful day!')
const hoverMessages = config.hoverMessages || [
    "Have a beautiful day!",
    "You look great today!"
]
const setRandomMessage = () => {
    const next = hoverMessages[Math.floor(Math.random() * hoverMessages.length)]
    if (next === currentHoverMessage.value) setRandomMessage() // Retry if same
    else currentHoverMessage.value = next
}

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

// Optimize: Reuse formatter instance to avoid creation overhead in loops
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return dateFormatter.format(date)
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
