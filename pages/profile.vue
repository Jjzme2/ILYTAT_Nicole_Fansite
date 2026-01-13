<template>
  <div class="min-h-screen bg-background text-text p-6 md:p-12">
    <div class="max-w-3xl mx-auto">
      
      <!-- Header -->
      <header class="mb-12 border-b border-border pb-6 flex justify-between items-center">
        <div>
           <h1 class="text-3xl font-serif font-bold">User Profile</h1>
           <p class="text-muted mt-2">Manage your settings and view your data.</p>
        </div>
        <NuxtLink to="/feed" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text transition">
            Back to Feed
        </NuxtLink>
      </header>

      <div class="space-y-8">
        
        <!-- Theme Settings -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette class="w-5 h-5 text-primary" />
                Theme Preferences
            </h2>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-bold text-muted mb-2">Color Theme</label>
                    <select v-model="activeTheme" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition">
                        <option v-for="(theme, key) in themes" :key="key" :value="key">
                            {{ theme.name }}
                        </option>
                    </select>
                    <p class="text-xs text-muted mt-2">Select a theme to customize the look and feel of the application.</p>
                </div>
                
                <!-- Theme Preview -->
                <div class="bg-background rounded-xl p-4 border border-border flex flex-col gap-3">
                    <span class="text-xs font-bold text-muted uppercase tracking-wider">Preview Palette</span>
                    <div class="flex gap-2">
                        <div class="w-8 h-8 rounded-full bg-primary shadow-sm" title="Primary"></div>
                        <div class="w-8 h-8 rounded-full bg-secondary shadow-sm" title="Secondary"></div>
                        <div class="w-8 h-8 rounded-full bg-surface border border-border shadow-sm" title="Surface"></div>
                        <div class="w-8 h-8 rounded-full bg-background border border-border shadow-sm" title="Background"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- User Data Transparency -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <Database class="w-5 h-5 text-primary" />
                Data Transparency
            </h2>
            <p class="text-muted mb-6">We believe in full transparency. Here is all the data we currently have associated with your account.</p>

            <div v-if="loading" class="py-10 text-center text-muted">Loading user data...</div>
            
            <div v-else-if="user" class="space-y-6">
                <!-- Basic Info -->
                <div class="grid md:grid-cols-2 gap-4">
                     <div class="p-4 bg-background rounded-xl border border-border">
                        <span class="text-xs text-muted uppercase tracking-wider block mb-1">User ID (UID)</span>
                        <code class="text-sm font-mono text-primary">{{ user.uid }}</code>
                    </div>
                    <div class="p-4 bg-background rounded-xl border border-border">
                        <span class="text-xs text-muted uppercase tracking-wider block mb-1">Email Address</span>
                        <span class="font-medium">{{ user.email }}</span>
                    </div>
                     <div class="p-4 bg-background rounded-xl border border-border">
                        <span class="text-xs text-muted uppercase tracking-wider block mb-1">Email Verified</span>
                        <span :class="user.emailVerified ? 'text-green-500' : 'text-orange-500'" class="font-medium">
                            {{ user.emailVerified ? 'Yes' : 'No' }}
                        </span>
                    </div>
                    <div class="p-4 bg-background rounded-xl border border-border">
                        <span class="text-xs text-muted uppercase tracking-wider block mb-1">Last Login</span>
                        <span class="font-medium">{{ user.metadata?.lastSignInTime || 'N/A' }}</span>
                    </div>
                </div>

                <!-- Technical Metadata -->
                <div class="mt-6">
                    <span class="text-xs text-muted font-bold uppercase tracking-wider block mb-3">Safe Metadata</span>
                    <div class="bg-background rounded-xl border border-border p-4 overflow-x-auto">
                        <pre class="text-xs font-mono text-muted whitespace-pre-wrap">{{ JSON.stringify(safeUserData, null, 2) }}</pre>
                    </div>
                </div>
            </div>
            
            <div v-else class="text-center py-10">
                <p class="text-red-400">You are not logged in.</p>
                <NuxtLink to="/login" class="mt-4 inline-block text-primary hover:underline">Go to Login</NuxtLink>
            </div>

        </section>
        
        <div class="flex justify-center">
            <button @click="logout" class="text-red-400 hover:text-red-500 text-sm font-medium transition">
                Log Out of All Sessions
            </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { Palette, Database } from 'lucide-vue-next'

const config = useAppConfig()
const { user, loading, logout } = useAuth()
const { activeTheme, themes } = useTheme()

useHead({
    title: 'User Profile - Data Transparency'
})

// Sanitize user object for display
const safeUserData = computed(() => {
    if (!user.value) return null
    // Create a deep copy to avoid modifying original
    const data = JSON.parse(JSON.stringify(user.value))
    
    // Whitelist safe top-level keys or strip specific dangerous ones
    // Firebase User object has 'stsTokenManager', 'apiKey', 'accessToken' etc.
    delete data.stsTokenManager
    delete data.apiKey
    delete data.auth
    delete data.proactiveRefresh
    delete data.accessToken
    
    return data
})
</script>
