<template>
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <!-- Sub-Nav -->
        <div class="flex gap-1 mb-8 bg-surface p-1 rounded-xl border border-border inline-flex">
            <button @click="activeSubTab = 'tasks'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'tasks' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Dev Board</button>
            <button v-if="isDev" @click="activeSubTab = 'tools'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'tools' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Dev Tools</button>
            <button v-if="isDev" @click="activeSubTab = 'tests'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'tests' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">System Tests</button>
        </div>

        <div v-if="activeSubTab === 'tasks'">
            <AdminTaskBoard />
        </div>

        <!-- DEV TOOLS TAB -->
        <div v-if="isDev && activeSubTab === 'tools'">
            <AdminDevTools />
        </div>

        <!-- TESTS TAB -->
        <div v-if="isDev && activeSubTab === 'tests'">
             <AdminSystemTests />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const { user, isAdmin } = useAuth()
const isDev = computed(() => import.meta.dev || ['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email) || isAdmin.value)

const activeSubTab = ref('tasks')
</script>
