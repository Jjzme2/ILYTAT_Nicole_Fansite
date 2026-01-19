<script setup lang="ts">
const props = defineProps<{
  storageKey: string // The ID saved in Firebase (e.g., "a1b2-c3d4.jpg")
  alt?: string
}>()

const src = ref('')
const loading = ref(true)

// Fetch the temporary pass on mount
onMounted(async () => {
  try {
    const data = await $fetch('/api/vault/view', {
      params: { key: props.storageKey }
    })
    src.value = data.url
  } catch (e) {
    console.error('Failed to load secure image', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="animate-pulse bg-gray-200 h-64 w-full rounded"></div>
  <img v-else :src="src" :alt="alt" class="rounded shadow-lg" />
</template>