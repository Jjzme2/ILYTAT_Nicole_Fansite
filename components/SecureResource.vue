<script setup lang="ts">
const props = defineProps<{
  storageKey: string
  postId?: string
}>()

const { user } = useAuth()

// Use a computed getter for params to ensure reactivity
const params = computed(() => ({
    key: props.storageKey,
    postId: props.postId
}))

const { data, status, error } = await useFetch('/api/vault/view', {
    key: `vault-${props.storageKey}`, // Caching key prevents refetching on navigation
    params,
    onRequest: async ({ options }) => {
        if (user.value) {
            try {
                const token = await user.value.getIdToken()
                options.headers = options.headers || {}
                ;(options.headers as any).Authorization = `Bearer ${token}`
            } catch (e) {
                console.warn('Failed to attach auth token', e)
            }
        }
    },
    server: false, // Client-side only as we need the Firebase token
    lazy: true,    // Non-blocking
    immediate: !!props.storageKey
})

const src = computed(() => data.value?.url || '')
const loading = computed(() => status.value === 'pending')
</script>

<template>
  <slot :src="src" :loading="loading" :error="error"></slot>
</template>
