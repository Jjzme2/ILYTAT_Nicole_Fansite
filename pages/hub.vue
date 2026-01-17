<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Header -->
    <header class="p-6 text-center border-b border-border">
        <h1 class="font-serif text-3xl font-bold text-text">THE HUB</h1>
        <p class="text-xs text-muted tracking-[0.2em] mt-1 uppercase">Choose a Room</p>
    </header>

    <!-- Rooms Navigation (Tabs) -->
    <div class="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div class="flex p-2 gap-2 overflow-x-auto max-w-4xl mx-auto">
            <button 
                v-for="room in rooms" 
                :key="room.id"
                @click="activeRoom = room.id"
                :class="[
                    'flex-1 min-w-[100px] py-3 px-4 rounded-xl flex flex-col items-center gap-2 transition border-2',
                    activeRoom === room.id ? 'bg-surface border-primary' : 'border-transparent hover:bg-surface/50'
                ]"
            >
                <component :is="room.icon" :class="['w-6 h-6', activeRoom === room.id ? 'text-primary' : 'text-muted']" />
                <span :class="['text-xs font-bold uppercase tracking-wider', activeRoom === room.id ? 'text-text' : 'text-muted']">{{ room.label }}</span>
            </button>
        </div>
    </div>

    <!-- Main Content Area -->
    <main class="max-w-4xl mx-auto p-4 md:p-6 min-h-[60vh]">
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
             <div class="inline-block animate-spin text-primary mb-4"><Loader class="w-8 h-8" /></div>
             <p class="text-muted blink">Entering the room...</p>
        </div>

        <!-- content -->
        <div v-else>
            
            <!-- ROOM: THE JOURNAL (Text) -->
            <div v-if="activeRoom === 'text'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-2xl mx-auto">
                 <div v-if="posts.length === 0" class="text-center py-20 text-muted">
                    <BookOpen class="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>The pages are empty.</p>
                </div>
                <article v-for="post in posts" :key="post.id" class="bg-surface p-8 rounded-sm shadow-sm border-l-4 border-primary relative">
                     <!-- Paper Texture Overlay -->
                     <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat space-y-6" style="background-image: linear-gradient(#000 1px, transparent 1px); background-size: 100% 2rem;"></div>
                     
                     <div class="relative z-10">
                        <div class="flex justify-between items-baseline mb-6 border-b border-border pb-4">
                            <span class="font-serif italic text-lg text-primary">Entry #{{ post.id.slice(-4) }}</span>
                            <span class="text-xs font-bold text-muted uppercase tracking-widest">{{ formatDate(post.createdAt) }}</span>
                        </div>
                        
                        <div v-if="canView(post)" class="prose prose-invert prose-lg max-w-none">
                            <p class="whitespace-pre-wrap font-serif leading-loose text-text">{{ post.caption }}</p>
                        </div>
                         
                         <!-- Locked Overlay -->
                        <div v-else class="text-center py-10 px-4 bg-background/50 rounded-lg border border-dashed border-muted/30">
                            <Lock class="w-8 h-8 mx-auto mb-3 text-muted" />
                            <p class="font-bold mb-2">Private Entry</p>
                            <button @click="handleSubscribe" class="text-xs bg-text text-background px-4 py-2 rounded-full font-bold hover:opacity-80 transition">Subscribe to Read</button>
                        </div>
                     </div>
                </article>
            </div>

            <!-- ROOM: THE GALLERY (Pictures & Videos) -->
            <div v-if="activeRoom === 'media'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div v-if="posts.length === 0" class="text-center py-20 text-muted">
                    <ImageIcon class="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>The gallery is empty.</p>
                </div>
                <!-- Masonry-ish Grid -->
                <div class="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    <div v-for="post in posts" :key="post.id" class="break-inside-avoid relative group rounded-2xl overflow-hidden bg-black shadow-lg">
                        
                         <!-- Specific Aspect Ratios could be handled here if we had metadata, for now auto -->
                         <div v-if="canView(post)">
                             <video 
                                v-if="post.type === 'video'"
                                :src="post.mediaUrl" 
                                class="w-full object-cover" 
                                controls
                            ></video>
                            <img 
                                v-else 
                                :src="post.mediaUrl || post.imageUrl" 
                                class="w-full object-cover transition duration-700 group-hover:scale-105" 
                                loading="lazy"
                            >
                         </div>
                         
                         <!-- Locked Overlay -->
                         <div v-else class="aspect-[3/4] flex flex-col items-center justify-center bg-surface p-6 text-center">
                            <Lock class="w-8 h-8 text-muted mb-2" />
                            <p class="text-xs font-bold uppercase tracking-widest text-muted">Locked Media</p>
                         </div>

                         <!-- Hover Info -->
                         <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition duration-300 flex justify-between items-end">
                             <p class="text-white text-xs line-clamp-2 text-left">{{ post.caption }}</p>
                             <span class="text-[10px] text-white/50 font-mono flex-shrink-0 ml-2">{{ formatDate(post.createdAt) }}</span>
                         </div>

                         <!-- Type Badge -->
                         <div class="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-bold uppercase text-white">
                             {{ post.type }}
                         </div>
                    </div>
                </div>
            </div>

            <!-- ROOM: THE SESSIONS (Audio) -->
            <div v-if="activeRoom === 'audio'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-4">
                 <div v-if="posts.length === 0" class="text-center py-20 text-muted">
                    <Mic class="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No sessions recorded.</p>
                </div>
                
                <div v-for="post in posts" :key="post.id" class="bg-surface rounded-2xl p-4 flex gap-4 items-center border border-border hover:border-primary transition group">
                    <!-- Art -->
                    <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-primary/20 transition">
                         <div v-if="canView(post)" class="animate-pulse">
                            <div class="flex gap-1 items-end h-6">
                                <div class="w-1 bg-primary h-2 animate-[bounce_1s_infinite]"></div>
                                <div class="w-1 bg-primary h-4 animate-[bounce_1.2s_infinite]"></div>
                                <div class="w-1 bg-primary h-3 animate-[bounce_0.8s_infinite]"></div>
                            </div>
                         </div>
                         <Lock v-else class="text-muted w-6 h-6" />
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                         <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-lg text-text truncate">Session {{ formatDate(post.createdAt) }}</h3>
                            <span class="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted">AUDIO</span>
                         </div>
                         <p class="text-sm text-muted line-clamp-1 mb-2">{{ post.caption || 'No description' }}</p>
                         
                         <!-- Player -->
                         <div v-if="canView(post)" class="w-full">
                             <audio :src="post.mediaUrl" controls class="w-full h-8 px-0"></audio>
                         </div>
                         <button v-else @click="handleSubscribe" class="text-xs font-bold text-primary hover:underline">
                             Subscribe to Listen
                         </button>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- Bottom Nav (Reuse existing or create specific) -->
    <nav class="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-6 pb-6 pt-3 md:pb-3 flex justify-around items-center z-50">
        <button @click="router.push('/feed')" class="flex flex-col items-center gap-1 text-muted hover:text-text transition group">
            <ArrowLeft class="w-6 h-6 group-hover:-translate-x-1 transition" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Back</span>
        </button>

         <div class="text-xs font-serif italic text-muted">
            The Hub
        </div>

         <div class="w-6"></div> <!-- Spacer -->
    </nav>

  </div>
</template>

<script setup>
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { BookOpen, Image as ImageIcon, Mic, Loader, Lock, ArrowLeft } from 'lucide-vue-next'

const { $db } = useNuxtApp()
const { user, isSubscriber } = useAuth()
const router = useRouter()

// Room Config
const rooms = [
    { id: 'text', label: 'The Journal', icon: BookOpen },
    { id: 'media', label: 'The Gallery', icon: ImageIcon },
    { id: 'audio', label: 'The Sessions', icon: Mic }
]
const activeRoom = ref('text')
const loading = ref(false)
const posts = ref([])

// Fetch Posts based on Room
const fetchRoomContent = async () => {
    loading.value = true
    posts.value = [] // clear old
    
    try {
        let constraints = [orderBy('createdAt', 'desc')]
        
        // Type Filtering
        if (activeRoom.value === 'text') {
            constraints.unshift(where('type', '==', 'text'))
        } else if (activeRoom.value === 'audio') {
            constraints.unshift(where('type', '==', 'audio'))
        } else if (activeRoom.value === 'media') {
            // Media = video OR image. Firestore 'in' query supports up to 10
            constraints.unshift(where('type', 'in', ['image', 'video']))
        }

        const q = query(collection($db, 'posts'), ...constraints)
        const snapshot = await getDocs(q)
        posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Error fetching room content:", e)
    } finally {
        loading.value = false
    }
}

// Watch activeRoom to refetch
watch(activeRoom, () => {
    fetchRoomContent()
})

onMounted(() => {
    fetchRoomContent()
})

const canView = (post) => {
    if (post.isFree) return true
    if (isSubscriber.value) return true
    if (user.value && (post.userId === user.value.uid)) return true // Author
    return false
}

// Optimize: Reuse formatter instance to avoid creation overhead in loops
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return dateFormatter.format(date)
}

const handleSubscribe = async () => {
    // Reuse subscribe logic (import or redirect)
    // For now simple redirect to feed or showing subscribe modal if we had one
    router.push('/feed') // Feed has the CTA
}
</script>

<style scoped>
/* Scoped styles helper for audio elements if needed */
audio {
    height: 30px;
}
</style>
