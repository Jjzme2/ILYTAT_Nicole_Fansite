<script setup lang="ts">
const props = defineProps<{
  storageKey: string
  postId?: string
}>()

const src = ref('')
const loading = ref(true)
const error = ref(null)

const { user } = useAuth()

onMounted(async () => {
    if (!props.storageKey) {
        loading.value = false
        return
    }
    
    try {
        const headers: Record<string, string> = {}
        if (user.value) {
            const token = await user.value.getIdToken()
            headers.Authorization = `Bearer ${token}`
        }

        const data = await $fetch('/api/vault/view', {
            params: { 
                key: props.storageKey,
                postId: props.postId
            },
            headers
        })
        src.value = data.url
    } catch (e: any) {
        console.error('Failed to load secure resource', e)
        error.value = e
    } finally {
        loading.value = false
    }
})
</script>

<template>
  <slot :src="src" :loading="loading" :error="error"></slot>
</template>
