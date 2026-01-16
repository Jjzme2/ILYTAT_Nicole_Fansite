<template>
    <div class="message-inbox-container">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-2xl font-serif text-text mb-1">Fan Messages</h2>
                <p class="text-muted text-sm">Messages from your fans — read and reply!</p>
            </div>
            <div class="flex gap-3">
                <button 
                    @click="triggerGlobalReset"
                    class="px-4 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-600 rounded-lg text-sm font-bold hover:bg-pink-500/20 transition flex items-center gap-2"
                    :disabled="globalResetting"
                >
                    <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': globalResetting }" />
                    {{ globalResetting ? 'Resetting All...' : 'Global Reset' }}
                </button>
                <div class="w-px h-8 bg-border mx-1"></div>
                <button 
                    @click="filterStatus = 'all'"
                    :class="['px-4 py-2 rounded-lg text-sm font-bold transition', filterStatus === 'all' ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-text']"
                >
                    All
                </button>
                <button 
                    @click="filterStatus = 'unread'"
                    :class="['px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2', filterStatus === 'unread' ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-text']"
                >
                    Unreplied
                    <span v-if="unrepliedCount > 0" class="w-5 h-5 bg-pink-500 text-white text-[10px] flex items-center justify-center rounded-full">{{ unrepliedCount }}</span>
                </button>
                <button @click="fetchMessages" class="p-2 bg-surface border border-border rounded-lg hover:border-primary transition">
                    <RefreshCw class="w-4 h-4 text-muted" :class="{ 'animate-spin': loading }" />
                </button>
            </div>
        </div>

        <!-- Message List -->
        <div v-if="!viewingMessage" class="space-y-3">
            <div 
                v-for="msg in filteredMessages" 
                :key="msg.id"
                @click="openMessage(msg)"
                class="bg-surface rounded-2xl border border-border p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                :class="{ 'border-l-4 border-l-pink-500': !msg.hasReply }"
            >
                <div v-if="!msg.userVerified" class="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl uppercase tracking-tighter">
                    Non-Verified
                </div>
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1 min-w-0">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                            <User class="w-5 h-5 text-primary" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-bold text-text truncate group-hover:text-primary transition">{{ msg.subject }}</p>
                                <span v-if="!msg.hasReply" class="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">New</span>
                            </div>
                            <p class="text-sm text-muted mb-2 truncate">{{ msg.userEmail }}</p>
                            <p class="text-sm text-text/70 line-clamp-2">{{ msg.content }}</p>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="text-xs text-muted">{{ formatTime(msg.createdAt) }}</p>
                        <p v-if="msg.hasReply" class="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1 justify-end">
                            <Check class="w-3 h-3" />
                            Replied
                        </p>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredMessages.length === 0 && !loading" class="text-center py-16 text-muted">
                <Inbox class="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p class="font-medium text-lg">{{ filterStatus === 'unread' ? 'All caught up!' : 'No messages yet' }}</p>
                <p class="text-sm mt-1">{{ filterStatus === 'unread' ? 'You\'ve replied to all messages.' : 'Fan messages will appear here.' }}</p>
            </div>
        </div>

        <!-- View/Reply to Message -->
        <div v-if="viewingMessage" class="animate-in fade-in slide-in-from-bottom-4">
            <button @click="closeMessage" class="flex items-center gap-2 text-muted hover:text-text mb-6 transition">
                <ArrowLeft class="w-4 h-4" />
                Back to inbox
            </button>

            <div class="bg-surface rounded-2xl border border-border overflow-hidden">
                <!-- Original Message -->
                <div class="p-6 border-b border-border">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <User class="w-6 h-6 text-primary" />
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-text mb-1 flex items-center gap-3">
                                {{ viewingMessage.subject }}
                                <span v-if="!viewingMessage.userVerified" class="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                                    <ShieldAlert class="w-3 h-3" />
                                    Non-Verified Account
                                </span>
                            </h3>
                            <p class="text-xs text-muted">From: <span class="font-bold text-text">{{ viewingMessage.userEmail }}</span> • {{ formatTime(viewingMessage.createdAt) }}</p>
                        </div>
                    </div>
                    <p class="text-text/80 whitespace-pre-wrap leading-relaxed">{{ viewingMessage.content }}</p>
                </div>

                <!-- Replies Thread -->
                <div v-if="replies.length > 0" class="divide-y divide-border">
                    <div 
                        v-for="reply in replies" 
                        :key="reply.id"
                        class="p-6"
                        :class="reply.fromCreator ? 'bg-pink-50 dark:bg-pink-900/10' : 'bg-background/50'"
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
                                    {{ reply.fromCreator ? 'You (Nicole)' : viewingMessage.userEmail }}
                                    <span v-if="reply.fromCreator" class="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Creator</span>
                                    <span v-else-if="!reply.userVerified" class="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Non-Verified</span>
                                </p>
                                <p class="text-xs text-muted">{{ formatTime(reply.createdAt) }}</p>
                            </div>
                        </div>
                        <p class="text-text/80 whitespace-pre-wrap leading-relaxed pl-13">{{ reply.content }}</p>
                    </div>
                </div>

                <!-- Reply Form -->
                <div class="p-6 border-t border-border bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-900/5">
                    <h4 class="font-bold text-text mb-3 flex items-center gap-2">
                        <MessageCircle class="w-4 h-4 text-pink-500" />
                        Reply as Nicole
                    </h4>
                    <form @submit.prevent="sendReply" class="space-y-3">
                        <textarea 
                            v-model="replyContent"
                            rows="4"
                            placeholder="Write your reply..."
                            class="w-full bg-background border-2 border-border rounded-xl p-4 focus:border-primary focus:ring-0 outline-none text-text placeholder-muted/50 resize-none transition"
                        ></textarea>
                        <div class="flex justify-between items-center gap-3">
                            <div class="flex gap-3">
                                <button 
                                    type="button"
                                    @click="resetUserQuota"
                                    class="px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-muted hover:text-primary hover:border-primary transition flex items-center gap-2"
                                    :disabled="resetting"
                                >
                                    <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': resetting }" />
                                    {{ resetting ? 'Resetting...' : 'Reset Quota' }}
                                </button>
                            </div>
                            <div class="flex gap-3">
                                <button 
                                    v-if="!viewingMessage.hasReply"
                                    type="button"
                                    @click="markAsReplied"
                                    class="px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-muted hover:text-text hover:border-primary transition"
                                >
                                    Mark as Replied
                                </button>
                                <button 
                                    type="submit"
                                    :disabled="!replyContent.trim() || sending"
                                    class="bg-gradient-to-r from-pink-500 to-primary text-white px-8 py-3 rounded-xl font-bold hover:from-pink-600 hover:to-primary/90 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Loader2 v-if="sending" class="w-5 h-5 animate-spin" />
                                    <Send v-else class="w-5 h-5" />
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && filteredMessages.length === 0" class="text-center py-16">
            <Loader2 class="w-10 h-10 mx-auto animate-spin text-primary" />
            <p class="text-muted text-sm mt-3">Loading messages...</p>
        </div>
    </div>
