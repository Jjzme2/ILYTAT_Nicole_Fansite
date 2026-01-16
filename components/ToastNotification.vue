<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto bg-surface border border-border/50 text-text px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 w-80 backdrop-blur-md"
        :class="[
            toast.type === 'success' ? 'border-green-500/50 shadow-green-500/10 bg-green-100 dark:bg-surface text-green-800 dark:text-green-400' :
            toast.type === 'error' ? 'border-red-500/50 shadow-red-500/10 bg-red-100 dark:bg-surface text-red-800 dark:text-red-400' :
            toast.type === 'info' ? 'border-blue-500/50 shadow-blue-500/10 bg-blue-100 dark:bg-surface text-blue-800 dark:text-blue-400' :
            'bg-surface border-border/50 text-text'
        ]"
      >
        <div class="shrink-0">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-600 dark:text-green-400" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600 dark:text-red-400" />
            <Info v-else class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="flex-1 text-sm font-medium">
            <div>{{ toast.message }}</div>
            <button 
                v-if="toast.action" 
                @click="toast.action.onClick"
                class="mt-2 text-xs font-bold bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded transition inline-block pointer-events-auto"
            >
                {{ toast.action.label }}
            </button>
        </div>
        <button @click="removeToast(toast.id)" class="text-muted hover:text-text transition">
            <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next'
const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
