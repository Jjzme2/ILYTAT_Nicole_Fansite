<template>
  <div class="flex flex-col items-center justify-center p-6 h-full text-center">
    <h3 class="text-2xl font-bold font-serif text-text mb-2">BUTTON MASHER</h3>
    <p class="text-muted mb-8 text-sm">How fast can you click?</p>

    <div class="flex gap-12 mb-8">
        <div>
            <span class="block text-xs uppercase font-bold text-muted">Clicks</span>
            <span class="text-4xl font-black text-primary">{{ clicks }}</span>
        </div>
        <div>
            <span class="block text-xs uppercase font-bold text-muted">Time</span>
            <span class="text-4xl font-black text-text font-mono">{{ timeLeft }}s</span>
        </div>
    </div>

    <button 
        @click="handleClick"
        :disabled="timeLeft === 0"
        class="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-black text-2xl shadow-[0_0_50px_rgba(217,70,239,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-4 border-white/10"
    >
        <span v-if="!gameStarted && timeLeft > 0">START</span>
        <span v-else-if="timeLeft > 0">MASH!</span>
        <span v-else>DONE</span>
    </button>

    <div v-if="timeLeft === 0" class="mt-8 animate-in fade-in slide-in-from-bottom-4">
        <p class="text-xl font-bold mb-4">Time's Up! You got {{ clicks }} clicks.</p>
        <button @click="resetGame" class="px-6 py-2 bg-surface border border-border rounded-lg hover:border-primary transition font-bold">Try Again</button>
    </div>

  </div>
</template>

<script setup>
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()

const clicks = ref(0)
const timeLeft = ref(10)
const gameStarted = ref(false)
let timer = null

const handleClick = () => {
    if (timeLeft.value === 0) return

    if (!gameStarted.value) {
        startGame()
    }
    
    clicks.value++
    // Visual feedback could go here (particles etc)
}

const startGame = () => {
    gameStarted.value = true
    timer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
            endGame()
        }
    }, 1000)
}

const endGame = () => {
    clearInterval(timer)
    saveScore()
    toast.info(`Finished! ${clicks.value} clicks in 10s.`)
}

const resetGame = () => {
    clicks.value = 0
    timeLeft.value = 10
    gameStarted.value = false
}

const saveScore = async () => {
    if (!user.value) return
    try {
        await addDoc(collection($db, 'users', user.value.uid, 'scores'), {
            gameId: 'clicker',
            score: clicks.value,
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.error("Error saving score", e)
    }
}
</script>
