<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
            <h2 class="mb-6 text-3xl font-bold text-center text-gray-900">Create Account</h2>
            
            <form @submit.prevent="handleRegister" class="space-y-4">
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <input 
                        v-model="email" 
                        type="email" 
                        required 
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
                    <input 
                        v-model="password" 
                        type="password" 
                        required 
                        minlength="6"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        placeholder="••••••••"
                    />
                </div>
                
                <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>

                <button 
                    type="submit" 
                    :disabled="loading"
                    class="w-full py-3 font-bold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                    {{ loading ? 'Creating Account...' : 'Sign Up' }}
                </button>
            </form>
            
            <div class="mt-6 text-center text-sm text-gray-600">
                Already have an account? 
                <NuxtLink to="/login" class="font-medium text-black hover:underline">
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
    loading.value = true
    error.value = ''
    try {
        await register(email.value, password.value)
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
