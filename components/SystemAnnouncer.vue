<template>
    <div class="pointer-events-none flex flex-col items-center">
        <!-- Banners (In Flow - Pushes content down) -->
        <div class="w-full relative z-[90]"> 
            <TransitionGroup name="slide-down">
                <div 
                    v-for="msg in activeBanners" 
                    :key="msg.id"
                    class="w-full pointer-events-auto shadow-md"
                    :class="getBannerClass(msg.type)"
                >
                    <div class="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
                        <div class="flex items-center gap-2 flex-1 min-w-0">
                            <component :is="getIcon(msg.type)" class="w-4 h-4 shrink-0" />
                            <span class="break-words leading-tight">{{ msg.content }}</span>
                        </div>
                        <!-- Allow closing if specified, or just static -->
                        <button v-if="msg.dismissible" @click="dismiss(msg.id)" class="shrink-0 p-1 hover:bg-black/10 rounded-full transition">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </TransitionGroup>
        </div>

        <!-- Toasts (Fixed - Floating Overlay) -->
        <div class="fixed top-20 right-4 z-[100] flex flex-col gap-2 items-end w-full max-w-sm pointer-events-none">
             <TransitionGroup name="fade-scale">
                <div 
                    v-for="msg in activeToasts" 
                    :key="msg.id"
                    class="pointer-events-auto w-full bg-white dark:bg-zinc-800 border-l-4 rounded-r-xl shadow-xl p-4 flex items-start gap-3"
                    :class="[
                        msg.cardTheme === 'neutral' ? 'border-gray-500' :
                        msg.type === 'error' ? 'border-red-600' :
                        msg.type === 'success' ? 'border-green-600' :
                        'border-blue-600'
                    ]"
                >
                     <div class="shrink-0 mt-0.5">
                        <component :is="getIcon(msg.type)" class="w-5 h-5" :class="[
                            msg.cardTheme === 'neutral' ? 'text-gray-600 dark:text-gray-400' :
                            msg.type === 'error' ? 'text-red-600' :
                            msg.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                        ]" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-sm mb-0.5 text-gray-900 dark:text-white" v-if="msg.title">{{ msg.title }}</h4>
                        <!-- Allow newlines in content -->
                        <p class="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line">{{ msg.content }}</p>
                    </div>
                    <button @click="dismiss(msg.id)" class="shrink-0 hover:opacity-70 transition p-1">
                        <X class="w-4 h-4" />
                    </button>
                </div>
             </TransitionGroup>
        </div>
    </div>
</template>

<script setup>
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { AlertCircle, AlertTriangle, Info, CheckCircle, X, Megaphone } from 'lucide-vue-next'

const { $db } = useNuxtApp()
const messages = ref([])

// Dismissed local state (persisted)
const dismissedIds = ref(new Set())

const activeMessages = computed(() => {
    return messages.value.filter(m => !dismissedIds.value.has(m.id))
})

const activeBanners = computed(() => activeMessages.value.filter(m => {
    // Check if expired
    if (m.expiresAt && new Date() > m.expiresAt.toDate()) return false
    return m.style === 'banner'
}))
const activeToasts = computed(() => activeMessages.value.filter(m => m.style === 'toast'))

// Load dismissed IDs from local storage on mount
onMounted(() => {
    try {
        const stored = localStorage.getItem('dismissed_messages')
        if (stored) {
            const ids = JSON.parse(stored)
            ids.forEach(id => dismissedIds.value.add(id))
        }
    } catch (e) {
        // quiet fail
    }

    const q = query(
        collection($db, 'system_messages'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
    )
    
    onSnapshot(q, (snap) => {
        messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }, (error) => {
        console.error("SystemAnnouncer snapshot error:", error)
    })
})

const dismiss = (id) => {
    dismissedIds.value.add(id)
    // Persist
    try {
        const arr = Array.from(dismissedIds.value) // Limit size?
        localStorage.setItem('dismissed_messages', JSON.stringify(arr))
    } catch (e) {}
}

const getIcon = (type) => {
    switch (type) {
        case 'error': return AlertCircle
        case 'warning': return AlertTriangle
        case 'success': return CheckCircle
        case 'announcement': return Megaphone
        default: return Info
    }
}

const getBannerClass = (type) => {
    switch (type) {
        case 'error': return 'bg-red-600 text-white'
        case 'warning': return 'bg-amber-500 text-black'
        case 'success': return 'bg-green-600 text-white'
        case 'announcement': return 'bg-indigo-600 text-white'
        default: return 'bg-blue-600 text-white'
    }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
}

.text-contrast {
    text-shadow: 0 0 1px rgba(255, 255, 255, 0.4), 0 0 0 rgba(255, 255, 255, 0.2); 
}
:global(.dark) .text-contrast {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
