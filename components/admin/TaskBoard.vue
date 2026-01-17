<template>
    <div>
        <header class="mb-10 flex justify-between items-center">
            <div>
                 <h2 class="text-3xl font-serif text-text mb-2">Dev Board</h2>
                <p class="text-muted">Track features, bugs, and tasks for the developer.</p>
            </div>
            <div class="flex gap-3">
                <button @click="copyBoard" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-bold flex items-center gap-2 transition">
                    <Clipboard class="w-4 h-4" />
                    Copy Markdown
                </button>
                <button @click="fetchTasks" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text">Refresh</button>
            </div>
        </header>

        <!-- New Task Form -->
        <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-8">
            <form @submit.prevent="submitTask" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-2">
                         <label class="block text-xs font-bold text-muted mb-1 uppercase">Task Title</label>
                         <input v-model="newTask.title" type="text" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="e.g. Fix login bug" required>
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Type</label>
                         <select v-model="newTask.type" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none">
                            <option value="feature">Feature</option>
                            <option value="bug">Bug</option>
                            <option value="design">Design</option>
                            <option value="chore">Chore</option>
                        </select>
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Section</label>
                         <select v-model="newTask.section" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none">
                            <option value="Active Tasks (Engineering)">Active Tasks</option>
                            <option value="Inbox / New Ideas">Inbox / Ideas</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Subsection / Component</label>
                         <input v-model="newTask.subsection" type="text" list="subsections" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="e.g. Monetization">
                         <datalist id="subsections">
                             <option value="Branding & Accessibility"></option>
                             <option value="Monetization & Design"></option>
                             <option value="Admin & Content"></option>
                             <option value="General"></option>
                         </datalist>
                    </div>
                     <div>
                         <label class="block text-xs font-bold text-muted mb-1 uppercase">Goal (Optional)</label>
                         <input v-model="newTask.goals" type="text" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="e.g. 'Make it pop'">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-muted mb-1 uppercase">Description</label>
                    <textarea v-model="newTask.description" rows="2" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="Details..."></textarea>
                </div>

                 <div class="flex justify-end">
                     <button type="submit" :disabled="uploading" class="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition">
                        {{ uploading ? 'Adding...' : 'Add Task' }}
                    </button>
                </div>
            </form>
        </div>

        <!-- Task List -->
        <div class="space-y-4">
             <div v-for="task in tasks" :key="task.id" class="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center justify-between group">
                <div class="flex items-center gap-4 flex-1">
                    <div :class="{
                        'bg-blue-100 text-blue-700': task.type === 'feature',
                        'bg-red-100 text-red-700': task.type === 'bug',
                        'bg-gray-100 text-gray-700': task.type === 'chore',
                         'bg-purple-100 text-purple-700': task.type === 'design'
                    }" class="p-2 rounded-lg shrink-0">
                        <Component :is="getIcon(task.type)" class="w-5 h-5" />
                    </div>
                    <div>
                        <h4 class="font-bold text-lg text-text">{{ task.title }}</h4>
                        <p v-if="task.description" class="text-sm text-text/80 mb-1 leading-snug max-w-2xl">{{ task.description }}</p>
                         <div class="flex items-center gap-2 text-xs text-muted">
                            <span :class="getPriorityColor(task.priority)" class="capitalize">{{ task.priority }} Priority</span>
                            <span>•</span>
                            <span class="capitalize">{{ task.status }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button v-if="task.status !== 'done'" @click="updateTaskStatus(task.id, 'done')" class="p-2 hover:bg-green-50 text-green-600 rounded-lg transition" title="Mark Done">
                        <Check class="w-5 h-5" />
                    </button>
                    <button @click="updateTaskStatus(task.id, 'in_progress')" class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="Mark In Progress">
                        <RefreshCw class="w-5 h-5" />
                    </button>
                    <button @click="archiveTask(task)" class="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition" title="Archive">
                        <Archive class="w-5 h-5" />
                    </button>
                    <button @click="deleteTask(task.id)" class="p-2 hover:bg-red-50 text-red-600 rounded-lg transition opacity-0 group-hover:opacity-100">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div v-if="tasks.length === 0" class="text-center py-20 bg-surface rounded-2xl border border-border">
                <Clipboard class="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p class="text-muted">No active tasks. Good job!</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Clipboard, Zap, Bug, Hammer, Check, RefreshCw, Archive, Trash2, Palette } from 'lucide-vue-next'
import { generateMarkdown } from '~/utils/taskMarkdown'

const toast = useToast()
const { 
    tasks, 
    newTask, 
    uploading, 
    fetchTasks, 
    submitTask, 
    updateTaskStatus, 
    archiveTask, 
    deleteTask,
    getPriorityColor 
} = useTaskBoard()

// Icons helper
const getIcon = (type: string) => {
    switch(type) {
        case 'feature': return Zap
        case 'bug': return Bug
        case 'design': return Palette
        default: return Hammer
    }
}

const copyBoard = async () => {
    try {
        const md = generateMarkdown(tasks.value)
        await navigator.clipboard.writeText(md)
        toast.success('Tasks copied to clipboard!')
    } catch (e) {
        console.error(e)
        // Fallback or error
        toast.error('Failed to copy')
    }
}

// Initial fetch
onMounted(() => {
    fetchTasks()
})
</script>
