<template>
    <button 
        :type="type"
        :disabled="disabled || loading"
        :class="[
            'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 active:scale-95 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed',
            // Sizes
            sizes[size],
            // Variants
            variants[variant],
            // Block
            block ? 'w-full' : ''
        ]"
    >
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <slot name="icon-left" v-if="!loading && $slots['icon-left']" />
        <slot />
        <slot name="icon-right" v-if="!loading && $slots['icon-right']" />
    </button>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
    type: { type: String, default: 'button' },
    disabled: Boolean,
    loading: Boolean,
    block: Boolean,
    variant: { 
        type: String, 
        default: 'primary',
        validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'outline'].includes(v)
    },
    size: { 
        type: String, 
        default: 'md',
        validator: (v) => ['xs', 'sm', 'md', 'lg'].includes(v)
    }
})

const sizes = {
    xs: 'text-xs px-2 py-1 rounded-md',
    sm: 'text-sm px-3 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl'
}

const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-surface text-muted hover:text-text',
    outline: 'border border-border bg-transparent hover:bg-surface text-text'
}
</script>
