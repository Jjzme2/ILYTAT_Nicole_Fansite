<template>
  <div class="flex flex-col items-center justify-center p-8">
    
    <!-- The Cookie -->
    <div 
        v-if="!isOpen" 
        @click="openCookie" 
        class="cursor-pointer group relative transform transition hover:scale-105 active:scale-95 duration-200"
    >
        <!-- SVG Cookie Shape (Simplified Pacman-like style for now) -->
        <svg viewBox="0 0 100 100" class="w-48 h-48 drop-shadow-xl text-yellow-600 fill-current">
            <path d="M50 10 A40 40 0 1 0 50 90 A40 40 0 0 0 50 10 Z M50 50 L90 50" class="origin-center rotate-45" />
            <path d="M10,50 Q10,10 50,10 T90,50 T50,90 T10,50" fill="#EAB308" />
            <path d="M10,50 Q10,30 30,30 Q50,50 90,50 Q70,70 50,70 Q30,70 10,50" fill="#CA8A04" class="opacity-50" />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">Tap to Crack</span>
        </div>
    </div>

    <!-- The Fortune -->
    <div v-else class="animate-in zoom-in-50 fade-in duration-500 max-w-md text-center">
        <div class="bg-white text-black p-6 shadow-2xl skew-x-[-2deg] rotate-[1deg] border border-gray-200 font-serif leading-relaxed relative">
            <!-- Paper Texture overlay option -->
            <div class="text-xl md:text-2xl mb-4 text-[#d91b1b] font-bold">"{{ fortune.message }}"</div>
            
            <div v-if="fortune.luckyNumbers" class="border-t border-gray-300 pt-3 mt-4 flex justify-center gap-3 text-xs font-mono text-gray-500">
                <span>LUCKY NUMBERS:</span>
                <span v-for="num in fortune.luckyNumbers" :key="num" class="font-bold text-red-600">{{ num }}</span>
            </div>
        </div>

        <button @click="resetCookie" class="mt-8 text-sm text-muted hover:text-text font-bold uppercase tracking-widest transition">
            Open Another
        </button>
    </div>

  </div>
</template>

<script setup>
import { collection, getDocs, query, limit, where } from 'firebase/firestore'

const { $db } = useNuxtApp()
const isOpen = ref(false)
const fortune = ref({ message: 'Your future is bright.', luckyNumbers: [7, 21, 88] })

// Simple local fallback fortunes if DB is empty
const fallbacks = [
    { message: "A thrill of hope, the weary world rejoices.", luckyNumbers: [12, 25, 1] },
    { message: "You will discover a hidden talent today.", luckyNumbers: [3, 9, 14] },
    { message: "Happiness is right around the corner.", luckyNumbers: [5, 55, 2] },
    { message: "The best is yet to come.", luckyNumbers: [7, 77, 777] }
]

const openCookie = async () => {
    // 1. Fetch Random Fortune
    // Ideally we use a random ID query, but for small sets, fetching a random one from a known list is better.
    // Or just pick a random fallback for now if DB is empty.
    
    try {
        const q = query(collection($db, 'fortunes'), limit(20)) // Fetch a batch
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
            const docs = snapshot.docs
            const randomDoc = docs[Math.floor(Math.random() * docs.length)]
            fortune.value = randomDoc.data()
        } else {
            // Use fallback
            fortune.value = fallbacks[Math.floor(Math.random() * fallbacks.length)]
        }
    } catch (e) {
        console.error('Error fetching fortune:', e)
        fortune.value = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    }

    // 2. Animate
    isOpen.value = true
}

const resetCookie = () => {
    isOpen.value = false
    fortune.value = { message: '', luckyNumbers: [] }
}
</script>
