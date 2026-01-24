<template>
    <div class="bg-surface rounded-2xl shadow-sm border border-border overflow-x-auto">
        <table class="w-full text-left min-w-[700px]">
            <thead class="bg-surface/50 border-b border-border">
                <tr>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Email</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Role</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Subscriber</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Joined</th>
                    <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <tr v-for="u in users" :key="u.id" class="hover:bg-background/50">
                    <td class="p-4 font-medium text-text">
                        <div class="flex flex-col">
                            <span>{{ u.email }}</span>
                            <span class="text-[10px] text-muted font-mono">{{ u.id }}</span>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex flex-wrap gap-1 items-center">
                            <span 
                                v-for="r in (u.roles && u.roles.length ? u.roles : [u.role || 'user'])" 
                                :key="r" 
                                class="px-2 py-0.5 rounded text-[10px] uppercase font-bold border flex items-center gap-1 transition"
                                :class="getRoleBadgeClass(r)"
                            >
                                {{ r }}
                                <button @click="$emit('removeRole', u, r)" class="hover:text-red-600 rounded-full p-0.5 transition"><XCircle class="w-3 h-3"/></button>
                            </span>
                            
                            <!-- Quick Add Dropdown -->
                            <div class="relative group">
                                <button class="px-2 py-0.5 rounded-full border border-dashed border-muted text-muted hover:border-primary hover:text-primary transition flex items-center justify-center">
                                    <Plus class="w-3 h-3" />
                                </button>
                                <div class="absolute top-full left-0 mt-1 bg-surface border border-border shadow-xl rounded-xl p-1 hidden group-hover:grid z-50 w-32 animate-in fade-in slide-in-from-top-1">
                                    <button 
                                        v-for="opt in ['admin', 'creator', 'developer', 'user']" 
                                        :key="opt" 
                                        @click="$emit('addRole', u, opt)" 
                                        class="text-left px-3 py-2 text-xs font-medium hover:bg-background rounded-lg transition"
                                    >
                                        {{ opt }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4">
                        <span v-if="u.isSubscriber" class="text-green-500 font-bold flex items-center gap-1">
                            <Check class="w-4 h-4" /> Active
                        </span>
                        <span v-else class="text-muted text-xs">Free</span>
                    </td>
                    <td class="p-4 text-sm text-muted">{{ formatDate(u.createdAt) }}</td>
                    <td class="p-4 text-right">
                        <button 
                            @click="$emit('notify', u)" 
                            class="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition" 
                            title="Send Notification"
                        >
                            <Bell class="w-4 h-4" />
                        </button>
                    </td>
                </tr>
                <tr v-if="loading">
                    <td colspan="5" class="p-8 text-center text-muted">
                        <div class="flex items-center justify-center gap-2">
                            <Loader2 class="w-5 h-5 animate-spin" />
                            <span>Loading users...</span>
                        </div>
                    </td>
                </tr>
                <tr v-else-if="users.length === 0">
                    <td colspan="5" class="p-8 text-center text-muted">No users found.</td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination Footer -->
        <div class="p-4 border-t border-border flex justify-between items-center bg-surface">
            <span class="text-xs text-muted font-bold uppercase">Page {{ page }}</span>
            <div class="flex gap-2">
                <button
                    @click="$emit('prevPage')"
                    :disabled="page === 1"
                    class="px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold hover:bg-surface/50 text-text disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Previous
                </button>
                <button
                    @click="$emit('nextPage')"
                    :disabled="users.length < pageSize"
                    class="px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold hover:bg-surface/50 text-text disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Check, Bell, Loader2, XCircle, Plus } from 'lucide-vue-next'

const props = defineProps({
    users: Array,
    loading: Boolean,
    page: Number,
    pageSize: Number
})

const getRoleBadgeClass = (role) => {
    switch (role) {
        case 'admin': return 'border-purple-500 text-purple-600 bg-purple-50'
        case 'developer': return 'border-blue-500 text-blue-600 bg-blue-50'
        case 'creator': return 'border-pink-500 text-pink-600 bg-pink-50'
        default: return 'border-gray-300 text-gray-600 bg-gray-50'
    }
}
</script>
