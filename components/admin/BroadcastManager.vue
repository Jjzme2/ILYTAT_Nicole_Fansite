<template>
    <div>
        <header class="mb-6 bg-surface p-6 rounded-2xl border border-border shadow-sm flex justify-between items-center">
            <div>
                    <h2 class="text-2xl font-serif text-text mb-1">Communications Center</h2>
                    <p class="text-muted text-sm">Manage global broadcasts and direct user notifications.</p>
            </div>
            <div class="flex gap-2">
                    <button 
                    @click="broadcastMode = 'global'" 
                    :class="['px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2', broadcastMode === 'global' ? 'bg-primary text-white' : 'bg-background hover:bg-gray-100 text-text']"
                >
                    <Megaphone class="w-4 h-4" /> Global Broadcast
                </button>
                <button 
                    @click="broadcastMode = 'direct'" 
                    :class="['px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2', broadcastMode === 'direct' ? 'bg-indigo-600 text-white' : 'bg-background hover:bg-gray-100 text-text']"
                >
                    <Bell class="w-4 h-4" /> Direct Notification
                </button>
            </div>
        </header>

        <div class="grid lg:grid-cols-2 gap-8">
            
            <!-- GLOBAL BROADCAST MODE -->
            <div v-if="broadcastMode === 'global'" class="bg-surface rounded-2xl border border-border p-6 h-fit animate-in fade-in slide-in-from-left-4">
                <h3 class="font-bold text-lg mb-4 text-text flex items-center gap-2">
                    <Megaphone class="w-5 h-5 text-primary" />
                    New Global Broadcast
                </h3>
                <form @submit.prevent="createBroadcast" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Message Content</label>
                        <textarea v-model="newBroadcast.content" required rows="3" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none resize-none" placeholder="e.g. Server maintenance in 10 mins..."></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-muted uppercase mb-1">Type</label>
                            <select v-model="newBroadcast.type" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none">
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="announcement">Announcement</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-muted uppercase mb-1">Style</label>
                            <select v-model="newBroadcast.style" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none">
                                <option value="toast">Toast (Popup)</option>
                                <option value="banner">Banner (Top)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="p-4 bg-background rounded-xl border border-border space-y-3">
                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" v-model="newBroadcast.dismissible" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary">
                                <span class="text-sm font-medium">User Can Dismiss</span>
                            </label>
                            
                            <!-- Card Options (New) -->
                            <div class="flex items-center gap-2">
                                <label class="text-xs font-bold text-muted uppercase">Theme:</label>
                                <select v-model="newBroadcast.cardTheme" class="bg-surface border border-border rounded-lg text-xs p-1 focus:border-primary outline-none">
                                    <option value="standard">Standard (Colored)</option>
                                    <option value="neutral">Neutral (B&W)</option>
                                </select>
                            </div>
                        </div>

                        <div v-if="!newBroadcast.dismissible" class="flex items-center gap-3 animate-in slide-in-from-top-2">
                            <label class="text-xs font-bold text-muted uppercase whitespace-nowrap">Duration (Hours)</label>
                            <input v-model="newBroadcast.durationHours" type="number" min="1" class="w-20 bg-surface border border-border rounded-lg p-2 text-sm focus:border-primary outline-none">
                        </div>
                    </div>

                    <button type="submit" :disabled="sendingBroadcast" class="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                        <Megaphone class="w-4 h-4" />
                        {{ sendingBroadcast ? 'Sending...' : 'Broadcast Now' }}
                    </button>
                </form>
            </div>

            <!-- DIRECT NOTIFICATION MODE -->
            <div v-if="broadcastMode === 'direct'" class="bg-surface rounded-2xl border border-border p-6 h-fit animate-in fade-in slide-in-from-right-4">
                <h3 class="font-bold text-lg mb-4 text-text flex items-center gap-2">
                    <Bell class="w-5 h-5 text-indigo-600" />
                    Send Direct Notification
                </h3>
                <form @submit.prevent="sendDirectNotification" class="space-y-4">
                    <div class="relative">
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Recipient</label>
                        
                        <!-- Search Input (if no user selected) -->
                        <div v-if="!newNotification.targetId" class="relative">
                            <input 
                                v-model="userSearchQuery" 
                                @input="handleUserSearch" 
                                type="text" 
                                placeholder="Search user by email..." 
                                class="w-full bg-background border border-border rounded-xl pl-10 p-3 text-sm focus:border-indigo-500 outline-none"
                            >
                            <Search class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                            <div v-if="isSearchingUsers" class="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 class="w-4 h-4 text-indigo-500 animate-spin" />
                            </div>

                            <!-- Results Dropdown -->
                            <div v-if="userSearchResults.length > 0" class="absolute z-10 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                <button 
                                    v-for="u in userSearchResults" 
                                    :key="u.id" 
                                    @click="selectUser(u)"
                                    type="button"
                                    class="w-full text-left p-3 hover:bg-background/50 text-sm flex items-center justify-between border-b border-border last:border-0"
                                >
                                    <span class="font-bold text-text truncate">{{ u.email }}</span>
                                    <span class="text-[10px] text-muted font-mono shrink-0 ml-2">UID: {{ u.id.slice(0,4) }}...</span>
                                </button>
                            </div>
                            <div v-else-if="userSearchQuery.length > 2 && !isSearchingUsers && userSearchResults.length === 0" class="absolute z-10 top-full mt-1 px-3 py-2 text-xs text-muted">
                                No users found.
                            </div>
                        </div>

                        <!-- Selected User Display -->
                        <div v-else class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                            <div>
                                <p class="text-xs font-bold text-indigo-800">Sending to:</p>
                                <p class="text-sm font-medium text-indigo-900">{{ newNotification.targetEmail }}</p>
                                <p class="text-[10px] text-indigo-400 font-mono">{{ newNotification.targetId }}</p>
                            </div>
                            <button @click="clearSelectedUser" type="button" class="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Title</label>
                        <input v-model="newNotification.title" required type="text" placeholder="e.g. You won!" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Message</label>
                        <textarea v-model="newNotification.message" required rows="3" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Notification body..."></textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Action URL (Optional)</label>
                        <input v-model="newNotification.actionUrl" type="text" placeholder="/settings" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                        <div class="mt-2 flex flex-wrap gap-2">
                            <button type="button" @click="newNotification.actionUrl = '/legal/content-policy'" class="text-[10px] px-2 py-1 bg-surface border border-border rounded-lg hover:border-primary transition text-muted hover:text-primary">Content Policy</button>
                            <button type="button" @click="newNotification.actionUrl = '/legal/privacy-policy'" class="text-[10px] px-2 py-1 bg-surface border border-border rounded-lg hover:border-primary transition text-muted hover:text-primary">Privacy</button>

                            <button type="button" @click="newNotification.actionUrl = '/profile'" class="text-[10px] px-2 py-1 bg-surface border border-border rounded-lg hover:border-primary transition text-muted hover:text-primary">Profile</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-muted uppercase mb-1">Type</label>
                        <select v-model="newNotification.type" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                            <option value="alert">Alert</option>
                            <option value="success">Success</option>
                            <option value="brand_deal">Brand Deal</option>
                            <option value="giveaway">Giveaway</option>
                        </select>
                    </div>

                    <button type="submit" :disabled="sendingNotification" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                        <Bell class="w-4 h-4" />
                        {{ sendingNotification ? 'Sending...' : 'Send Notification' }}
                    </button>
                </form>
            </div>

            <!-- Active Broadcasts / History List -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                        <h3 class="font-bold text-lg text-text">Active Messages</h3>
                </div>
                
                <div class="space-y-3">
                    <div v-for="msg in activeBroadcasts" :key="msg.id" class="bg-surface rounded-2xl border border-border p-4 flex items-start gap-4 hover:shadow-md transition group relative overflow-hidden">
                        <div 
                            class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                            :class="msg.style === 'banner' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'"
                        >
                            <Megaphone class="w-5 h-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs font-bold uppercase tracking-wider text-muted">{{ msg.type }}</span>
                                <span class="text-[10px] text-muted font-mono">{{ formatDateTime(msg.createdAt) }}</span>
                            </div>
                            <p class="text-sm font-medium text-text break-words">{{ msg.content }}</p>
                            <div class="flex items-center gap-3 mt-2 text-xs text-muted">
                                <span v-if="msg.dismissible" class="flex items-center gap-1"><CheckCircle class="w-3 h-3" /> Dismissible</span>
                                <span v-else class="flex items-center gap-1"><XCircle class="w-3 h-3" /> Mandatory</span>
                                
                                <span class="bg-background px-2 py-0.5 rounded border border-border">{{ msg.style }}</span>
                            </div>
                        </div>
                        <button 
                            @click="deactivateBroadcast(msg.id)"
                            class="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                            title="Deactivate"
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                    <div v-if="activeBroadcasts.length === 0" class="text-center py-10 text-muted italic">
                        No active broadcasts.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Megaphone, Bell, Search, Loader2, X, CheckCircle, XCircle, Trash2 } from 'lucide-vue-next'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, limit, getDocs } from 'firebase/firestore'

