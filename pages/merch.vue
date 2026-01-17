<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="py-12 px-6 text-center border-b border-border">
      <h1 class="text-4xl md:text-5xl font-serif font-bold text-text mb-2">Merchandise</h1>
      <p class="text-muted tracking-widest uppercase text-sm">Official Collection • Restricted Access</p>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Admin/Creator Badge -->
      <div class="mb-8 flex justify-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-bold text-amber-600">
          <ShieldAlert class="w-4 h-4" />
          <span>Internal Preview: Only visible to Admins & Creators</span>
        </div>
      </div>

      <!-- Merch Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary transition duration-500">
          <div class="aspect-square bg-background/50 flex items-center justify-center relative overflow-hidden">
            <ShoppingBag class="w-16 h-16 text-muted opacity-20 group-hover:scale-110 transition duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
            <div class="absolute bottom-4 left-4">
              <span class="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded">Coming Soon</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-1">Product #{{ i }} Template</h3>
            <p class="text-sm text-muted mb-4">Description for the upcoming Nicole Circle merchandise. This is a placeholder for the future shop.</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-text">$0.00</span>
              <button disabled class="px-4 py-2 bg-surface border border-border text-muted rounded-xl text-xs font-bold uppercase cursor-not-allowed">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State / Suggestion -->
      <div class="mt-20 text-center py-16 bg-surface/50 border-2 border-dashed border-border rounded-3xl">
        <Sparkles class="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
        <h2 class="text-2xl font-bold mb-2">Build the Shop</h2>
        <p class="text-muted max-w-md mx-auto mb-8">This section is currently under development. Once we integrate a provider like Printful or Shopify, we will toggle the public visibility.</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink to="/creator" class="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20">
            Back to Studio
          </NuxtLink>
          <NuxtLink to="/admin" class="px-6 py-3 bg-surface border border-border font-bold rounded-xl hover:bg-background transition">
            Admin Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingBag, ShieldAlert, Sparkles } from 'lucide-vue-next'

const { role, loading } = useAuth()

// Restrict access
onMounted(() => {
    if (!loading.value && role.value !== 'admin' && role.value !== 'creator') {
        navigateTo('/feed')
    }
})

watch([role, loading], ([newRole, isLoading]) => {
    if (!isLoading && newRole !== 'admin' && newRole !== 'creator') {
        navigateTo('/feed')
    }
})

definePageMeta({
    middleware: ['auth']
})
</script>
