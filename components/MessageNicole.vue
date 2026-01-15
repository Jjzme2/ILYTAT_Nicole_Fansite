<template>
    <div class="message-nicole-container">
        <!-- Header -->
        <div class="mb-6">
            <h2 class="text-2xl font-serif text-text mb-1">Message Nicole</h2>
            <p class="text-muted text-sm">Send a personal message. Nicole reads every one!</p>
            
            <!-- Daily Cap Info -->
            <div class="mt-3 p-3 bg-background rounded-xl border border-border flex items-center justify-between">
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
                    <span class="text-xs text-muted">messages left today</span>
                </div>
            </div>
        </div>

        <!-- Cap Reached Warning -->
        <div v-if="remainingToday <= 0 && !viewingConversation" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div class="flex items-start gap-3">
                <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p class="font-bold text-red-600 dark:text-red-400">Daily limit reached</p>
                    <p class="text-sm text-text/70 mt-1">You've sent {{ dailyCap }} messages today. Your limit resets at midnight.</p>
                </div>
            </div>
        </div>

        <!-- Compose Form -->
        <form v-if="!viewingConversation && remainingToday > 0" @submit.prevent="sendMessage" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Subject</label>
                <input 
                    v-model="newMessage.subject"
                    type="text"
                    placeholder="What's on your mind?"
                    required
                    class="w-full bg-background border-2 border-border rounded-xl p-3 focus:border-primary focus:ring-0 outline-none text-text placeholder-muted/50 transition"
                >
            </div>
            <div>
                <label class="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Your Message</label>
                <textarea 
                    v-model="newMessage.content"
                    rows="5"
                    placeholder="Write your message here..."
                    required
                    class="w-full bg-background border-2 border-border rounded-xl p-3 focus:border-primary focus:ring-0 outline-none text-text placeholder-muted/50 resize-none transition"
                ></textarea>
                <p class="text-xs text-muted mt-1 text-right">{{ newMessage.content.length }} / 2000</p>
            </div>
            <button 
                type="submit"
                :disabled="sending || !newMessage.content.trim() || remainingToday <= 0"
                class="w-full bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-xl font-bold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
                <Loader2 v-if="sending" class="w-5 h-5 animate-spin" />
                <Send v-else class="w-5 h-5" />
                {{ sending ? 'Sending...' : 'Send Message' }}
            </button>
        </form>

        <!-- Conversation View -->
        <div v-if="viewingConversation" class="conversation-view">
            <button @click="viewingConversation = null" class="flex items-center gap-2 text-muted hover:text-text mb-6 transition">
                <ArrowLeft class="w-4 h-4" />
                Back to messages
            </button>

            <div class="bg-surface rounded-2xl border border-border overflow-hidden">
                <!-- Original Message -->
                <div class="p-6 border-b border-border">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <User class="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p class="font-bold text-text">You</p>
                            <p class="text-xs text-muted">{{ formatTime(viewingConversation.createdAt) }}</p>
                        </div>
                    </div>
                    <h3 class="font-bold text-lg text-text mb-2">{{ viewingConversation.subject }}</h3>
                    <p class="text-text/80 whitespace-pre-wrap leading-relaxed">{{ viewingConversation.content }}</p>
                </div>

                <!-- Replies -->
                <div v-if="replies.length > 0" class="divide-y divide-border">
                    <div 
                        v-for="reply in replies" 
                        :key="reply.id"
                        class="p-6"
                        :class="reply.fromCreator ? 'bg-primary/5' : 'bg-background/50'"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <div 
                                class="w-10 h-10 rounded-full flex items-center justify-center"
                                :class="reply.fromCreator ? 'bg-gradient-to-br from-pink-500 to-primary' : 'bg-gradient-to-br from-primary/30 to-primary/10'"
                            >
                                <Sparkles v-if="reply.fromCreator" class="w-5 h-5 text-white" />
                                <User v-else class="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p class="font-bold text-text flex items-center gap-2">
                                    {{ reply.fromCreator ? 'Nicole' : 'You' }}
                                    <span v-if="reply.fromCreator" class="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Creator</span>
                                </p>
                                <p class="text-xs text-muted">{{ formatTime(reply.createdAt) }}</p>
                            </div>
                        </div>
                        <p class="text-text/80 whitespace-pre-wrap leading-relaxed pl-13">{{ reply.content }}</p>
                    </div>
                </div>

                <!-- No Replies State -->
                <div v-else class="p-8 text-center text-muted">
                    <MessageCircle class="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p class="font-medium">No reply yet</p>
                    <p class="text-sm mt-1">Nicole will get back to you soon!</p>
                </div>

                <!-- Reply Form (for User follow-up) -->
                <div class="p-4 border-t border-border bg-background/30">
                    <form @submit.prevent="sendReply" class="flex gap-3">
                        <input 
                            v-model="replyContent"
                            type="text"
                            placeholder="Send a follow-up..."
                            class="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-text text-sm"
                        >
                        <button 
                            type="submit"
                            :disabled="!replyContent.trim() || sendingReply"
                            class="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Loader2 v-if="sendingReply" class="w-4 h-4 animate-spin" />
                            <Send v-else class="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Previous Messages -->
        <div v-if="!viewingConversation && messages.length > 0" class="mt-10">
            <h3 class="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Inbox class="w-4 h-4" />
                Your Messages
            </h3>
            <div class="space-y-3">
                <div 
                    v-for="msg in messages" 
                    :key="msg.id"
                    @click="openConversation(msg)"
                    class="bg-surface rounded-xl border border-border p-4 cursor-pointer hover:border-primary transition-all duration-200 group"
                >
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-bold text-text truncate group-hover:text-primary transition">{{ msg.subject }}</h4>
                                <span 
                                    v-if="msg.hasReply && !msg.readAt"
                                    class="shrink-0 w-2 h-2 bg-pink-500 rounded-full animate-pulse"
                                ></span>
                            </div>
                            <p class="text-sm text-muted line-clamp-2">{{ msg.content }}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xs text-muted">{{ formatTime(msg.createdAt) }}</p>
                            <p v-if="msg.hasReply" class="text-[10px] text-pink-500 font-bold mt-1 uppercase">Replied!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="!viewingConversation && messages.length === 0 && !loading" class="mt-8 text-center text-muted py-8">
            <Mail class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p class="font-medium">No messages yet</p>
            <p class="text-sm mt-1">Send your first message to Nicole!</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="mt-8 text-center py-8">
            <Loader2 class="w-8 h-8 mx-auto animate-spin text-primary" />
            <p class="text-muted text-sm mt-2">Loading messages...</p>
        </div>
    </div>
