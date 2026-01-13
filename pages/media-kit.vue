<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="py-12 px-6 text-center border-b border-border relative">
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-text mb-4">{{ config.meta.name }}</h1>
        <p class="text-muted tracking-widest uppercase text-sm">{{ config.meta.tagline }}</p>
    </header>

    <div class="max-w-4xl mx-auto px-6 py-12">
        
        <!-- Bio -->
        <section class="grid md:grid-cols-2 gap-12 items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="aspect-[3/4] bg-surface rounded-2xl overflow-hidden shadow-lg relative group">
                 <img 
                    v-if="displayData.photoUrl" 
                    :src="displayData.photoUrl" 
                    class="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    alt="Creator"
                >
                 <!-- Placeholder for Hero Image -->
                 <div v-else class="absolute inset-0 flex items-center justify-center text-muted bg-background/50">
                    <div class="text-center">
                        <ImageIcon class="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <span class="text-sm">No Photo Set</span>
                    </div>
                 </div>
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-6 text-text">About Me</h2>
                <p class="text-muted leading-relaxed mb-6 whitespace-pre-wrap">{{ displayData.bio }}</p>
                <div class="space-y-4">
                    <div v-if="displayData.location" class="flex items-center gap-3">
                        <MapPin class="w-5 h-5 text-primary" />
                        <span class="text-text">{{ displayData.location }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats (Dynamic Platforms) -->
        <section v-for="(stats, platform) in displayData.platforms" :key="platform" class="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div class="flex items-center gap-3 mb-8 justify-center">
                <!-- Branding Icons -->
                 <div v-if="platform === 'tiktok'" class="bg-black text-white p-2 rounded-full">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                 </div>
                <h3 class="text-2xl font-bold text-text capitalize">{{ platform }} Statistics</h3>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div v-for="(value, key) in stats" :key="key" class="p-6 bg-surface border border-border rounded-xl text-center hover:border-primary transition group">
                    <h3 class="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition">{{ value }}</h3>
                    <p class="text-[10px] uppercase tracking-wider text-muted font-bold">{{ formatStatLabel(key) }}</p>
                </div>
            </div>
        </section>

        <!-- Fallback if no platforms -->
        <section v-if="!displayData.platforms || Object.keys(displayData.platforms).length === 0" class="mb-20 text-center text-muted">
            <p>No statistics available yet.</p>
        </section>

        <!-- Access -->
        <section class="mb-20">
             <div class="bg-surface border border-border p-10 rounded-2xl text-center">
                <h2 class="text-2xl font-bold mb-4 text-text">Partner with {{ config.meta.copyright }}</h2>
                <p class="text-muted mb-8 max-w-xl mx-auto">Available for brand deals, sponsored content, and exclusive collaborations.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a :href="'mailto:' + config.socials.email" class="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                        Contact Management
                    </a>
                </div>
             </div>
        </section>

    </div>
  </div>
</template>

<script setup>
import { MapPin, Image as ImageIcon } from 'lucide-vue-next'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const config = useAppConfig()
const { $db } = useNuxtApp()

useHead({
    title: `Media Kit | ${config.meta.name}`
})

// Default Data
const defaultData = {
    bio: `A short professional bio goes here. Highlight your brand, your audience, and what makes your content unique.`,
    location: '',
    photoUrl: '',
    platforms: {}
}

const formatStatLabel = (key) => {
    // Convert snake_case to Title Case
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Fetch Latest Media Kit
const { data: mediaKit } = await useAsyncData('mediaKit', async () => {
    try {
        const q = query(collection($db, 'media_kits'), orderBy('createdAt', 'desc'), limit(1))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
            return snapshot.docs[0].data()
        }
    } catch (e) {
        console.error('Error fetching media kit:', e)
    }
    return defaultData
})

const displayData = computed(() => mediaKit.value || defaultData)
</script>
