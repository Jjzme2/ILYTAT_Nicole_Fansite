<template>
    <div class="flex items-center justify-center min-h-screen bg-background px-4 transition-colors duration-300">
        <div class="w-full max-w-md p-8 bg-surface rounded-2xl border border-border shadow-xl">
            <h2 class="mb-6 text-3xl font-bold text-center text-text">Create Account</h2>
            
            <form @submit.prevent="handleRegister" class="space-y-4">
                <div>
                    <label class="block mb-1 text-sm font-medium text-muted">Full Name</label>
                    <input 
                        v-model="name" 
                        type="text" 
                        required 
                        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-muted">Email</label>
                    <input 
                        v-model="email" 
                        type="email" 
                        required 
                        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-muted">Password</label>
                    <input 
                        v-model="password" 
                        type="password" 
                        required 
                        minlength="6"
                        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                        placeholder="••••••••"
                    />
                </div>
                
                <p v-if="error" class="text-sm text-error text-center">{{ error }}</p>

                <button 
                    type="submit" 
                    :disabled="loading"
                    class="w-full py-3 font-bold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition shadow-lg hover:shadow-primary/25"
                >
                    {{ loading ? 'Creating Account...' : 'Sign Up' }}
                </button>
            </form>
            
            <div class="mt-6 text-center text-sm text-muted">
                Already have an account? 
                <NuxtLink to="/login" class="font-bold text-primary hover:underline">
                    Log in
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'guest'
})

const { register } = useAuth()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
    loading.value = true
    error.value = ''
    try {
        await register(email.value, password.value, name.value)
        // Auth state watcher in useAuth/app.vue will handle redirect, 
        // but we can push manually to be safe/faster UX
        router.push('/feed')
    } catch (e) {
        error.value = e.message
        // Handle common firebase errors mapping if needed
        if (e.code === 'auth/email-already-in-use') {
            error.value = 'That email is already in use.'
        }
    } finally {
        loading.value = false
    }
}
</script>
