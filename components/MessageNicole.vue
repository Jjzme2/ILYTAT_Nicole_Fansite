<template>
    <div class="message-nicole-container">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-serif text-text mb-1">Message Nicole</h2>
                <p class="text-muted text-sm">Personal messages and replies. Nicole reads everything!</p>
            </div>
            <button 
                v-if="!viewingConversation && !showCompose"
                @click="showCompose = true"
                class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition"
            >
                New Message
            </button>
            <button 
                v-if="!viewingConversation && showCompose"
                @click="showCompose = false"
                class="text-sm text-muted hover:text-text"
            >
                Cancel
            </button>
        </div>

        <!-- Daily Cap Info -->
        <div v-if="!viewingConversation" class="mb-6 p-3 bg-background rounded-xl border border-border flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-muted" />
                <span class="text-xs text-muted">Daily limit:</span>
            </div>
            <div class="flex items-center gap-2">
                <span 
                    class="text-sm font-bold"
                    :class="remainingToday > 0 ? 'text-primary' : 'text-red-500'"
                >
                    {{ remainingToday }} / {{ dailyCap }}
                </span>
                <span class="text-xs text-muted">left today</span>
            </div>
        </div>

        <!-- Cap Reached Warning -->
        <div v-if="remainingToday <= 0 && !viewingConversation && showCompose" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div class="flex items-start gap-3">
                <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p class="font-bold text-red-600 dark:text-red-400">Daily limit reached</p>
                    <p class="text-sm text-text/70 mt-1">You've reached your limit for today. Resets at midnight!</p>
                </div>
            </div>
        </div>

        <!-- Compose Form -->
        <form v-if="!viewingConversation && showCompose && remainingToday > 0" @submit.prevent="sendMessage" class="space-y-4 mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                <div class="mb-4">
                    <label class="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Subject</label>
                    <input 
                        v-model="newMessage.subject"
                        type="text"
                        placeholder="e.g. Question about your latest post"
                        required
                        class="w-full bg-background border-2 border-border rounded-xl p-3 focus:border-primary focus:ring-0 outline-none text-text placeholder-muted/50 transition"
                    >
                </div>
                <div>
                    <label class="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Message</label>
                    <textarea 
                        v-model="newMessage.content"
                        rows="5"
                        placeholder="Write your message here..."
                        required
                        class="w-full bg-background border-2 border-border rounded-xl p-3 focus:border-primary focus:ring-0 outline-none text-text placeholder-muted/50 resize-none transition"
                    ></textarea>
                </div>
                <button 
                    type="submit"
                    :disabled="sending || !newMessage.content.trim() || remainingToday <= 0"
                    class="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-xl font-bold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Loader2 v-if="sending" class="w-5 h-5 animate-spin" />
                    <Send v-else class="w-5 h-5" />
                    {{ sending ? 'Sending...' : 'Send Message' }}
                </button>
            </div>
        </form>

        <!-- Thread View -->
        <div v-if="viewingConversation" class="thread-view animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button @click="closeConversation" class="flex items-center gap-2 text-muted hover:text-text mb-6 transition">
                <ArrowLeft class="w-4 h-4" />
                Back to Inbox
            </button>

            <div class="flex flex-col gap-4">
                <!-- Initial User Message -->
                <div class="flex flex-col items-end">
                    <div class="max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-none p-4 shadow-sm relative">
                        <div v-if="!viewingConversation.userVerified" class="absolute -top-2 -left-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
                            Non-Verified
                        </div>
                        <h3 class="font-bold text-sm opacity-90 mb-1">{{ viewingConversation.subject }}</h3>
                        <p class="whitespace-pre-wrap leading-relaxed text-sm">{{ viewingConversation.content }}</p>
                        <p class="text-[10px] opacity-60 mt-2 text-right">{{ formatTime(viewingConversation.createdAt) }}</p>
                    </div>
                </div>

                <!-- Responses / Replies Thread -->
                <template v-for="reply in replies" :key="reply.id">
                    <div :class="['flex flex-col', reply.fromCreator ? 'items-start' : 'items-end']">
                        <div 
                            :class="[
                                'max-w-[85%] p-4 rounded-2xl shadow-sm relative',
                                reply.fromCreator 
                                    ? 'bg-surface border border-border rounded-tl-none' 
                                    : 'bg-primary text-white rounded-tr-none'
                            ]"
                        >
                            <div v-if="!reply.fromCreator && !reply.userVerified" class="absolute -top-2 -left-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
                                Non-Verified
                            </div>
                            <div v-if="reply.fromCreator" class="flex items-center gap-2 mb-2">
                                <Sparkles class="w-3 h-3 text-pink-500" />
                                <span class="text-[10px] font-bold text-pink-500 uppercase">Nicole</span>
                            </div>
                            <p class="whitespace-pre-wrap leading-relaxed text-sm">{{ reply.content }}</p>
                            <p :class="['text-[10px] mt-2 font-mono', reply.fromCreator ? 'text-muted' : 'text-white/60 text-right']">
                                {{ formatTime(reply.createdAt) }}
                            </p>
                        </div>
                    </div>
                </template>

                <!-- No Replies Indicator -->
                <div v-if="replies.length === 0" class="py-10 text-center">
                    <div class="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-border">
                        <Clock class="w-6 h-6 text-muted animate-pulse" />
                    </div>
                    <p class="text-xs text-muted font-medium">Waiting for Nicole's reply...</p>
                </div>
            </div>

            <!-- Reply Box -->
            <div class="sticky bottom-0 mt-8 pt-4 bg-background">
                <div v-if="!user?.emailVerified" class="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                    <AlertCircle class="w-3 h-3 text-amber-600" />
                    <span class="text-[10px] text-amber-700 font-medium">Please verify your email to remove the "Non-Verified" badge.</span>
                </div>
                <form @submit.prevent="sendReply" class="flex gap-2 p-2 bg-surface border border-border rounded-2xl shadow-lg">
                    <input 
                        v-model="replyContent"
                        type="text"
                        placeholder="Type a follow-up..."
                        class="flex-1 bg-transparent border-none rounded-xl px-4 py-2 focus:ring-0 text-text text-sm"
                    >
                    <button 
                        type="submit"
                        :disabled="!replyContent.trim() || sendingReply"
                        class="bg-primary text-white w-10 h-10 rounded-xl font-bold hover:bg-primary/90 transition flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                        <Loader2 v-if="sendingReply" class="w-4 h-4 animate-spin" />
                        <Send v-else class="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>

        <!-- Inbox List -->
        <div v-if="!viewingConversation && !showCompose" class="inbox-view">
            <h3 class="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center justify-between">
                <span class="flex items-center gap-2">
                    <Inbox class="w-4 h-4" />
                    My Conversations
                </span>
                <span v-if="messages.length > 0" class="text-[10px] font-mono opacity-50">{{ messages.length }} messages</span>
            </h3>

            <div v-if="messages.length > 0" class="space-y-3">
                <div 
                    v-for="msg in messages" 
                    :key="msg.id"
                    @click="openConversation(msg)"
                    class="bg-surface rounded-2xl border border-border p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                >
                    <!-- Unread Indicator -->
                    <div 
                        v-if="msg.hasReply && !msg.readAt"
                        class="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"
                    ></div>

                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <h4 :class="['text-sm font-bold truncate transition', msg.hasReply && !msg.readAt ? 'text-text' : 'text-text/70']">
                                    {{ msg.subject }}
                                </h4>
                                <span v-if="msg.hasReply && !msg.readAt" class="px-1.5 py-0.5 bg-pink-500 text-white text-[9px] font-bold rounded uppercase">New Reply</span>
                            </div>
                            <p class="text-xs text-muted line-clamp-1">{{ msg.content }}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-[10px] text-muted font-mono">{{ formatTimeShort(msg.createdAt) }}</p>
                            <div v-if="msg.hasReply" class="mt-2 text-[10px] text-pink-500 font-bold flex items-center gap-1 justify-end">
                                <Sparkles class="w-3 h-3" />
                                Replied
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-20 bg-surface/30 rounded-3xl border-2 border-dashed border-border">
            <Mail class="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p class="font-medium text-text/50">No conversations yet</p>
            <button @click="showCompose = true" class="mt-4 text-sm font-bold text-primary hover:underline">Send your first message</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="mt-8 text-center py-8">
            <Loader2 class="w-8 h-8 mx-auto animate-spin text-primary" />
            <p class="text-muted text-sm mt-2">Loading...</p>
        </div>
    </div>
