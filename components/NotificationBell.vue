<template>
    <div class="relative">
        <button 
            @click="togglePanel" 
            class="relative p-2 text-muted hover:text-primary transition rounded-lg hover:bg-surface"
            :aria-label="unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'"
        >
            <Bell class="w-5 h-5" />
            <span 
                v-if="unreadCount > 0" 
                class="absolute top-0 left-0 -translate-x-1 -translate-y-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-red-500/30"
            >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>

        <!-- Backdrop for mobile -->
        <Transition name="fade">
            <div 
                v-if="isOpen" 
                class="md:hidden fixed inset-0 bg-black/50 z-40"
                @click="isOpen = false"
            ></div>
        </Transition>

        <!-- Panel -->
        <Transition name="fade-slide">
            <div 
                v-if="isOpen" 
                ref="panelRef"
                class="
                    notification-panel
                    fixed z-50
                    inset-x-4 bottom-4 
                    md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:bottom-8
                    max-h-[60vh]
                    bg-white dark:bg-gray-900 
                    border border-gray-200 dark:border-gray-700 
                    rounded-2xl shadow-2xl overflow-hidden
                "
            >
                <!-- Header -->
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-base">Notifications</h3>
                        <p v-if="debugMode" class="text-[10px] text-gray-400 font-mono">
                            {{ notifications.length }} total • {{ unreadCount }} unread
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            v-if="unreadCount > 0" 
                            @click="markAllAsRead" 
                            class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                        >
                            Mark all read
                        </button>
                        <button
                            @click="isOpen = false"
                            class="md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            aria-label="Close notifications"
                        >
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <!-- Debug info panel (toggled by double-clicking header) -->
                <div 
                    v-if="debugMode" 
                    class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-xs font-mono"
                >
                    <div class="text-yellow-800 dark:text-yellow-200 font-bold mb-1">🐛 Debug Mode</div>
                    <div class="text-yellow-700 dark:text-yellow-300 space-y-0.5">
                        <p>isAdmin: {{ isAdmin }}</p>
                        <p>isCreator: {{ isCreator }}</p>
                        <p>Loading: {{ loading }}</p>
                        <p>Firebase connected: {{ !!$db }}</p>
                    </div>
                </div>

                <!-- Content -->
                <div class="overflow-y-auto max-h-[50vh] md:max-h-80">
                    <!-- Loading State -->
                    <div v-if="loading" class="p-8 text-center">
                        <div class="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Loading notifications...</p>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="unreadNotifications.length === 0" class="p-8 text-center">
                        <BellOff class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p class="text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                        <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">Check the inbox for older messages.</p>
                        <NuxtLink to="/notifications" @click="isOpen = false" class="inline-block mt-4 text-primary text-sm font-bold hover:underline">
                            View History
                        </NuxtLink>
                    </div>

                    <!-- Notification List -->
                    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
                        <div 
                            v-for="notif in unreadNotifications" 
                            :key="notif.id"
                            @click="handleNotificationClick(notif)"
                            class="notification-item p-4 cursor-pointer transition-all duration-200"
                            :class="[
                                !notif.read 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30' 
                                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                            ]"
                        >
                            <div class="flex items-start gap-3">
                                <!-- Icon -->
                                <div 
                                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                    :class="getTypeStyles(notif.type).bg"
                                >
                                    <component 
                                        :is="getTypeIcon(notif.type)" 
                                        class="w-5 h-5" 
                                        :class="getTypeStyles(notif.type).text" 
                                    />
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <p 
                                        class="text-sm font-semibold leading-tight mb-1"
                                        :class="!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'"
                                    >
                                        {{ notif.title }}
                                    </p>
                                    <p 
                                        class="text-sm leading-relaxed"
                                        :class="!notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'"
                                    >
                                        {{ notif.message }}
                                    </p>
                                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                                        <span class="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        {{ formatTime(notif.createdAt) }}
                                    </p>
                                </div>

                                <!-- Unread indicator -->
                                <div 
                                    v-if="!notif.read" 
                                    class="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-1 ring-2 ring-indigo-200 dark:ring-indigo-800"
                                ></div>
                            </div>

                            <!-- Debug info per notification -->
                            <div v-if="debugMode" class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono text-gray-500">
                                ID: {{ notif.id.slice(0, 8) }}... | Type: {{ notif.type }} | Read: {{ notif.read }}
                            </div>
                        </div>
                    </div>
                        </div>


                <div class="p-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-200 dark:border-gray-700">
                    <NuxtLink to="/notifications" @click="isOpen = false" class="text-xs font-bold text-primary hover:underline">
                        View All Notifications
                    </NuxtLink>
                </div>

                <!-- Footer with debug toggle -->
                <div class="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <button 
                        @click.stop="debugMode = !debugMode"
                        class="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-mono px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        :aria-label="debugMode ? 'Disable debug mode' : 'Enable debug mode'"
                    >
                        {{ debugMode ? '🐛 Debug ON' : '🔧' }}
                    </button>
                    <button @click="fetchNotifications" class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        ↻ Refresh
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { Bell, BellOff, Briefcase, AlertTriangle, Gift, Zap, Check, X } from 'lucide-vue-next'
import { collection, query, orderBy, getDocs, doc, updateDoc, where, writeBatch, onSnapshot, limit } from 'firebase/firestore'
import { onClickOutside } from '@vueuse/core'

