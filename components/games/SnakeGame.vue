<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="mb-4 text-center">
      <h3 class="text-xl font-bold font-serif text-text">SNAKE</h3>
      <p class="text-sm text-muted">Score: {{ score }} | High Score: {{ highScore }}</p>
    </div>

    <div class="relative group">
        <canvas 
            ref="canvas" 
            width="400" 
            height="400" 
            class="bg-black/10 dark:bg-black/50 border-2 border-primary rounded-xl shadow-[0_0_20px_rgba(var(--color-primary),0.2)]"
        ></canvas>
        
        <div v-if="gameOver" class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
            <h4 class="text-3xl font-black text-white mb-2">GAME OVER</h4>
            <p class="text-white/80 mb-6">Score: {{ score }}</p>
            <button @click="resetGame" class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:scale-105 transition">Play Again</button>
        </div>

        <div v-if="!gameRunning && !gameOver" class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
            <button @click="startGame" class="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2">
                <Play class="w-5 h-5" /> Start Game
            </button>
            <p class="text-white/70 text-xs mt-3">Use Arrow Keys to Move</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { Play } from 'lucide-vue-next'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()

const canvas = ref(null)
const ctx = computed(() => canvas.value?.getContext('2d'))

// Game State
const score = ref(0)
const highScore = ref(0)
const gameRunning = ref(false)
const gameOver = ref(false)

// Config
const gridSize = 20
const tileCount = 20
let velocity = { x: 0, y: 0 }
let snake = []
let food = { x: 15, y: 15 }
let gameInterval = null

// Controls
const handleKeydown = (e) => {
    // Prevent default scrolling for arrow keys if game is running
    if (gameRunning.value && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
    }

    if (!gameRunning.value) return

    switch(e.key) {
        case 'ArrowUp':
            if (velocity.y === 0) velocity = { x: 0, y: -1 }
            break
        case 'ArrowDown':
            if (velocity.y === 0) velocity = { x: 0, y: 1 }
            break
        case 'ArrowLeft':
            if (velocity.x === 0) velocity = { x: -1, y: 0 }
            break
        case 'ArrowRight':
            if (velocity.x === 0) velocity = { x: 1, y: 0 }
            break
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    // Load local high score
    const saved = localStorage.getItem('snake_highscore')
    if (saved) highScore.value = parseInt(saved)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (gameInterval) clearInterval(gameInterval)
})

const startGame = () => {
    gameRunning.value = true
    gameOver.value = false
    score.value = 0
    snake = [{ x: 10, y: 10 }]
    velocity = { x: 0, y: -1 } // Start moving up
    gameInterval = setInterval(update, 1000 / 10) // 10 FPS
}

const resetGame = () => {
    startGame()
}

const update = () => {
    // Move
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y }

    // Wall Collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame()
        return
    }

    // Self Collision
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            endGame()
            return
        }
    }

    snake.unshift(head)

    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        score.value += 10
        placeFood()
    } else {
        snake.pop()
    }

    draw()
}

const draw = () => {
    // Clear
    ctx.value.fillStyle = '#1a1a1a' // bg-black/something
    ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)

    // Snake
    ctx.value.fillStyle = '#d946ef' // Primary (Fuchsia-500 approx)
    for (let part of snake) {
        ctx.value.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2)
    }

    // Food
    ctx.value.fillStyle = '#ef4444' // Red
    ctx.value.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2)
}

const placeFood = () => {
    food.x = Math.floor(Math.random() * tileCount)
    food.y = Math.floor(Math.random() * tileCount)
    // Ensure not on snake
    for (let part of snake) {
        if (food.x === part.x && food.y === part.y) placeFood()
    }
}

const endGame = () => {
    gameRunning.value = false
    gameOver.value = true
    clearInterval(gameInterval)
    
    if (score.value > highScore.value) {
        highScore.value = score.value
        localStorage.setItem('snake_highscore', highScore.value)
        saveHighScore()
        toast.success(`New High Score: ${score.value}!`)
    }
}

const saveHighScore = async () => {
    if (!user.value) return
    try {
        await addDoc(collection($db, 'users', user.value.uid, 'scores'), {
            gameId: 'snake',
            score: score.value,
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.error("Error saving score", e)
    }
}
</script>