</template>

<script setup>
import { Send, ArrowLeft, User, Sparkles, MessageCircle, Inbox, Mail, Loader2, Clock, AlertCircle } from 'lucide-vue-next'
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, getDoc, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore'
import { formatTime } from '~/utils/date'

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()
const config = useAppConfig()
const route = useRoute()

// Daily cap from config
const dailyCap = config.messaging?.dailyMessageCap || 3

const loading = ref(true)
const sending = ref(false)
const sendingReply = ref(false)
const showCompose = ref(false)
const messages = ref([])
const replies = ref([])
const viewingConversation = ref(null)
const replyContent = ref('')
const remainingToday = ref(dailyCap)
let messagesListener = null
let repliesListener = null

const newMessage = reactive({
    subject: '',
    content: ''
})

// Get today's date as YYYY-MM-DD string for comparison
const getTodayString = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Fetch and update user's messaging quota
const fetchQuota = async () => {
    if (!user.value?.uid) return
    
    try {
        const userDoc = await getDoc(doc($db, 'users', user.value.uid))
        if (!userDoc.exists()) return
        
        const userData = userDoc.data()
        const quota = userData.messagingQuota || { remaining: dailyCap, lastResetDate: null }
        const today = getTodayString()
        
        // Check if we need to reset (new day)
        if (quota.lastResetDate !== today) {
            // Reset quota for new day
            await updateDoc(doc($db, 'users', user.value.uid), {
                'messagingQuota.remaining': dailyCap,
                'messagingQuota.lastResetDate': today
            })
            remainingToday.value = dailyCap
        } else {
            remainingToday.value = quota.remaining ?? dailyCap
        }
    } catch (e) {
        console.error('[MessageNicole] Quota fetch error:', e)
        remainingToday.value = dailyCap 
    }
}

