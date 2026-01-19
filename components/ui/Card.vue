<template>
    <div class="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div v-if="$slots.header || title" class="p-5 border-b border-border bg-surface/50">
            <slot name="header">
                <div class="flex items-center gap-3">
                    <div v-if="$slots.icon" class="p-2 bg-background/50 rounded-lg text-primary">
                        <slot name="icon" />
                    </div>
                    <div>
                        <h3 v-if="title" class="font-bold text-lg text-text">{{ title }}</h3>
                        <p v-if="subtitle" class="text-xs text-muted">{{ subtitle }}</p>
                    </div>
                    <div class="ml-auto">
                         <slot name="actions" />
                    </div>
                </div>
            </slot>
        </div>
        
        <div class="p-5">
            <slot />
        </div>

        <div v-if="$slots.footer" class="p-4 bg-background/50 border-t border-border flex items-center justify-end gap-3 text-sm">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    subtitle: String
})
</script>
