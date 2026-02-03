<template>
    <div class="space-y-1.5">
        <label v-if="label" :for="inputId" class="text-xs font-bold text-muted uppercase tracking-wider ml-1">
            {{ label }} <span v-if="required" class="text-semantic-error">*</span>
        </label>
        
        <div class="relative group">
            <!-- Icon Left -->
            <div v-if="$slots['icon-left']" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                <slot name="icon-left" />
            </div>

            <input
                :id="inputId"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                :type="type"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :aria-invalid="!!error"
                :aria-describedby="error ? `${inputId}-error` : undefined"
                :class="[
                    'w-full bg-background border rounded-xl p-2.5 outline-none transition-all duration-200 placeholder:text-muted/50 text-sm',
                    error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                        : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border-hover',
                    $slots['icon-left'] ? 'pl-10' : ''
                ]"
            />
        </div>

        <p v-if="error" :id="`${inputId}-error`" class="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
            <AlertCircle class="w-3 h-3" /> {{ error }}
        </p>
    </div>
</template>

<script setup>
import { AlertCircle } from 'lucide-vue-next'
import { useId } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    error: String,
    disabled: Boolean,
    required: Boolean,
    id: { type: String, default: null }
})

defineEmits(['update:modelValue'])

const inputId = props.id || useId()
</script>
