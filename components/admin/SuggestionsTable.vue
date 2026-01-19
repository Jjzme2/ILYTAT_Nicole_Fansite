<template>
    <div class="bg-surface rounded-2xl shadow-sm border border-border overflow-x-auto">
        <table class="w-full text-left min-w-[700px]">
            <thead class="bg-surface/50 border-b border-border">
                <tr>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">User</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Type</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider w-1/3">Content</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Date</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <tr v-if="suggestions.length === 0">
                    <td colspan="5" class="p-8 text-center text-muted">No suggestions found.</td>
                </tr>
                <tr v-for="s in suggestions" :key="s.id" class="hover:bg-background/50 transition">
                    <td class="p-4 text-sm font-medium">
                            <div>{{ s.userEmail?.split('@')[0] }}</div>
                            <div class="text-[10px] text-muted font-mono">{{ s.userId }}</div>
                    </td>
                    <td class="p-4 text-xs badge"><span class="bg-secondary/10 text-secondary px-2 py-1 rounded font-bold uppercase">{{ s.type }}</span></td>
                    <td class="p-4 text-sm text-text leading-relaxed">{{ s.content }}</td>
                    <td class="p-4 text-xs text-muted">{{ s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'Just now' }}</td>
                    <td class="p-4 text-right flex justify-end gap-2">
                        <button 
                            @click="$emit('toggleFlag', s)" 
                            class="p-2 rounded-lg transition"
                            :class="s.isFlagged ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-surface hover:bg-red-50 text-muted hover:text-red-500'"
                            title="Flag for attention"
                        >
                            <Flag class="w-4 h-4" :fill="s.isFlagged ? 'currentColor' : 'none'" />
                        </button>
                        <button 
                            @click="$emit('reply', s)" 
                            class="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                            title="Send Notification Reply"
                        >
                            <Reply class="w-4 h-4" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { Flag, Reply } from 'lucide-vue-next'

defineProps({
    suggestions: Array
})
</script>
