<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Main Header -->
    <header class="p-6 text-center border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <h1 class="font-serif text-3xl font-bold text-text">THE HUB</h1>
        <p v-if="currentView === 'dashboard'" class="text-xs text-muted tracking-[0.2em] mt-1 uppercase">Welcome Home</p>
        <button 
            v-else
            @click="currentView = 'dashboard'"
            class="text-xs text-muted hover:text-primary tracking-[0.2em] mt-1 uppercase flex items-center justify-center gap-2 mx-auto transition"
        >
            <ArrowLeft class="w-3 h-3" />
            Back to Dashboard
        </button>
    </header>

    <!-- DASHBOARD VIEW -->
    <div v-if="currentView === 'dashboard'" class="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
        
        <!-- Greeting -->
        <div class="mb-10 text-center space-y-2">
            <div class="inline-block p-1 rounded-full bg-gradient-to-tr from-primary to-secondary mb-4">
                <div class="bg-background rounded-full p-1">
                     <img v-if="user?.photoURL" :src="user.photoURL" class="w-16 h-16 rounded-full object-cover" />
                     <div v-else class="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                         <span class="text-2xl">👋</span>
                     </div>
                </div>
            </div>
            <h2 class="text-2xl font-bold text-text">Welcome back, {{ user?.displayName?.split(' ')[0] || 'Member' }}</h2>
            <p class="text-muted text-sm">Where would you like to go?</p>
        </div>

        <!-- Room Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <button 
                v-for="room in rooms" 
                :key="room.id"
                @click="enterRoom(room.id)"
                class="group relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-auto md:h-64 border border-border bg-surface text-left p-6 flex flex-col justify-end transition hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
            >
                <!-- Icon Bg -->
                <component 
                    :is="room.icon" 
                    class="absolute -right-4 -top-4 w-32 h-32 text-muted/5 -rotate-12 transition group-hover:text-primary/10 group-hover:rotate-0" 
                />
                
                <div class="relative z-10 space-y-2">
                    <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-2 group-hover:border-primary/50 transition">
                        <component :is="room.icon" class="w-5 h-5 text-text group-hover:text-primary transition" />
                    </div>
                    <h3 class="font-serif text-xl font-bold text-text">{{ room.label }}</h3>
                    <p class="text-xs text-muted leading-relaxed">{{ room.description }}</p>
                </div>
            </button>
        </div>

        <!-- Latest Drop Teaser -->
        <div v-if="latestPost" class="max-w-xl mx-auto">
            <div class="flex items-center gap-4 mb-4">
                <div class="h-px flex-1 bg-border"></div>
                <span class="text-xs font-bold uppercase text-muted tracking-widest">Latest Drop</span>
                <div class="h-px flex-1 bg-border"></div>
            </div>

            <button @click="enterRoomForPost(latestPost)" class="w-full bg-surface border border-border rounded-2xl p-4 flex gap-4 items-center hover:bg-surface/80 hover:border-text/20 transition text-left group">
                <div class="w-16 h-16 rounded-lg bg-black flex-shrink-0 overflow-hidden relative">
                    <img 
                        v-if="['image', 'video'].includes(latestPost.type)" 
                        :src="latestPost.mediaUrl || latestPost.imageUrl" 
                        class="w-full h-full object-cover opacity-80"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-900">
                        <component :is="getIconForType(latestPost.type)" class="w-6 h-6 text-muted" />
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{{ latestPost.type }}</span>
                        <span class="text-[10px] text-muted">{{ formatDate(latestPost.createdAt) }}</span>
                    </div>
                    <p class="text-sm font-medium text-text line-clamp-1 group-hover:text-primary transition">{{ latestPost.caption || 'New Update' }}</p>
                </div>
                <div class="ml-auto">
                    <ArrowRight class="w-5 h-5 text-muted group-hover:text-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition" />
                </div>
            </button>
        </div>
    </div>

    <!-- ROOM VIEW -->
    <div v-else>
        <!-- Rooms Navigation (Tabs) -->
        <div class="sticky top-[89px] z-30 bg-background/95 backdrop-blur border-b border-border">
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
    </div>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-6 pb-6 pt-3 md:pb-3 flex justify-around items-center z-50">
        <button @click="handleBack" class="flex flex-col items-center gap-1 text-muted hover:text-text transition group">
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
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore'
import { BookOpen, Image as ImageIcon, Mic, Loader, Lock, ArrowLeft, ArrowRight } from 'lucide-vue-next'

const { $db } = useNuxtApp()
const { user, isSubscriber } = useAuth()
const router = useRouter()

// View State
const currentView = ref('dashboard') // 'dashboard' | 'room'

// Room Config
const rooms = [
    { 
        id: 'text', 
        label: 'The Journal', 
        icon: BookOpen, 
        description: 'Personal thoughts, stories, and exclusive written entries.' 
    },
    { 
        id: 'media', 
        label: 'The Gallery', 
        icon: ImageIcon,
        description: 'A visual archive of photos, videos, and behind-the-scenes moments.'
    },
    { 
        id: 'audio', 
        label: 'The Sessions', 
        icon: Mic,
        description: 'Intimate audio recordings, voice notes, and conversations.'
    }
]
const activeRoom = ref('text')
const loading = ref(false)
const posts = ref([])
const latestPost = ref(null)

// Navigation Controllers
const enterRoom = (roomId) => {
    activeRoom.value = roomId
    currentView.value = 'room'
}

const handleBack = () => {
    if (currentView.value === 'room') {
        currentView.value = 'dashboard'
    } else {
        router.push('/feed')
    }
}

const enterRoomForPost = (post) => {
    // Map post type to room
    if (post.type === 'text') activeRoom.value = 'text'
    else if (post.type === 'audio') activeRoom.value = 'audio'
    else activeRoom.value = 'media'
    
    currentView.value = 'room'
}

const getIconForType = (type) => {
    if (type === 'text') return BookOpen
    if (type === 'audio') return Mic
    return ImageIcon
}

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

const fetchLatestPost = async () => {
    try {
        const q = query(
            collection($db, 'posts'), 
            orderBy('createdAt', 'desc'),
            limit(1)
        )
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
            latestPost.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        }
    } catch (e) {
        console.error("Error fetching latest post:", e)
    }
}

// Watch activeRoom to refetch ONLY if we are in room view
watch([activeRoom, currentView], ([newRoom, newView]) => {
    if (newView === 'room') {
        fetchRoomContent()
    }
})

onMounted(() => {
    fetchLatestPost()
    // Pre-fetch defaults if needed, but maybe wait for interaction
})

const canView = (post) => {
    if (post.isFree) return true
    if (isSubscriber.value) return true
    if (user.value && (post.userId === user.value.uid)) return true // Author
    return false
}

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const handleSubscribe = async () => {
    // Reuse subscribe logic (import or redirect)
    router.push('/feed') // Feed has the CTA
}
</script>

<style scoped>
/* Scoped styles helper for audio elements if needed */
audio {
    height: 30px;
}
</style>