const props = defineProps(['initialTarget'])
const emit = defineEmits(['cleared'])

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()

// --- BROADCASTS LOGIC ---
const newBroadcast = ref({
    content: '',
    type: 'info',
    style: 'toast',
    dismissible: true,
    cardTheme: 'standard', // 'standard' | 'neutral'
    durationHours: 24 // Default duration if not dismissible
})
const sendingBroadcast = ref(false)
const activeBroadcasts = ref([])

// Realtime listener
onMounted(() => {
    const q = query(
        collection($db, 'system_messages'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
    )
    onSnapshot(q, (snap) => {
        activeBroadcasts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
})

const createBroadcast = async () => {
    if (!newBroadcast.value.content) return
    
    sendingBroadcast.value = true
    try {
        const payload = {
            ...newBroadcast.value,
            isActive: true,
            createdAt: serverTimestamp(),
            createdBy: user.value.uid
        }

        if (!newBroadcast.value.dismissible) {
            const now = new Date()
            now.setHours(now.getHours() + parseInt(newBroadcast.value.durationHours))
            payload.expiresAt = { toDate: () => now } // Shim for Timestamp if using local Date, but firestore handles Dates.
            // Better to use Date object which Firestore converts.
            payload.expiresAt = now
        }

        await addDoc(collection($db, 'system_messages'), payload)
        toast.success('Broadcast sent!')
        newBroadcast.value.content = ''
    } catch (e) {
        console.error(e)
        toast.error('Failed to send broadcast')
    } finally {
        sendingBroadcast.value = false
    }
}

// --- DIRECT NOTIFICATIONS LOGIC ---
const broadcastMode = ref('global')
const sendingNotification = ref(false)
const newNotification = ref({
    targetId: '',
    targetEmail: '',
    title: '',
    message: '',
    actionUrl: '',
    type: 'alert'
})
const userSearchQuery = ref('')
const userSearchResults = ref([])
const isSearchingUsers = ref(false)

const handleUserSearch = async () => {
    if (userSearchQuery.value.length < 2) {
        userSearchResults.value = []
        return
    }

    isSearchingUsers.value = true
    try {
        const q2 = query(
            collection($db, 'users'),
            where('email', '>=', userSearchQuery.value),
            where('email', '<=', userSearchQuery.value + '\uf8ff'),
            limit(5)
        )
        const snap = await getDocs(q2)
        userSearchResults.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('User search failed', e)
    } finally {
        isSearchingUsers.value = false
    }
}

const selectUser = (u) => {
    newNotification.value.targetId = u.id
    newNotification.value.targetEmail = u.email
    userSearchQuery.value = u.email
    userSearchResults.value = []
}

const clearSelectedUser = () => {
    newNotification.value.targetId = ''
    newNotification.value.targetEmail = ''
    userSearchQuery.value = ''
    userSearchResults.value = []
}

const sendDirectNotification = async () => {
    if (!newNotification.value.targetId || !newNotification.value.message) return

    sendingNotification.value = true
    try {
        await addDoc(collection($db, 'users', newNotification.value.targetId, 'notifications'), {
            title: newNotification.value.title,
            message: newNotification.value.message,
            actionUrl: newNotification.value.actionUrl,
            type: newNotification.value.type,
            read: false,
            createdAt: serverTimestamp(),
            createdBy: user.value.uid
        })
        toast.success(`Notification sent to ${newNotification.value.targetEmail || 'user'}`)
        
        newNotification.value = {
            targetId: '',
            targetEmail: '',
            title: '',
            message: '',
            actionUrl: '',
            type: 'alert'
        }
    } catch (e) {
        console.error(e)
        // toast.error('Failed to send notification: ' + e.message)
    } finally {
        sendingNotification.value = false
    }
}

const deactivateBroadcast = async (id) => {
    if (!confirm('Stop showing this message?')) return
    try {
        await updateDoc(doc($db, 'system_messages', id), {
            isActive: false
        })
        toast.success('Broadcast deactivated')
    } catch (e) {
        console.error(e)
        toast.error('Failed to deactivate')
    }
}

watch(() => props.initialTarget, (u) => {
    if (u) {
        broadcastMode.value = 'direct'
        newNotification.value.targetId = u.id
        newNotification.value.targetEmail = u.email
        userSearchQuery.value = u.email
        window.scrollTo({ top: 0, behavior: 'smooth' })
        emit('cleared')
    }
}, { immediate: true })
</script>
