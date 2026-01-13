<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="py-12 px-6 text-center border-b border-border relative">
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-text mb-4">{{ config.meta.name }}</h1>
        <p class="text-muted tracking-widest uppercase text-sm">{{ config.meta.tagline }}</p>
    </header>

    <div class="max-w-4xl mx-auto px-6 py-12">
        
        <!-- Bio -->
        <section class="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div class="aspect-[3/4] bg-surface rounded-2xl overflow-hidden shadow-lg relative">
                 <!-- Placeholder for Hero Image -->
                 <div class="absolute inset-0 flex items-center justify-center text-muted bg-background/50">
                    <span class="text-sm">Hero Image</span>
                 </div>
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-6 text-text">About Me</h2>
                <p class="text-muted leading-relaxed mb-6 whitespace-pre-wrap">{{ displayData.bio }}</p>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <MapPin class="w-5 h-5 text-primary" />
                        <span class="text-text">Los Angeles, CA</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div class="p-6 bg-surface border border-border rounded-xl text-center">
                <h3 class="text-3xl font-bold text-primary mb-1">{{ displayData.stats.followers }}</h3>
                <p class="text-xs uppercase tracking-wider text-muted">Followers</p>
            </div>
            <div class="p-6 bg-surface border border-border rounded-xl text-center">
                <h3 class="text-3xl font-bold text-primary mb-1">{{ displayData.stats.engagement }}</h3>
                <p class="text-xs uppercase tracking-wider text-muted">Engagement</p>
            </div>
            <div class="p-6 bg-surface border border-border rounded-xl text-center">
                <h3 class="text-3xl font-bold text-primary mb-1">{{ displayData.stats.impressions }}</h3>
                <p class="text-xs uppercase tracking-wider text-muted">Impressions</p>
            </div>
            <div class="p-6 bg-surface border border-border rounded-xl text-center">
                <h3 class="text-3xl font-bold text-primary mb-1">{{ displayData.stats.rank }}</h3>
                <p class="text-xs uppercase tracking-wider text-muted">Creator Rank</p>
            </div>
        </section>

        <!-- Gallery -->
        <section class="mb-20">
            <h2 class="text-2xl font-bold mb-8 text-center text-text">Recent Collaboration Styles</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="i in 6" :key="i" class="aspect-square bg-surface border border-border rounded-lg overflow-hidden relative group">
                     <div class="absolute inset-0 bg-background/50 animate-pulse" />
                     <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 text-white font-medium">
                        View
                     </div>
                </div>
            </div>
        </section>

        <!-- Access -->
        <section class="mb-20">
             <div class="bg-surface border border-border p-10 rounded-2xl text-center">
                <h2 class="text-2xl font-bold mb-4 text-text">Partner with {{ config.meta.copyright }}</h2>
                <p class="text-muted mb-8 max-w-xl mx-auto">Available for brand deals, sponsored content, and exclusive collaborations.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a :href="config.socials.email" class="px-8 py-3 bg-primary text-white font-bold rounded-full hover:opacity-90 transition">
                        Contact Management
                    </a>
                </div>
             </div>
        </section>

    </div>
  </div>
</template>

<script setup>
import { MapPin } from 'lucide-vue-next'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const config = useAppConfig()
const { $db } = useNuxtApp()

useHead({
    title: `Media Kit | ${config.meta.name}`
})

// Default Data
const defaultData = {
    bio: `A short professional bio goes here. Highlight your brand, your audience, and what makes your content unique. 
                    Focus on engagement, aesthetics, and the community you are building.`,
    stats: {
        followers: '150K+',
        engagement: '8.5%',
        impressions: '2M+',
        rank: 'Top 1%'
    }
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