</template>

<script setup>
import { Send, ArrowLeft, User, Sparkles, MessageCircle, Inbox, RefreshCw, Check, Loader2, RotateCcw, ShieldAlert } from 'lucide-vue-next'
import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const toast = useToast()

const loading = ref(true)
const sending = ref(false)
const resetting = ref(false)
const globalResetting = ref(false)
const messages = ref([])
const replies = ref([])
const viewingMessage = ref(null)
const replyContent = ref('')
const filterStatus = ref('all')

// Real-time listeners
let inboxListener = null
let repliesListener = null

const startInboxListener = () => {
    if (inboxListener) inboxListener()
    
    loading.value = true
    const q = query(
        collection($db, 'messages'),
        orderBy('createdAt', 'desc')
    )
    
    inboxListener = onSnapshot(q, (snap) => {
        messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loading.value = false
    }, (e) => {
        console.error('[MessageInbox] Inbox error:', e)
        loading.value = false
    })
}

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

// Computed
const unrepliedCount = computed(() => messages.value.filter(m => !m.hasReply).length)
const filteredMessages = computed(() => {
    if (filterStatus.value === 'unread') {
        return messages.value.filter(m => !m.hasReply)
    }
    return messages.value
})

// Fetch all messages (for creator/admin)
const fetchMessages = () => {
    startInboxListener()
}

