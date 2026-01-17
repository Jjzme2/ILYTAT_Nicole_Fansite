export default defineEventHandler((event) => {
    const games = [
        {
            id: 'snake',
            title: 'SNAKE',
            description: 'The classic Nokia-era time waster.',
            component: 'SnakeGame',
            icon: 'Gamepad2'
        },
        {
            id: 'clicker',
            title: 'BUTTON MASHER',
            description: 'How fast can you click in 10 seconds?',
            component: 'ClickerGame',
            icon: 'MousePointerClick'
        },
        {
            id: 'tictactoe',
            title: 'TIC-TAC-TOE',
            description: 'The classic X vs O.',
            component: 'TicTacToe',
            icon: 'X'
        },
        {
            id: 'memory',
            title: 'MEMORY MATCH',
            description: 'Test your brain power.',
            component: 'MemoryGame',
            icon: 'Brain'
        },
        {
            id: 'sudoku',
            title: 'SUDOKU',
            description: 'Number puzzle logic.',
            component: 'SudokuGame',
            icon: 'Grid'
        }
    ]

    return {
        games
    }
})
