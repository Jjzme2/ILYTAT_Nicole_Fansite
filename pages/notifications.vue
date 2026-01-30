<template>
    <div class="container mx-auto max-w-2xl px-4 py-8">
        <header class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-serif text-text mb-2">Notifications</h1>
                <p class="text-muted">History of your alerts and updates.</p>
            </div>
            <button @click="markAllAsRead" v-if="hasUnread" class="text-sm font-bold text-primary hover:underline">
                Mark all read
            </button>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="py-12 text-center text-muted">
             <Loader2 class="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
             <p>Loading notifications...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="notifications.length === 0" class="py-20 text-center bg-surface rounded-2xl border border-border">
            <BellOff class="w-12 h-12 mx-auto mb-4 text-muted/50" />
            <h3 class="text-lg font-bold text-text">All caught up!</h3>
            <p class="text-muted">No notifications to display.</p>
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
            <div 
                v-for="notif in notifications" 
                :key="notif.id"
                class="bg-surface p-4 rounded-xl border border-border flex gap-4 transition-all duration-300"
                :class="{ 'border-primary/50 shadow-sm bg-primary/5': !notif.read }"
            >
                <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition"
                    :class="getTypeStyles(notif.type).bg"
                >
                    <component 
                        :is="getTypeIcon(notif.type)" 
                        class="w-5 h-5" 
                        :class="getTypeStyles(notif.type).text" 
                    />
                </div>

                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-text" :class="{ 'text-primary': !notif.read }">{{ notif.title }}</h4>
                        <span class="text-xs text-muted">{{ formatTime(notif.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-muted leading-relaxed whitespace-pre-line">{{ notif.message }}</p>
                    
                    <!-- Actions -->
                    <div v-if="notif.actionUrl" class="mt-3">
                        <NuxtLink :to="notif.actionUrl" class="text-xs font-bold bg-background border border-border px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition inline-flex items-center gap-2">
                            View details
                            <ArrowRight class="w-3 h-3" />
                        </NuxtLink>
                    </div>
                </div>

                <div v-if="!notif.read" class="flex flex-col gap-2">
                    <button @click="markAsRead(notif)" class="p-1 hover:bg-background rounded-full text-muted hover:text-primary transition" title="Mark Read">
                        <Check class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { 
    Loader2, BellOff, Briefcase, AlertTriangle, Gift, Zap, Check, ArrowRight
} from 'lucide-vue-next'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit } from 'firebase/firestore'

definePageMeta({
    middleware: 'auth'
})

const { $db } = useNuxtApp()
const { user, isAdmin, isCreator } = useAuth()

const notifications = ref([])
const loading = ref(true)

const hasUnread = computed(() => notifications.value.some(n => !n.read))

// Reuse logic from NotificationBell but adapted for page
onMounted(() => {
    // 1. Personal
    const unsubscibers = []
    
    if (user.value?.uid) {
        const userQ = query(
            collection($db, 'users', user.value.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50)
        )
        const unsub1 = onSnapshot(userQ, (snap) => {
            const personal = snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'personal' }))
            updateNotifs(personal, 'personal')
        })
        unsubscibers.push(unsub1)
    }
    
    // 2. Global (Admin/Creator)
    if (isAdmin.value || isCreator.value) {
        const adminQ = query(collection($db, 'notifications'), orderBy('createdAt', 'desc'), limit(50))
        const unsub2 = onSnapshot(adminQ, (snap) => {
             const admin = snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'admin' }))
             updateNotifs(admin, 'admin')
        })
        unsubscibers.push(unsub2)
    }

    loading.value = false
    
    onUnmounted(() => {
        unsubscibers.forEach(u => u())
    })
})

const notifState = reactive({ personal: [], admin: [] })

const updateNotifs = (list, source) => {
    notifState[source] = list
    notifications.value = [...notifState.personal, ...notifState.admin]
        .sort((a, b) => {
            const tA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
            const tB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
            return tB - tA
        })
}

const markAsRead = async (notif) => {
    const path = notif._source === 'personal' 
        ? `users/${user.value.uid}/notifications` 
        : 'notifications'
    await updateDoc(doc($db, path, notif.id), { read: true })
}

const markAllAsRead = async () => {
    const unread = notifications.value.filter(n => !n.read)
    const batch = writeBatch($db)
    unread.forEach(n => {
        const path = n._source === 'personal' 
            ? `users/${user.value.uid}/notifications` 
            : 'notifications'
        batch.update(doc($db, path, n.id), { read: true })
    })
    await batch.commit()
}

// Helpers (duplicated from Bell, could extract to composable but keeping simple)
const getTypeIcon = (type) => {
    switch (type) {
        case 'brand_deal': return Briefcase
        case 'giveaway': return Gift
        case 'alert': return AlertTriangle
        case 'success': return Check
        default: return Zap
    }
}
const getTypeStyles = (type) => {
    switch (type) {
        case 'brand_deal': return { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400' }
        case 'giveaway': return { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400' }
        case 'alert': return { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' }
        case 'success': return { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' }
        default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' }
    }
}
const formatTime = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
