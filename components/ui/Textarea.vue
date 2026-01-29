<template>
    <div class="space-y-1.5">
        <label v-if="label" :for="textareaId" class="text-xs font-bold text-muted uppercase tracking-wider ml-1">
            {{ label }} <span v-if="required" class="text-semantic-error">*</span>
        </label>
        
        <textarea
            :id="textareaId"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :rows="rows"
            :aria-invalid="!!error"
            :aria-describedby="error ? errorId : undefined"
            :class="[
                'w-full bg-background border rounded-xl p-3 outline-none transition-all duration-200 placeholder:text-muted/50 text-sm resize-none font-sans',
                error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                    : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border-hover',
                monospace ? 'font-mono text-xs' : ''
            ]"
        ></textarea>

        <p v-if="error" :id="errorId" role="alert" class="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
            <AlertCircle class="w-3 h-3" /> {{ error }}
        </p>
    </div>
</template>

<script setup>
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps({
    modelValue: String,
    label: String,
    placeholder: String,
    rows: { type: [String, Number], default: 3 },
    error: String,
    disabled: Boolean,
    required: Boolean,
    monospace: Boolean,
    id: String
})

defineEmits(['update:modelValue'])

const autoId = useId()
const textareaId = computed(() => props.id || autoId)
const errorId = computed(() => `${textareaId.value}-error`)
</script>
