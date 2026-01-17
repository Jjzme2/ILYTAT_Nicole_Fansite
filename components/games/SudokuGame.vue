<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="mb-6 text-center">
      <h3 class="text-xl font-bold font-serif text-text">SUDOKU</h3>
      <p class="text-sm text-muted">Difficulty: Easy</p>
    </div>

    <!-- Board -->
    <div class="grid grid-cols-9 gap-px bg-border border-2 border-primary mb-6">
        <template v-for="(row, rIndex) in grid" :key="rIndex">
            <input 
                v-for="(cell, cIndex) in row" 
                :key="`${rIndex}-${cIndex}`"
                type="text"
                maxlength="1"
                class="w-8 h-8 md:w-10 md:h-10 text-center text-sm md:text-lg bg-surface focus:bg-primary/20 focus:text-primary outline-none transition"
                :class="[
                   rIndex % 3 === 2 && rIndex !== 8 ? 'border-b-2 border-b-border' : '',
                   cIndex % 3 === 2 && cIndex !== 8 ? 'border-r-2 border-r-border' : '',
                   cell.fixed ? 'font-bold text-text cursor-default' : 'text-primary'
                ]"
                :value="cell.val"
                :readonly="cell.fixed"
                @input="e => updateCell(rIndex, cIndex, e.target.value)"
            />
        </template>
    </div>

    <!-- Controls -->
    <div class="flex gap-4">
        <button @click="checkSolution" class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition">
            Check
        </button>
        <button @click="newGame" class="px-6 py-2 bg-surface border border-border rounded-lg text-sm font-bold hover:bg-white/5 transition">
            New Game
        </button>
    </div>
  </div>
</template>

<script setup>
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const toast = useToast()

// A simple solved board to permute
const BASE_SOLUTION = [
    [1,2,3,4,5,6,7,8,9],
    [4,5,6,7,8,9,1,2,3],
    [7,8,9,1,2,3,4,5,6],
    [2,3,1,5,6,4,8,9,7],
    [5,6,4,8,9,7,2,3,1],
    [8,9,7,2,3,1,5,6,4],
    [3,1,2,6,4,5,9,7,8],
    [6,4,5,9,7,8,3,1,2],
    [9,7,8,3,1,2,6,4,5]
]

// Grid State: { val: string, fixed: boolean }
const grid = ref([])
const solution = ref([])

const newGame = () => {
    // 1. Copy Base
    let board = JSON.parse(JSON.stringify(BASE_SOLUTION))
    
    // 2. Shuffle Rows within Bands (Rows 0-2, 3-5, 6-8)
    for (let i = 0; i < 9; i += 3) {
       const band = board.slice(i, i+3)
       // Shuffle band
       for (let j = band.length - 1; j > 0; j--) {
           const k = Math.floor(Math.random() * (j + 1));
           [band[j], band[k]] = [band[k], band[j]];
       }
       // Put back
       for (let r = 0; r < 3; r++) board[i+r] = band[r]
    }

    // 3. Shuffle Columns within Bands (Cols 0-2, 3-5, 6-8)
    // Transpose -> Shuffle Rows -> Transpose back
    const transpose = (matrix) => matrix[0].map((col, i) => matrix.map(row => row[i]));
    board = transpose(board)
    for (let i = 0; i < 9; i += 3) {
       const band = board.slice(i, i+3)
       for (let j = band.length - 1; j > 0; j--) {
           const k = Math.floor(Math.random() * (j + 1));
           [band[j], band[k]] = [band[k], band[j]];
       }
       for (let r = 0; r < 3; r++) board[i+r] = band[r]
    }
    board = transpose(board)

    // Store solution
    solution.value = board

    // 4. Create Masked Grid
    grid.value = board.map(row => row.map(val => {
        // 50% chance to hide
        const hide = Math.random() > 0.4
        return {
            val: hide ? '' : val,
            fixed: !hide
        }
    }))
}

const updateCell = (r, c, val) => {
    // Allow only 1-9
    const num = val.replace(/[^1-9]/g, '').slice(0, 1)
    grid.value[r][c].val = num
}

const checkSolution = () => {
    let correct = true
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (parseInt(grid.value[r][c].val) !== solution.value[r][c]) {
                correct = false
            }
        }
    }

    if (correct) {
        toast.success("Solved! Genius!")
        saveScore()
    } else {
        toast.error("Not quite right. Keep trying!")
    }
}

const saveScore = async () => {
    if (!user.value) return
    try {
        await addDoc(collection($db, 'users', user.value.uid, 'scores'), {
            gameId: 'sudoku',
            score: 1, // 1 solve
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.error("Error saving score", e)
    }
}

onMounted(newGame)
</script>
