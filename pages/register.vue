<template>
    <div class="flex items-center justify-center min-h-screen bg-background px-4 transition-colors duration-300">
        <div class="w-full max-w-md p-8 bg-surface rounded-2xl border border-border shadow-xl">
            <h2 class="mb-6 text-3xl font-bold text-center text-text">Create Account</h2>
            
            <form @submit.prevent="handleRegister" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block mb-1 text-sm font-medium text-muted">Full Name (Private)</label>
                        <input 
                            v-model="fullName" 
                            type="text" 
                            required 
                            class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label class="block mb-1 text-sm font-medium text-muted">Display Name (Public)</label>
                        <input 
                            v-model="displayName" 
                            type="text" 
                            required 
                            class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                            placeholder="CoolFan123"
                        />
                    </div>
                </div>

                <div>
                    <label class="block mb-1 text-sm font-medium text-muted">Date of Birth</label>
                    <input 
                        v-model="birthday" 
                        type="date" 
                        required 
                        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50"
                    />
                    <p class="text-xs text-muted mt-1">You must be 21+ to create an account.</p>
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
                    <div class="relative">
                        <input
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            minlength="6"
                            class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder-muted/50 pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                            :aria-label="showPassword ? 'Hide password' : 'Show password'"
                        >
                            <EyeOff v-if="showPassword" class="w-4 h-4" />
                            <Eye v-else class="w-4 h-4" />
                        </button>
                    </div>
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
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
    middleware: 'guest'
})

const { register } = useAuth()
const router = useRouter()

const fullName = ref('')
const displayName = ref('')
const birthday = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

const handleRegister = async () => {
    // Basic Age Validation
    if (!birthday.value) {
        error.value = 'Please enter your birthday.'
        return
    }

    const age = calculateAge(birthday.value)
    if (age < 21) {
        error.value = 'You must be at least 21 years old to join.'
        return
    }

    loading.value = true
    error.value = ''
    try {
        await register(email.value, password.value, fullName.value, displayName.value, birthday.value)
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
