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
                                <img 
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

                <!-- ROOM: THE THEATER (Videos) -->
                <div v-if="activeRoom === 'theater'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-12">
                     <div v-if="posts.length === 0" class="text-center py-20 text-muted">
                        <Clapperboard class="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No screenings scheduled.</p>
                    </div>

                    <div v-for="post in posts" :key="post.id" class="relative group rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5">
                        
                         <div v-if="canView(post)">
                             <!-- Big Video Player -->
                             <div class="aspect-video w-full bg-black relative">
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
                                    class="w-full h-full object-contain" 
                                    controls
                                    :poster="post.thumbnailUrl"
                                ></video>
                             </div>
                             
                             <!-- Cinematic Info Strip -->
                             <div class="p-6 bg-gradient-to-b from-zinc-900 to-black text-center md:text-left md:flex md:justify-between md:items-center gap-4">
                                 <div>
                                     <h3 class="text-2xl font-black text-white mb-2">{{ post.caption || 'Untitled Feature' }}</h3>
                                     <p class="text-xs text-zinc-500 font-mono uppercase tracking-widest">Released {{ formatDate(post.createdAt) }}</p>
                                 </div>
                                 <div class="mt-4 md:mt-0 flex gap-2 justify-center">
                                     <!-- Actions could go here (Like, Share) -->
                                 </div>
                             </div>
                         </div>
                         
                         <!-- Locked Overlay -->
                         <div v-else class="aspect-video flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
                            <Lock class="w-12 h-12 text-muted mb-4" />
                            <h3 class="text-xl font-bold text-white mb-2">Subscriber Exclusive</h3>
                            <p class="text-muted text-sm mb-6">Join the Inner Circle to watch this feature.</p>
                            <button @click="handleSubscribe" class="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:scale-105 transition">Subscribe</button>
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

                <!-- ROOM: THE RANDOM (Mixed) -->
                <div v-if="activeRoom === 'random'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div v-if="posts.length === 0" class="text-center py-20 text-muted">
                        <Sparkles class="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No random drops yet.</p>
                    </div>
                    
                    <div class="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        <div v-for="post in posts" :key="post.id" class="break-inside-avoid relative group rounded-2xl overflow-hidden bg-surface shadow-lg border border-border">
                            
                             <!-- Render based on FORMAT -->
                             <div v-if="canView(post)">
                                 <!-- Image/Video -->
                                 <div v-if="['image', 'video'].includes(post.format) || (!post.format && ['image', 'video'].includes(post.type))">
                                     <video 
                                        v-if="post.format === 'video' || post.type === 'video'"
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
                                 
                                 <!-- Audio -->
                                 <div v-else-if="post.format === 'audio' || (!post.format && post.type === 'audio')" class="p-4 bg-gradient-to-br from-gray-900 to-black">
                                     <div class="flex items-center gap-3 mb-2">
                                         <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                             <Mic class="w-5 h-5" />
                                         </div>
                                         <span class="text-xs font-bold text-muted">Audio Drop</span>
                                     </div>
                                     <audio :src="post.mediaUrl" controls class="w-full h-8 px-0"></audio>
                                 </div>
                                 
                                 <!-- Text -->
                                 <div v-else class="p-6">
                                     <Quote class="w-8 h-8 text-primary/20 mb-2" />
                                     <p class="font-serif text-lg leading-relaxed">{{ post.caption }}</p>
                                 </div>
                             </div>
                             
                             <!-- Locked -->
                             <div v-else class="aspect-[3/4] flex flex-col items-center justify-center bg-surface p-6 text-center">
                                <Lock class="w-8 h-8 text-muted mb-2" />
                                <p class="text-xs font-bold uppercase tracking-widest text-muted">Locked Random</p>
                             </div>

                             <!-- Caption for Media (Text already showed it) -->
                             <div v-if="canView(post) && (post.format === 'image' || post.format === 'video' || (!post.format && ['image', 'video'].includes(post.type)))" class="p-3 bg-surface border-t border-border">
                                 <p class="text-sm line-clamp-2">{{ post.caption }}</p>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- ROOM: THE GAMES -->
                <div v-if="activeRoom === 'games'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div class="flex justify-center gap-2 mb-8 bg-surface inline-flex flex-wrap mx-auto p-1 rounded-xl border border-border">
                        <button 
                            v-for="game in posts"
                            :key="game.id"
                            @click="activeGame = game.id" 
                            :class="['px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2', activeGame === game.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-text']"
                        >
                             <!-- Simple Icon Map -->
                            <component v-if="game.icon === 'Gamepad2'" :is="Gamepad2" class="w-4 h-4" />
                            <component v-else-if="game.icon === 'MousePointerClick'" :is="MousePointerClick" class="w-4 h-4" />
                            <component v-else-if="game.icon === 'X'" :is="X" class="w-4 h-4" />
                            <component v-else-if="game.icon === 'Brain'" :is="Brain" class="w-4 h-4" />
                            <component v-else-if="game.icon === 'Grid'" :is="Grid" class="w-4 h-4" />
                            <component v-else :is="Gamepad2" class="w-4 h-4" />
                            {{ game.title }}
                        </button>
                    </div>

                    <div class="bg-surface border border-border rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
                        <SnakeGame v-if="activeGame === 'snake'" />
                        <ClickerGame v-if="activeGame === 'clicker'" />
                        <TicTacToe v-if="activeGame === 'tictactoe'" />
                        <MemoryGame v-if="activeGame === 'memory'" />
                        <SudokuGame v-if="activeGame === 'sudoku'" />
                        <!-- Fallback for generic games from API in future -->
                        <div v-if="!['snake', 'clicker', 'tictactoe', 'memory', 'sudoku'].includes(activeGame)" class="text-center py-20">
                            <p class="text-muted">Game loading...</p>
                        </div>
                    </div>
                </div>

                <!-- ROOM: THE LAMES -->
                <div v-if="activeRoom === 'lames'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                    <div class="space-y-12 max-w-2xl mx-auto">
                        <div v-for="lame in posts" :key="lame.id" class="text-left font-mono">
                            <pre v-if="lame.type === 'ascii'" class="text-xs md:text-sm text-primary/80 leading-none whitespace-pre overflow-x-auto">{{ lame.content }}</pre>
                            <div v-else class="bg-surface p-6 rounded-none border-l-2 border-primary shadow-sm">
                                <p class="text-lg text-text">{{ lame.content }}</p>
                                <span class="text-xs text-muted uppercase mt-2 block">// {{ lame.caption }}</span>
                            </div>
                        </div>
                         <p class="mt-20 text-sm italic text-muted">"Why are you still here?" - The Devs</p>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-6 pb-6 pt-3 md:pb-3 flex justify-around items-center z-50">
        <NuxtLink to="/feed" class="flex flex-col items-center gap-1 text-muted hover:text-text transition group">
            <LayoutGrid class="w-6 h-6 group-hover:scale-110 transition" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Feed</span>
        </NuxtLink>

        <button class="flex flex-col items-center gap-1 text-text transition group">
            <div class="bg-primary text-white p-3 rounded-full -mt-10 shadow-xl border-4 border-background group-hover:scale-105 transition">
                <Zap class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider">Hub</span>
        </button>

        <NuxtLink to="/profile" class="flex flex-col items-center gap-1 text-muted hover:text-text transition group">
            <User class="w-6 h-6 group-hover:scale-110 transition" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </NuxtLink>
    </nav>

  </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore'
