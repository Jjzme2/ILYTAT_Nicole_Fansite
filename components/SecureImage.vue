<script setup lang="ts">
const props = defineProps<{
  storageKey: string // The ID saved in Firebase (e.g., "a1b2-c3d4.jpg")
  alt?: string
}>()

const { user } = useAuth()

// Bolt Optimization: Replace onMounted+$fetch with useAsyncData
// This enables caching and prevents duplicate requests for the same image
const { data, status } = useAsyncData<{ url: string } | null>(
    `secure-image:${props.storageKey}`,
    async () => {
        if (!props.storageKey) return null
        return $fetch<{ url: string }>('/api/vault/view', {
          params: { key: props.storageKey }
        })
    },
    {
        lazy: true,
        dedupe: 'defer',
        watch: [user] // Consistent behavior
    }
)

const src = computed(() => data.value?.url || '')
const loading = computed(() => status.value === 'pending')
</script>

<template>
  <div v-if="loading" class="animate-pulse bg-gray-200 h-64 w-full rounded"></div>
  <img v-else :src="src" :alt="alt" class="rounded shadow-lg" />
</template>
