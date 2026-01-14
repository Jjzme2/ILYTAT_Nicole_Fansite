<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="mb-6 text-center">
      <h3 class="text-xl font-bold font-serif text-text">TIC TAC TOE</h3>
      <p class="text-sm text-muted">{{ status }}</p>
    </div>

    <!-- Board -->
    <div class="grid grid-cols-3 gap-2 bg-border p-2 rounded-xl mb-6">
        <button 
            v-for="(cell, index) in board" 
            :key="index"
            @click="makeMove(index)"
            :disabled="!!cell || !!winner"
            class="w-20 h-20 bg-surface rounded-lg flex items-center justify-center text-4xl font-black transition hover:bg-white/5 disabled:hover:bg-surface relative"
        >
            <span v-if="cell === 'X'" class="text-primary animate-in zoom-in duration-300">X</span>
            <span v-if="cell === 'O'" class="text-secondary animate-in zoom-in duration-300">O</span>
        </button>
    </div>

    <!-- Controls -->
    <div class="flex gap-4">
        <button @click="resetGame" class="px-6 py-2 bg-surface border border-border rounded-lg text-sm font-bold hover:bg-white/5 transition">
            Reset
        </button>
    </div>
  </div>
</template>

<script setup>
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()

const board = ref(Array(9).fill(null))
const xIsNext = ref(true)
const winner = ref(null)

const status = computed(() => {
    if (winner.value) return `Winner: ${winner.value}`
    if (board.value.every(cell => cell)) return "Draw!"
    return `Player: ${xIsNext.value ? 'X' : 'O'}`
})

const calculateWinner = (squares) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ]
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i]
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a]
        }
    }
    return null
}

const makeMove = (index) => {
    if (board.value[index] || winner.value) return

    board.value[index] = xIsNext.value ? 'X' : 'O'
    xIsNext.value = !xIsNext.value
    
    const w = calculateWinner(board.value)
    if (w) {
        winner.value = w
        if (w === 'X') saveWin() // Only save wins for Player X (User)
    } else if (!board.value.includes(null)) {
        // Draw
    } else {
        // AI Turn (Random) if O's turn
        if (!xIsNext.value) {
            setTimeout(makeAiMove, 500)
        }
    }
}

const makeAiMove = () => {
    if (winner.value) return
    const emptyIndices = board.value.map((val, idx) => val === null ? idx : null).filter(val => val !== null)
    if (emptyIndices.length > 0) {
        const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        makeMove(randomIdx)
    }
}

const resetGame = () => {
    board.value = Array(9).fill(null)
    xIsNext.value = true
    winner.value = null
}

const saveWin = async () => {
    if (!user.value) return
    try {
        await addDoc(collection($db, 'users', user.value.uid, 'scores'), {
            gameId: 'tictactoe',
            score: 1, // 1 win
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.error("Error saving score", e)
    }
}
</script>
