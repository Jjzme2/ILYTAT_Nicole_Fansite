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

        <!-- Global Verification Alert -->
        <div v-if="user && !user.emailVerified" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
            <div class="p-3 bg-amber-500/20 rounded-xl text-amber-600">
                <Info class="w-6 h-6" />
            </div>
            <div class="flex-1">
                <h2 class="font-bold text-amber-900 dark:text-amber-400">Account Not Verified</h2>
                <p class="text-sm text-amber-800/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                    Your messages to Nicole currently carry a <span class="font-black uppercase text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded ml-1">Non-Verified</span> badge. 
                    Please verify your email address to establish full trust and remove this flag.
                </p>
                <button @click="handleSendVerification" :disabled="verificationSent" class="mt-4 text-sm font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1">
                    {{ verificationSent ? 'Check your inbox' : 'Resend verification email' }}
                    <ArrowRight class="w-4 h-4" />
                </button>
            </div>
        </div>
        
        <!-- Personal Settings -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <UserIcon class="w-5 h-5 text-primary" />
                Personal Settings
            </h2>
            
            <div class="max-w-md">
                <label class="block text-sm font-bold text-muted mb-2">Display Name</label>
                <div class="flex gap-2">
                    <input 
                        v-model="newDisplayName" 
                        type="text" 
                        placeholder="Enter your name"
                        class="flex-1 bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition"
                    />
                    <button 
                        @click="handleUpdateProfile" 
                        :disabled="updating"
                        class="px-6 bg-primary text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ updating ? '...' : 'Update' }}
                    </button>
                </div>
                <p class="text-xs text-muted mt-2">This is how you will appear across the platform.</p>
            </div>
        </section>

        <!-- Account Security -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck class="w-5 h-5 text-primary" />
                Account Security
            </h2>

            <!-- Email Verification -->
            <div v-if="user && !user.emailVerified">
                <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-4">
                    <div class="p-2 bg-orange-500/20 rounded-lg text-orange-600">
                        <MailWarning class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="font-bold text-orange-700 dark:text-orange-400">Verify your Email</h3>
                        <p class="text-sm text-text/80 mb-3">Your email address <strong>{{ user.email }}</strong> is not verified. Please verify it to secure your account.</p>
                        <button 
                            @click="handleSendVerification" 
                            :disabled="verificationSent" 
                            class="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
                        >
                            {{ verificationSent ? 'Verification Sent!' : 'Send Verification Email' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Password Reset -->
            <div>
                <label class="block text-sm font-bold text-muted mb-2">Password Reset</label>
                <div class="flex items-center gap-4">
                    <button 
                        @click="handlePasswordReset" 
                        :disabled="resetSent"
                        class="px-6 py-3 bg-background border-2 border-border text-text font-bold rounded-xl hover:border-primary hover:text-primary transition disabled:opacity-50"
                    >
                        {{ resetSent ? 'Reset Email Sent' : 'Change Password' }}
                    </button>
                    <p class="text-xs text-muted">We will send you an email to reset your password securely.</p>
                </div>
            </div>
        </section>

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

        <!-- Message Nicole -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <MessageNicole />
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

                <!-- Activity Data -->
                <div class="mt-8 border-t border-border pt-8">
                    <h3 class="font-bold text-lg mb-4">Your Activity</h3>
                    
                    <div v-if="contentLoading" class="text-sm text-muted animate-pulse">Loading activity...</div>
                    <div v-else-if="errorMessage" class="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                        {{ errorMessage }}
                    </div>
                    <div v-else class="space-y-6">
                        
                        <!-- Suggestions -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <Lightbulb class="w-4 h-4 text-primary" />
                                <span class="text-sm font-bold uppercase text-muted tracking-wider">Suggestions ({{ userSuggestions.length }})</span>
                            </div>
                            <div v-if="userSuggestions.length > 0" class="grid gap-2">
                                <div v-for="item in userSuggestions" :key="item.id" class="bg-background border border-border p-3 rounded-lg text-sm">
                                    <div class="flex justify-between mb-1">
                                        <span class="font-bold text-[10px] uppercase bg-surface px-1.5 rounded border border-border">{{ item.type }}</span>
                                        <span class="text-[10px] text-muted">{{ item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now' }}</span>
                                    </div>
                                    <p>{{ item.content }}</p>
                                </div>
                            </div>
                            <p v-else class="text-sm text-muted italic">No suggestions yet.</p>
                        </div>

                        <!-- Scores -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <Trophy class="w-4 h-4 text-primary" />
                                <span class="text-sm font-bold uppercase text-muted tracking-wider">Game History ({{ userScores.length }})</span>
                            </div>
                            <div v-if="userScores.length > 0" class="flex flex-wrap gap-2">
                                <div v-for="score in userScores" :key="score.id" class="bg-background border border-border px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                    <span class="font-bold capitalize">{{ score.gameId }}</span>
                                    <span class="w-px h-3 bg-border"></span>
                                    <span class="font-mono text-primary">{{ score.score }}</span>
                                    <span class="text-[10px] text-muted">{{ score.timestamp?.toDate ? score.timestamp.toDate().toLocaleDateString() : '' }}</span>
                                </div>
                            </div>
                            <p v-else class="text-sm text-muted italic">No games played yet.</p>
                        </div>

                        <!-- Comments -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <MessageSquare class="w-4 h-4 text-primary" />
                                <span class="text-sm font-bold uppercase text-muted tracking-wider">Comments ({{ userComments.length }})</span>
                            </div>
                             <div v-if="userComments.length > 0" class="max-h-60 overflow-y-auto pr-2 space-y-2">
                                <component 
                                    :is="comment.postId ? 'NuxtLink' : 'div'"
                                    v-for="comment in userComments" 
                                    :key="comment.id"
                                    :to="comment.postId ? `/feed?highlight=${comment.postId}` : undefined"
                                    class="block bg-background border border-border p-3 rounded-lg text-sm hover:border-primary transition"
                                >
                                    <div v-if="comment.postId" class="text-[10px] text-primary font-bold mb-1 uppercase tracking-wider">
                                        On Post
                                    </div>
                                    <p class="mb-1">{{ comment.text }}</p>
                                    <p class="text-[10px] text-muted text-right">{{ comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : 'Just now' }}</p>
                                </component>
                            </div>
                            <p v-else class="text-sm text-muted italic">No comments yet.</p>
                        </div>

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
import { Palette, Database, User as UserIcon, MessageSquare, Lightbulb, Trophy, ShieldCheck, MailWarning, Mail, Info, ArrowRight } from 'lucide-vue-next'
import { updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc, collection, query, where, getDocs, orderBy, collectionGroup } from 'firebase/firestore'
import { useAuth } from '#imports'

const config = useAppConfig()
const { user, loading, logout } = useAuth()
const { activeTheme, themes } = useTheme()
const toast = useToast()
const { $auth, $db } = useNuxtApp()

useHead({
    title: 'User Profile - Settings'
})

// Profile State
const newDisplayName = ref('')
const updating = ref(false)

// Security State
const verificationSent = ref(false)
const resetSent = ref(false)

const handleSendVerification = async () => {
    if (!$auth.currentUser) return
    try {
        await sendEmailVerification($auth.currentUser)
        verificationSent.value = true
        toast.success('Verification email sent! Check your inbox.')
    } catch (e) {
        console.error(e)
        // Handle "too many requests" gracefully
        if(e.code === 'auth/too-many-requests') {
            toast.error('Too many requests. Please check your email or try again later.')
        } else {
            toast.error('Error sending verification.')
        }
    }
}

const handlePasswordReset = async () => {
    if (!$auth.currentUser || !$auth.currentUser.email) return
    try {
        await sendPasswordResetEmail($auth, $auth.currentUser.email)
        resetSent.value = true
        toast.success(`Password reset link sent to ${$auth.currentUser.email}`)
    } catch (e) {
        console.error(e)
        toast.error('Error sending reset email.')
    }
}

// Data Transparency State
const contentLoading = ref(false)
const errorMessage = ref('')
const userComments = ref([])
const userSuggestions = ref([])
const userScores = ref([])

const fetchUserContent = async () => {
    if (!user.value) return
    contentLoading.value = true
    errorMessage.value = ''
    
    // 1. Fetch Comments
    try {
        const commentsQ = query(
            collectionGroup($db, 'comments'), 
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc')
        )
        const commentsSnap = await getDocs(commentsQ)
        userComments.value = commentsSnap.docs.map(doc => {
            const data = doc.data()
            // doc.ref.parent is 'comments' collection
            // doc.ref.parent.parent is the 'posts' document
            const postId = doc.ref.parent.parent?.id
            return { id: doc.id, postId, ...data }
        })
    } catch (e) {
        console.error("Comments fetch failed:", e)
        errorMessage.value += `Comments: ${e.message} `
    }

    // 2. Fetch Suggestions
    try {
        const suggQ = query(
            collection($db, 'suggestions'),
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc')
        )
        const suggSnap = await getDocs(suggQ)
        userSuggestions.value = suggSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
         console.error("Suggestions fetch failed:", e)
         errorMessage.value += `Suggestions: ${e.message} `
    }

    // 3. Fetch Scores
    try {
        const scoresQ = query(
            collection($db, 'users', user.value.uid, 'scores'),
            orderBy('timestamp', 'desc')
        )
        const scoresSnap = await getDocs(scoresQ)
        userScores.value = scoresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
         console.error("Scores fetch failed:", e)
         errorMessage.value += `Scores: ${e.message} `
    }
    
    contentLoading.value = false
}

watch(() => user.value, (newUser) => {
    if (newUser) fetchUserContent()
}, { immediate: true })

// Sync user name to input on load
watchEffect(() => {
    if (user.value?.displayName) {
        newDisplayName.value = user.value.displayName
    }
})

const handleUpdateProfile = async () => {
    if (!newDisplayName.value.trim()) return
    updating.value = true
    
    try {


        if ($auth.currentUser) {
            // 1. Update Auth Profile
            await updateProfile($auth.currentUser, {
                displayName: newDisplayName.value
            })
            
            // 2. Sync to Firestore 'users' collection
            const { $db } = useNuxtApp()
            await setDoc(doc($db, 'users', $auth.currentUser.uid), {
                displayName: newDisplayName.value,
                email: $auth.currentUser.email,
                photoURL: $auth.currentUser.photoURL,
                updatedAt: new Date()
            }, { merge: true })

            // Force refresh user state if needed, or rely on Firebase auth listener
            toast.success("Profile updated successfully!")
        }
    } catch (e) {
        console.error(e)
        toast.error("Failed to update profile.")
    } finally {
        updating.value = false
    }
}

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
