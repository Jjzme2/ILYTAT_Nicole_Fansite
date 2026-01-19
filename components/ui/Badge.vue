<template>
    <span 
        :class="[
            'inline-flex items-center gap-1.5 font-bold whitespace-nowrap align-middle',
            sizes[size],
            variants[variant],
            rounded ? 'rounded-full' : 'rounded-lg'
        ]"
    >
        <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
        <slot name="icon" />
        <slot />
    </span>
</template>

<script setup>
const props = defineProps({
    variant: { 
        type: String, 
        default: 'neutral',
        validator: v => ['primary', 'success', 'warning', 'danger', 'info', 'neutral', 'outline'].includes(v)
    },
    size: { 
        type: String, 
        default: 'sm',
    },
    rounded: Boolean,
    dot: Boolean
})

const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
}

const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    neutral: 'bg-surface text-muted border border-border',
    outline: 'bg-transparent text-text border border-border'
}
</script>
