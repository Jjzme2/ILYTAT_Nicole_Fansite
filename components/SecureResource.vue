<script setup lang="ts">
const props = defineProps<{
  storageKey: string
  postId?: string
}>()

const { user } = useAuth()

// Bolt Optimization: Use useAsyncData for caching and deduplication
// This prevents multiple requests for the same resource across the feed
// and allows caching if the user navigates away and back.
const { data, status, error } = useAsyncData<{ url: string } | null>(
    `secure-resource:${props.storageKey}`,
    async () => {
        if (!props.storageKey) return null

        const headers: Record<string, string> = {}
        if (user.value) {
            const token = await user.value.getIdToken()
            headers.Authorization = `Bearer ${token}`
        }

        return $fetch<{ url: string }>('/api/vault/view', {
            params: { 
                key: props.storageKey,
                postId: props.postId
            },
            headers
        })
    },
    {
        lazy: true,
        immediate: !!props.storageKey,
        dedupe: 'defer',
        watch: [user] // Re-fetch when user auth state changes (e.g. initial load)
    }
)

const src = computed(() => data.value?.url || '')
const loading = computed(() => status.value === 'pending')
</script>

<template>
  <slot :src="src" :loading="loading" :error="error"></slot>
</template>
