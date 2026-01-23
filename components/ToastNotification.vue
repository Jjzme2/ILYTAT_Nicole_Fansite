<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" role="region" aria-label="Notifications">
    <TransitionGroup name="toast">
        <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="bg-surface/95 backdrop-blur-md shadow-xl rounded-xl p-4 flex items-start gap-3 w-80 pointer-events-auto border transition-all duration-300"
        :class="[
            toast.type === 'success' ? 'border-green-500/50 bg-green-50/10' :
            toast.type === 'error' ? 'border-red-500/50 bg-red-50/10' :
            toast.type === 'info' ? 'border-blue-500/50 bg-blue-50/10' :
            'border-border'
        ]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        aria-atomic="true"
      >
        <div class="shrink-0" aria-hidden="true">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-600" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600" />
            <Info v-else class="w-5 h-5 text-blue-600" />
        </div>
        <div class="flex-1 text-sm font-medium text-text">
            <div>{{ toast.message }}</div>
            <button 
                v-if="toast.action" 
                @click="toast.action.onClick"
                class="mt-2 text-xs font-bold bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded transition inline-block pointer-events-auto"
            >
                {{ toast.action.label }}
            </button>
        </div>
        <button @click="removeToast(toast.id)" class="text-muted hover:text-text transition" aria-label="Close">
            <X class="w-4 h-4" aria-hidden="true" />
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

.text-contrast {
    text-shadow: 0 0 1px rgba(255, 255, 255, 0.4), 0 0 0 rgba(255, 255, 255, 0.2); 
}
:global(.dark) .text-contrast {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