// Decrement quota after sending
const decrementQuota = async () => {
    if (!user.value?.uid) return
    
    const newRemaining = Math.max(0, remainingToday.value - 1)
    remainingToday.value = newRemaining
    
    try {
        await updateDoc(doc($db, 'users', user.value.uid), {
            'messagingQuota.remaining': newRemaining,
            'messagingQuota.lastResetDate': getTodayString()
        })
    } catch (error) {
        console.error('[MessageNicole] Quota update error:', error)
    }
}

// Fetch user's message list (real-time)
const startMessagesListener = () => {
    if (!user.value?.uid) return
    if (messagesListener) messagesListener()
    
    loading.value = true
    const q = query(
        collection($db, 'messages'),
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'desc')
    )
    
    messagesListener = onSnapshot(q, (snap) => {
        messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loading.value = false
    }, (e) => {
        console.error('[MessageNicole] List error:', e)
        loading.value = false
    })
}

// Fetch user's message list
const fetchMessages = () => {
    startMessagesListener()
}

// Real-time reply listener
const startRepliesListener = (messageId) => {
    if (repliesListener) repliesListener()
    
    const q = query(
        collection($db, 'messages', messageId, 'replies'),
        orderBy('createdAt', 'asc')
    )
    
    repliesListener = onSnapshot(q, (snap) => {
        replies.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
}

// Send a new message
const sendMessage = async () => {
    if (!user.value?.uid || !newMessage.content.trim()) return
    
    if (newMessage.content.length > 2000) {
        toast.show('Message too long (max 2000 chars)', 'error')
        return
    }

    sending.value = true
    try {
        // Capture message details for auto-opening
        const subject = newMessage.subject.trim() || 'No subject'
        const content = newMessage.content.trim()

        const docRef = await addDoc(collection($db, 'messages'), {
            userId: user.value.uid,
            userEmail: user.value.email,
            userVerified: user.value.emailVerified || false,
            subject,
            content,
            createdAt: serverTimestamp(),
            hasReply: false,
            readAt: null
        })
        
        toast.show('Message sent!', 'success')
        showCompose.value = false
        newMessage.subject = ''
        newMessage.content = ''
        await decrementQuota()
        
        // The listener will pick up the new message
        // No need to manually fetchMessages()
        
        // Auto-open is handled by finding the new doc in the listener or using the ref
        // For immediate UI, we can just open using details
        openConversation({ 
            id: docRef.id, 
            subject, 
            content, 
            createdAt: new Date() 
        })
        
    } catch (e) {
        console.error('[MessageNicole] Send error:', e)
        toast.show('Failed to send message.', 'error')
    } finally {
        sending.value = false
    }
}

// Send a follow-up
const sendReply = async () => {
    if (!viewingConversation.value || !replyContent.value.trim()) return
    
    sendingReply.value = true
    try {
        await addDoc(collection($db, 'messages', viewingConversation.value.id, 'replies'), {
            content: replyContent.value.trim(),
            fromCreator: false,
            userId: user.value.uid,
            userVerified: user.value.emailVerified || false,
            createdAt: serverTimestamp()
        })
        
        replyContent.value = ''
    } catch (e) {
        console.error('[MessageNicole] Reply error:', e)
        toast.show('Failed to reply.', 'error')
    } finally {
        sendingReply.value = false
    }
}

// Open a conversation
const openConversation = async (msg) => {
    viewingConversation.value = msg
    startRepliesListener(msg.id)
    
    // Mark as read if has unread reply
    if (msg.hasReply && !msg.readAt) {
        await updateDoc(doc($db, 'messages', msg.id), { readAt: serverTimestamp() })
        const idx = messages.value.findIndex(m => m.id === msg.id)
        if (idx !== -1) messages.value[idx].readAt = new Date()
    }
}

const closeConversation = () => {
    viewingConversation.value = null
    if (repliesListener) {
        repliesListener()
        repliesListener = null
    }
    replies.value = []
    fetchMessages() // Refresh list to update read statuses
}

const formatTimeShort = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

watch(() => user.value?.uid, (uid) => {
    if (uid) {
        fetchMessages()
        fetchQuota()
    }
}, { immediate: true })

// Deep link to specific message
watch([() => route.query.messageId, messages], ([msgId, msgs]) => {
    if (msgId && msgs.length > 0) {
        const found = msgs.find(m => m.id === msgId)
        if (found && (!viewingConversation.value || viewingConversation.value.id !== msgId)) {
            openConversation(found)
            // Scroll to the component if needed
            const el = document.querySelector('.message-nicole-container')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
    }
}, { immediate: true })

onUnmounted(() => {
    if (messagesListener) messagesListener()
    if (repliesListener) repliesListener()
})
</script>

<style scoped>
.message-nicole-container {
    width: 100%;
}

/* Animations */
.animate-in {
    animation-duration: 0.3s;
    animation-fill-mode: both;
}

@keyframes slide-in-from-top-2 {
    from { transform: translateY(-0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-from-bottom-2 {
    from { transform: translateY(0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.fade-in { animation-name: fade-in; }
.slide-in-from-top-2 { animation-name: slide-in-from-top-2; }
.slide-in-from-bottom-2 { animation-name: slide-in-from-bottom-2; }

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
