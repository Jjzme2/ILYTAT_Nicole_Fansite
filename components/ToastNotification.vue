<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto bg-surface border border-border/50 text-text px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 w-80 backdrop-blur-md"
        :class="{
            'border-green-500/50 shadow-green-500/10': toast.type === 'success',
            'border-red-500/50 shadow-red-500/10': toast.type === 'error',
            'border-blue-500/50 shadow-blue-500/10': toast.type === 'info',
        }"
      >
        <div class="shrink-0">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" />
            <Info v-else class="w-5 h-5 text-blue-500" />
        </div>
        <div class="flex-1 text-sm font-medium">
            <div>{{ toast.message }}</div>
            <button 
                v-if="toast.action" 
                @click="toast.action.onClick"
                class="mt-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition inline-block pointer-events-auto"
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