import { BookOpen, Mic, ImageIcon, Sparkles, Ghost, Lock, Gamepad2, MousePointerClick, ArrowLeft, ArrowRight, Quote, Clapperboard, MonitorPlay, X, Brain, Grid, LayoutGrid, Zap, User } from 'lucide-vue-next'
import SnakeGame from '~/components/games/SnakeGame.vue'
import ClickerGame from '~/components/games/ClickerGame.vue'
import TicTacToe from '~/components/games/TicTacToe.vue'
import MemoryGame from '~/components/games/MemoryGame.vue'
import SudokuGame from '~/components/games/SudokuGame.vue'

const { $db } = useNuxtApp()
const { user, isSubscriber } = useAuth()
const router = useRouter()

// View State
const currentView = ref('dashboard') // 'dashboard' | 'room'
const activeGame = ref('snake') // NEW: For arcade tabs

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
        id: 'theater',
        label: 'The Theater',
        icon: Clapperboard,
        description: 'Watch exclusive videos and films.'
    },
    { 
        id: 'audio', 
        label: 'The Sessions', 
        icon: Mic,
        description: 'Intimate audio recordings, voice notes, and conversations.'
    },
    { 
        id: 'random', 
        label: 'The Random', 
        icon: Sparkles,
        description: 'Random drops, experiments, and uncategorized gems.'
    },
    { 
        id: 'games', 
        label: 'The Games', 
        icon: Gamepad2,
        description: 'Kill some time. Set some records.'
    },
    { 
        id: 'lames', 
        label: 'The Lames', 
        icon: Ghost,
        description: 'We don\'t go here.'
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
    else if (post.type === 'random') activeRoom.value = 'random'
    else if (post.type === 'video') activeRoom.value = 'theater'
    else activeRoom.value = 'media'
    
    currentView.value = 'room'
}