</template>

<script setup>
import { Send, ArrowLeft, User, Sparkles, MessageCircle, Inbox, Mail, Loader2, Clock, AlertCircle } from 'lucide-vue-next'
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, getDoc, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()
const config = useAppConfig()

// Daily cap from config
const dailyCap = config.messaging?.dailyMessageCap || 3

const loading = ref(true)
const sending = ref(false)
const sendingReply = ref(false)
const messages = ref([])
const replies = ref([])
const viewingConversation = ref(null)
const replyContent = ref('')
const remainingToday = ref(dailyCap)

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
            console.log('[MessageNicole] Quota reset for new day')
        } else {
            remainingToday.value = quota.remaining ?? dailyCap
        }
    } catch (e) {
        console.error('[MessageNicole] Quota fetch error:', e)
        remainingToday.value = dailyCap // Fallback to full quota
    }
}

// Decrement quota after sending a message
const decrementQuota = async () => {
    if (!user.value?.uid) return
    
    const newRemaining = Math.max(0, remainingToday.value - 1)
    remainingToday.value = newRemaining
    
    try {
        await updateDoc(doc($db, 'users', user.value.uid), {
            'messagingQuota.remaining': newRemaining,
            'messagingQuota.lastResetDate': getTodayString()
        })
    } catch (e) {
        console.error('[MessageNicole] Quota update error:', e)
    }
}

// Fetch user's messages
const fetchMessages = async () => {
    if (!user.value?.uid) return
    
    loading.value = true
    try {
        const q = query(
            collection($db, 'messages'),
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
        console.error('[MessageNicole] Fetch error:', e)
    } finally {
        loading.value = false
    }
}

// Fetch replies for a conversation
const fetchReplies = async (messageId) => {
    try {
        const q = query(
            collection($db, 'messages', messageId, 'replies'),
            orderBy('createdAt', 'asc')
        )
        const snap = await getDocs(q)
        replies.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
        console.error('[MessageNicole] Fetch replies error:', e)
        replies.value = []
    }
}

// Send a new message
const sendMessage = async () => {
    if (!user.value?.uid || !newMessage.content.trim()) return
    if (newMessage.content.length > 2000) {
        toast.show('Message too long (max 2000 characters)', 'error')
        return
    }
    if (remainingToday.value <= 0) {
        toast.show(`Daily limit reached (${dailyCap} messages/day)`, 'error')
        return
    }
    
    sending.value = true
    try {
        await addDoc(collection($db, 'messages'), {
            userId: user.value.uid,
            userEmail: user.value.email,
            subject: newMessage.subject.trim() || 'No subject',
            content: newMessage.content.trim(),
            createdAt: serverTimestamp(),
            hasReply: false,
            readAt: null
        })
        
        toast.show('Message sent! Nicole will see it soon.', 'success')
        newMessage.subject = ''
        newMessage.content = ''
        await decrementQuota() // Update user quota
        await fetchMessages()
    } catch (e) {
        console.error('[MessageNicole] Send error:', e)
        toast.show('Failed to send message. Please try again.', 'error')
    } finally {
        sending.value = false
    }
}

// Send a reply (follow-up from user)
const sendReply = async () => {
    if (!viewingConversation.value || !replyContent.value.trim()) return
    
    sendingReply.value = true
    try {
        await addDoc(collection($db, 'messages', viewingConversation.value.id, 'replies'), {
            content: replyContent.value.trim(),
            fromCreator: false,
            userId: user.value.uid,
            createdAt: serverTimestamp()
        })
        
        replyContent.value = ''
        await fetchReplies(viewingConversation.value.id)
        toast.show('Reply sent!', 'success')
    } catch (e) {
        console.error('[MessageNicole] Reply error:', e)
        toast.show('Failed to send reply.', 'error')
    } finally {
        sendingReply.value = false
    }
}

// Open a conversation
const openConversation = async (msg) => {
    viewingConversation.value = msg
    await fetchReplies(msg.id)
    
    // Mark as read if has unread reply
    if (msg.hasReply && !msg.readAt) {
        await updateDoc(doc($db, 'messages', msg.id), { readAt: serverTimestamp() })
        const idx = messages.value.findIndex(m => m.id === msg.id)
        if (idx !== -1) messages.value[idx].readAt = new Date()
    }
}

// Format timestamp
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

watch(() => user.value?.uid, (uid) => {
    if (uid) {
        fetchMessages()
        fetchQuota()
    }
}, { immediate: true })
</script>

<style scoped>
.message-nicole-container {
    max-width: 640px;
    margin: 0 auto;
}

.pl-13 {
    padding-left: 3.25rem;
}
</style>
