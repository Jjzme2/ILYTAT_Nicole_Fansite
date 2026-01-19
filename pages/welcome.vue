<template>
    <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <!-- Background Effect -->
        <div class="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-black to-black"></div>
        
        <div class="relative z-10 max-w-lg w-full text-center space-y-8">
            <div class="space-y-2">
                <h1 class="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    ILYTAT FANS
                </h1>
                <p class="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase">Exclusive Content Community</p>
            </div>

            <div class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <div class="mb-6">
                    <ShieldAlert class="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h2 class="text-2xl font-bold mb-2">Age Verification Required</h2>
                    <p class="text-gray-400">You must be 21+ to enter this site.</p>
                </div>

                <div class="text-left bg-black/40 rounded-xl p-6 mb-8 border border-white/5 space-y-4">
                    <div class="flex gap-3">
                        <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span class="text-sm text-gray-300">I confirm I am at least 21 years of age.</span>
                    </div>
                    <div class="flex gap-3">
                        <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span class="text-sm text-gray-300">I understand this site may contain adult themes (e.g., smoking), but strictly <strong>NO nudity</strong>.</span>
                    </div>
                    <div class="flex gap-3">
                        <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span class="text-sm text-gray-300">I agree to maintain respectful conduct at all times.</span>
                    </div>
                </div>

                <div class="space-y-4">
                     <button 
                        @click="enterSite" 
                        class="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-white/10"
                    >
                        I AM 21+ • ENTER SITE
                    </button>
                    <a 
                        href="https://google.com" 
                        class="block w-full py-4 text-gray-500 font-bold text-sm hover:text-white transition"
                    >
                        I am under 21 • Exit
                    </a>
                </div>
            </div>

            <p class="text-xs text-gray-600">
                By entering, you agree to our 
                <NuxtLink to="/legal/content-policy" class="underline hover:text-gray-400">Content Policy</NuxtLink>.
            </p>
        </div>

    </div>
</template>

<script setup>
import { ShieldAlert, CheckCircle2 } from 'lucide-vue-next'

definePageMeta({
    layout: 'empty', 
    auth: false // Public access
})

const enterSite = () => {
    // Set strictly 21+ cookie
    const ageCookie = useCookie('age_verified', {
        maxAge: 60 * 60 * 24 * 30, // 30 Days
        path: '/'
    })
    ageCookie.value = 'true'
    
    // Redirect
    navigateTo('/login')
}
</script>
