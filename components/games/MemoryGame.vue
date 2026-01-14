<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="mb-6 text-center">
      <h3 class="text-xl font-bold font-serif text-text">MEMORY MATCH</h3>
      <p class="text-sm text-muted">Moves: {{ moves }} | Pairs: {{ matches }} / 8</p>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-4 gap-2 md:gap-4 mb-6 perspective-1000">
        <button 
            v-for="(card, index) in cards" 
            :key="card.id"
            @click="flipCard(index)"
            :disabled="card.flipped || card.matched || disabling"
            class="w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-300 transform preserve-3d relative"
            :class="card.flipped || card.matched ? 'rotate-y-180' : ''"
        >
            <!-- Back (Hidden) -->
            <div 
                v-if="!card.flipped && !card.matched" 
                class="absolute inset-0 bg-surface border border-border rounded-xl flex items-center justify-center backface-hidden shadow-sm hover:bg-white/5"
            >
                <span class="text-2xl opacity-20">?</span>
            </div>
            
            <!-- Front (Shown) -->
            <div 
                v-else
                class="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center backface-hidden shadow-lg border border-white/20"
                style="transform: rotateY(180deg);"
            >
                <component :is="card.icon" class="w-8 h-8 text-white" />
            </div>
        </button>
    </div>

    <!-- Controls -->
    <button @click="initGame" class="px-6 py-2 bg-surface border border-border rounded-lg text-sm font-bold hover:bg-white/5 transition">
        Reset
    </button>
  </div>
</template>

<script setup>
import { 
    Ghost, Heart, Star, Zap, 
    Music, Video, Camera, Smile 
} from 'lucide-vue-next'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()

const ICONS = [Ghost, Heart, Star, Zap, Music, Video, Camera, Smile]
const cards = ref([])
const moves = ref(0)
const matches = ref(0)
const disabling = ref(false)
let firstCard = null
let secondCard = null

const initGame = () => {
    // Create pairs
    const deck = [...ICONS, ...ICONS]
        .sort(() => Math.random() - 0.5)
        .map((icon, index) => ({
            id: index,
            icon,
            flipped: false,
            matched: false
        }))
    
    cards.value = deck
    moves.value = 0
    matches.value = 0
    firstCard = null
    secondCard = null
    disabling.value = false
}

const flipCard = (index) => {
    if (disabling.value) return
    const card = cards.value[index]
    
    card.flipped = true

    if (!firstCard) {
        firstCard = { ...card, index }
    } else {
        secondCard = { ...card, index }
        moves.value++
        disabling.value = true
        checkForMatch()
    }
}

const checkForMatch = () => {
    // Compare icons (we can compare the component objects directly or names)
    // Since component objects are same ref, direct equality works
    if (firstCard.icon === secondCard.icon) {
        cards.value[firstCard.index].matched = true
        cards.value[secondCard.index].matched = true
        matches.value++
        resetTurn()
        
        if (matches.value === 8) {
            saveScore()
        }
    } else {
        setTimeout(() => {
            cards.value[firstCard.index].flipped = false
            cards.value[secondCard.index].flipped = false
            resetTurn()
        }, 1000)
    }
}

const resetTurn = () => {
    firstCard = null
    secondCard = null
    disabling.value = false
}

const saveScore = async () => {
    if (!user.value) return
    try {
        await addDoc(collection($db, 'users', user.value.uid, 'scores'), {
            gameId: 'memory',
            score: moves.value, // Lower is better
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.error("Error saving score", e)
    }
}

onMounted(initGame)
</script>

<style scoped>
.preserve-3d {
    transform-style: preserve-3d;
}
.backface-hidden {
    backface-visibility: hidden;
}
.rotate-y-180 {
    transform: rotateY(180deg);
}
</style>