const getIconForType = (type) => {
    if (type === 'text') return BookOpen
    if (type === 'audio') return Mic
    if (type === 'random') return Sparkles
    if (type === 'video') return Clapperboard
    return ImageIcon
}

// Fetch Posts based on Room
const fetchRoomContent = async () => {
    loading.value = true
    posts.value = [] // clear old
    
    try {
        console.log("Fetching content for:", activeRoom.value)
        if (activeRoom.value === 'lames') {
             const data = await $fetch('/api/lames')
             console.log("Lames data:", data)
             posts.value = data.lames || []
             loading.value = false
             return
        }

        if (activeRoom.value === 'games') {
             const data = await $fetch('/api/games')
             console.log("Games data:", data)
             posts.value = data.games || []
             loading.value = false
             return
        }

        // Initialize constraints with Sort
        // NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.
        // To make it robust without custom indexes for every combo, we fetch then sort/filter client-side in fallback
        
        let constraints = []

        // Type Filtering
        // We push the WHERE clause first
        if (activeRoom.value === 'text') {
            constraints.push(where('type', '==', 'text'))
        } else if (activeRoom.value === 'audio') {
            constraints.push(where('type', '==', 'audio'))
        } else if (activeRoom.value === 'random') {
            constraints.push(where('type', '==', 'random'))
        } else if (activeRoom.value === 'media') {
            constraints.push(where('type', '==', 'image')) // Filter for images only
        } else if (activeRoom.value === 'theater') {
            constraints.push(where('type', '==', 'video')) // Filter for videos only
        }
        
        // Add Sort
        constraints.push(orderBy('createdAt', 'desc'))

        const q = query(collection($db, 'posts'), ...constraints)
        const snapshot = await getDocs(q)
        posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Error fetching room content:", e)
        // Fallback: If index error, try fetching without sort (just for availability)
        if (e.code === 'failed-precondition') {
             try {
                let typeFilter = activeRoom.value
                if (activeRoom.value === 'media') typeFilter = 'image'
                if (activeRoom.value === 'theater') typeFilter = 'video'
                
                const qFallback = query(collection($db, 'posts'), where('type', '==', typeFilter))
                // Simple query
                const snap = await getDocs(qFallback)
                posts.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.createdAt - a.createdAt)
             } catch (err) {
                 console.error("Fallback failed:", err)
             }
        }
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

<style scoped>
/* Scoped styles helper for audio elements if needed */
audio {
    height: 30px;
}
</style>