// Open a message
const openMessage = (msg) => {
    viewingMessage.value = msg
    startRepliesListener(msg.id)
}

const closeMessage = () => {
    viewingMessage.value = null
    if (repliesListener) {
        repliesListener()
        repliesListener = null
    }
}

// Send reply as creator
const sendReply = async () => {
    if (!viewingMessage.value || !replyContent.value.trim()) return
    
    sending.value = true
    try {
        // Add reply to subcollection
        await addDoc(collection($db, 'messages', viewingMessage.value.id, 'replies'), {
            content: replyContent.value.trim(),
            fromCreator: true,
            createdAt: serverTimestamp()
        })
        
        // Mark message as having a reply
        await updateDoc(doc($db, 'messages', viewingMessage.value.id), { 
            hasReply: true,
            repliedAt: serverTimestamp()
        })
        
        viewingMessage.value.hasReply = true
        
        replyContent.value = ''
        toast.show('Reply sent!', 'success')
    } catch (e) {
        console.error('[MessageInbox] Reply error:', e)
        toast.show('Failed to send reply.', 'error')
    } finally {
        sending.value = false
    }
}

// Mark as replied without sending a reply
const markAsReplied = async () => {
    if (!viewingMessage.value) return
    
    try {
        await updateDoc(doc($db, 'messages', viewingMessage.value.id), { 
            hasReply: true,
            repliedAt: serverTimestamp()
        })
        
        const idx = messages.value.findIndex(m => m.id === viewingMessage.value.id)
        if (idx !== -1) messages.value[idx].hasReply = true
        viewingMessage.value.hasReply = true
        
        toast.show('Marked as replied', 'success')
    } catch (e) {
        console.error('[MessageInbox] Mark error:', e)
        toast.show('Failed to update message', 'error')
    }
}

// Reset user's messaging quota
const resetUserQuota = async () => {
    if (!viewingMessage.value?.userId) return
    
    resetting.value = true
    try {
        const response = await $fetch('/api/messages/reset-quota', {
            method: 'POST',
            body: { userId: viewingMessage.value.userId }
        })
        
        if (response.success) {
            toast.show('User quota reset successfully!', 'success')
        }
    } catch (e) {
        console.error('[MessageInbox] Reset error:', e)
        toast.show('Failed to reset quota.', 'error')
    } finally {
        resetting.value = false
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

onMounted(() => {
    fetchMessages()
})
// Reset all users' messaging quotas
const triggerGlobalReset = async () => {
    if (!confirm('Are you sure you want to reset the messaging quota for ALL users? This cannot be undone.')) return
    
    globalResetting.value = true
    try {
        const response = await $fetch('/api/messages/reset-all-quotas', {
            method: 'POST'
        })
        
        if (response.success) {
            toast.show('Global quota reset successful!', 'success')
        }
    } catch (e) {
        console.error('[MessageInbox] Global Reset error:', e)
        toast.show('Failed to perform global reset.', 'error')
    } finally {
        globalResetting.value = false
    }
}

onUnmounted(() => {
    if (inboxListener) inboxListener()
    if (repliesListener) repliesListener()
})
</script>

<style scoped>
.message-inbox-container {
    width: 100%;
}

.pl-13 {
    padding-left: 3.25rem;
}
</style>