const { $db } = useNuxtApp()
const { isAdmin, isCreator, user } = useAuth() // Ensure 'user' is destructured

const isOpen = ref(false)
const loading = ref(false)
const notifications = ref([])
const panelRef = ref(null)
const debugMode = ref(false)

// Debug logger helper
const debugLog = (label, data) => {
    if (process.dev || debugMode.value) {
        console.log(`%c[NotificationBell] ${label}`, 'color: #8B5CF6; font-weight: bold;', data)
    }
}

onClickOutside(panelRef, () => {
    isOpen.value = false
})


const unreadNotifications = computed(() => notifications.value.filter(n => !n.read))
const unreadCount = computed(() => unreadNotifications.value.length)

const togglePanel = () => {
    isOpen.value = !isOpen.value
    debugLog('Panel toggled', { isOpen: isOpen.value, notificationCount: notifications.value.length })
}

// Real-time listener
const setupListener = () => {
    debugLog('Setting up listeners', { isAdmin: isAdmin.value, isCreator: isCreator.value, uid: user.value?.uid })
    
    // 1. Personal Notifications (Everyone)
    if (user.value?.uid) {
        const userQ = query(
            collection($db, 'users', user.value.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50) // Limit to 50 latest to prevent unbounded reads
        )
        onSnapshot(userQ, (snap) => {
            const personalNotifs = snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'personal' }))
            mergeNotifications(personalNotifs, 'personal')
        })
    }

    // 2. Admin/Creator Global Notifications
    if (isAdmin.value || isCreator.value) {
        const adminQ = query(
            collection($db, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50) // Limit to 50 latest to prevent unbounded reads
        )
        onSnapshot(adminQ, (snap) => {
            const adminNotifs = snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'admin' }))
            mergeNotifications(adminNotifs, 'admin')
        })
    }
}

const notifState = reactive({
    personal: [],
    admin: []
})

const mergeNotifications = (newItems, source) => {
    notifState[source] = newItems
    // Combine and sort by date descending
    notifications.value = [...notifState.personal, ...notifState.admin]
        .sort((a, b) => {
            const tA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
            const tB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
            return tB - tA
        })
}

onMounted(() => {
    debugLog('Component mounted', { db: !!$db })
    setupListener()
})

const markAllAsRead = async () => {
    const unread = notifications.value.filter(n => !n.read)
    if (unread.length === 0) return

    debugLog('Marking all as read', { count: unread.length })
    
    const batch = writeBatch($db)
    
    unread.forEach(n => {
        if (n._source === 'personal') {
            batch.update(doc($db, 'users', user.value.uid, 'notifications', n.id), { read: true })
        } else {
             // Only admins can mark global admin alerts as read efficiently, 
             // though technically this marks it read for EVERYONE which might be intended for "tasks" but bad for "alerts".
             // For now, assuming admin alerts are shared state.
            batch.update(doc($db, 'notifications', n.id), { read: true })
        }
    })
    await batch.commit()
    debugLog('All marked as read', 'Success')
}

const handleNotificationClick = async (notif) => {
    debugLog('Notification clicked', { id: notif.id, title: notif.title, read: notif.read })
    
    // Mark as read
    if (!notif.read) {
        const collectionPath = notif._source === 'personal' 
            ? `users/${user.value.uid}/notifications` 
            : 'notifications'
            
        await updateDoc(doc($db, collectionPath, notif.id), { read: true })
        debugLog('Marked as read', { id: notif.id })
    }

    // Navigate if action URL
    if (notif.actionUrl) {
        debugLog('Navigating to', notif.actionUrl)
        navigateTo(notif.actionUrl)
        isOpen.value = false
    }
}

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
</script>

<style scoped>
.notification-panel {
    box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(0, 0, 0, 0.05);
}

.notification-item {
    border-left: 3px solid transparent;
}

.notification-item:hover {
    border-left-color: var(--color-primary, #8B5CF6);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(20px) translateX(0); /* On mobile */
}

@media (min-width: 768px) {
    .fade-slide-enter-from,
    .fade-slide-leave-to {
        transform: translateY(20px) translateX(-50%); /* Preserve centering on desktop */
    }
}
</style>
