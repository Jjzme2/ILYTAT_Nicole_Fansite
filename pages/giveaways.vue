<template>
  <div class="min-h-screen bg-background text-text">
    <header class="py-12 text-center border-b border-border">
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">Exclusive Giveaways</h1>
        <p class="text-muted tracking-widest uppercase text-sm">Win limited edition merch & experiences</p>
    </header>

    <div class="container mx-auto px-4 py-12">
        
        <!-- Loading -->
        <div v-if="loading" class="text-center py-20 text-muted">
             <LucideLoader class="w-10 h-10 animate-spin mx-auto mb-4" />
             <p>Loading drops...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="campaigns.length === 0" class="text-center py-20 text-muted">
            <Gift class="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No active giveaways right now. Check back soon!</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div v-for="cam in campaigns" :key="cam.id" class="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg group">
                <!-- Image -->
                <div class="aspect-video bg-gray-100 relative overflow-hidden">
                    <img v-if="cam.image" :src="cam.image" class="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="">
                    <div v-else class="absolute inset-0 flex items-center justify-center text-muted">
                        <Gift class="w-12 h-12 opacity-20" />
                    </div>
                    
                    <!-- Status Badge -->
                    <div class="absolute top-4 right-4">
                        <span v-if="cam.activeRound?.status === 'active'" class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            ACTIVE NOW
                        </span>
                        <span v-else-if="cam.activeRound?.status === 'scheduled'" class="bg-black/50 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                            COMING SOON
                        </span>
                         <span v-else class="bg-gray-500/50 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                            ENDED
                        </span>
                    </div>
                </div>

                <!-- Info -->
                <div class="p-6">
                    <h2 class="text-2xl font-bold mb-2">{{ cam.title }}</h2>
                    <p class="text-muted text-sm mb-6 line-clamp-2">{{ cam.description }}</p>

                    <!-- Round Details -->
                    <div v-if="cam.activeRound" class="bg-background rounded-xl p-4 border border-border">
                        <div class="flex justify-between items-end mb-4">
                            <div>
                                <p class="text-[10px] uppercase font-bold text-muted mb-1">
                                    {{ cam.activeRound.status === 'active' ? 'Ends In' : 'Starts In' }}
                                </p>
                                <div class="text-xl font-mono font-bold text-text">
                                     <ClientOnly>
                                        {{ getTimeRemaining(cam.activeRound) }}
                                     </ClientOnly>
                                </div>
                            </div>
                            <!-- Enter Action -->
                             <button 
                                v-if="cam.activeRound.status === 'active'"
                                @click="enterGiveaway(cam)"
                                :disabled="cam.entering || cam.hasEntered"
                                class="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                {{ cam.hasEntered ? 'Entered' : (cam.entering ? '...' : 'Enter Now') }}
                             </button>
                             <button v-else disabled class="bg-surface border border-border text-muted px-6 py-2 rounded-lg font-bold text-sm">
                                {{ cam.activeRound.status === 'scheduled' ? 'On Waitlist' : 'Closed' }}
                             </button>
                        </div>
                    </div>
                     <div v-else class="p-4 text-center text-muted text-sm italic">
                        Next round TBD
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { Loader as LucideLoader, Gift } from 'lucide-vue-next'
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, where } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const loading = ref(true)
const campaigns = ref([])

// Fetch Campaigns and their latest Round
const fetchGiveaways = async () => {
    loading.value = true
    try {
        const q = query(collection($db, 'giveaways')) // Generic campaigns
        const snapshot = await getDocs(q)
        
        const results = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data()
            // Fetch Latest Round
            const rQ = query(collection($db, 'giveaways', doc.id, 'rounds'), orderBy('endTime', 'desc'), limit(1))
            const rSnap = await getDocs(rQ)
            const activeRound = !rSnap.empty ? { id: rSnap.docs[0].id, ...rSnap.docs[0].data() } : null

            // Determine Status Helper
            if (activeRound) {
                const now = new Date()
                const start = activeRound.activationTime?.toDate()
                const end = activeRound.endTime?.toDate()
                if (now < start) activeRound.status = 'scheduled'
                else if (now >= start && now <= end) activeRound.status = 'active'
                else activeRound.status = 'ended'
            }

            return {
                id: doc.id,
                ...data,
                activeRound,
                entering: false,
                hasEntered: false // TODO: Check if user already entered
            }
        }))
        
        campaigns.value = results
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// Timer Logic
const getTimeRemaining = (round) => {
    if (!round) return '00:00:00'
    const target = round.status === 'scheduled' ? round.activationTime?.toDate() : round.endTime?.toDate()
    if (!target) return '--:--:--'
    
    // Quick diff (in reality needs a useInterval or proper composable, doing simple calc for initial render)
    // Ideally we extract this to a useCountdown composable or update a reactive var every sec
    const now = new Date()
    const diff = target - now
    if (diff <= 0) return '00:00:00'

    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (d > 0) return `${d}d ${h}h`
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

const enterGiveaway = async (cam) => {
    if (!user.value) {
        alert('Please login to enter!')
        return
    }
    cam.entering = true
    try {
        // Record Entry in subcollection 'entries' under the round?
        // Hierarchy: giveaways/{gId}/rounds/{rId}/entries/{userId}
        await addDoc(collection($db, 'giveaways', cam.id, 'rounds', cam.activeRound.id, 'entries'), {
            userId: user.value.uid,
            email: user.value.email,
            enteredAt: serverTimestamp()
        })
        cam.hasEntered = true
        alert('Good luck! You have been entered.')
    } catch (e) {
        console.error(e)
        alert('Error entering: ' + e.message)
    } finally {
        cam.entering = false
    }
}

onMounted(() => {
    fetchGiveaways()
})
</script>
