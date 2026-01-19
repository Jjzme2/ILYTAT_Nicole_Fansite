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
                <div class="mb-4">
                    <input 
                        v-model="newDisplayName" 
                        type="text" 
                        placeholder="Enter your public display name"
                        class="w-full bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition"
                    />
                     <p class="text-xs text-muted mt-2">This is how you will appear publicly across the platform.</p>
                </div>

                <div class="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-sm font-bold text-muted">Full Name (Private)</label>
                            <button v-if="userProfile?.fullName" @click="openRequestModal('fullName')" class="text-[10px] text-primary hover:underline font-bold">Request Change</button>
                            <span v-else class="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Required</span>
                        </div>
                        <input 
                            v-model="newFullName" 
                            type="text" 
                            placeholder="Your legal name"
                            :disabled="!!userProfile?.fullName"
                            class="w-full bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-2">
                             <label class="block text-sm font-bold text-muted">Birthday</label>
                             <button v-if="userProfile?.birthday" @click="openRequestModal('birthday')" class="text-[10px] text-primary hover:underline font-bold">Request Change</button>
                             <span v-else class="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Required</span>
                        </div>
                        <input 
                            v-model="newBirthday" 
                            type="date" 
                            :disabled="!!userProfile?.birthday"
                            class="w-full bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <button 
                    @click="handleUpdateProfile" 
                    :disabled="updating"
                    class="w-full px-6 py-3 bg-primary text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ updating ? 'Saving Changes...' : 'Update Profile' }}
                </button>
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

        <!-- Legal & Transparency -->
        <section class="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <Scale class="w-5 h-5 text-primary" />
                Legal & Transparency
            </h2>
            <div class="grid md:grid-cols-2 gap-4">
                 <NuxtLink to="/legal/content-policy" class="block p-4 bg-background border border-border rounded-xl hover:border-primary transition group">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold group-hover:text-primary transition">Content Policy</span>
                        <ArrowRight class="w-4 h-4 text-muted group-hover:text-primary transition" />
                    </div>
                    <p class="text-sm text-muted">Read our guidelines on age (21+), conduct, and prohibited content.</p>
                </NuxtLink>
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
            
            <div v-if="user" class="grid gap-6">
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
                
                <!-- Expanded Profile Data -->
                <div class="mt-6" v-if="userProfile">
                    <span class="text-xs text-muted font-bold uppercase tracking-wider block mb-3">Profile Details</span>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="p-4 bg-background rounded-xl border border-border">
                            <span class="text-xs text-muted uppercase tracking-wider block mb-1">Full Name (Private)</span>
                            <span class="font-medium">{{ userProfile.fullName || 'Not set' }}</span>
                        </div>
                        <div class="p-4 bg-background rounded-xl border border-border">
                            <span class="text-xs text-muted uppercase tracking-wider block mb-1">Birthday</span>
                            <span class="font-medium">{{ userProfile.birthday || 'Not set' }}</span>
                        </div>
                        <div class="p-4 bg-background rounded-xl border border-border">
                            <span class="text-xs text-muted uppercase tracking-wider block mb-1">Roles</span>
                            <div class="flex flex-wrap gap-1">
                                <span v-for="role in (userProfile.roles || ['user'])" :key="role" 
                                      class="inline-block px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded border border-primary/20 capitalize">
                                    {{ role }}
                                </span>
                            </div>
                        </div>
                        <div class="p-4 bg-background rounded-xl border border-border">
                            <span class="text-xs text-muted uppercase tracking-wider block mb-1">Member Since</span>
                            <span class="font-medium">{{ userProfile.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : 'Unknown' }}</span>
                        </div>
                         <div class="p-4 bg-background rounded-xl border border-border">
                            <span class="text-xs text-muted uppercase tracking-wider block mb-1">Subscription Status</span>
                            <span :class="userProfile.isSubscriber ? 'text-green-500' : 'text-muted'" class="font-medium">
                                {{ userProfile.isSubscriber ? 'Active Subscriber' : 'Free Tier' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Technical Metadata -->
                <div class="mt-6">
                    <button 
                        @click="showSafeMetadata = !showSafeMetadata" 
                        class="flex items-center gap-2 text-xs text-muted font-bold uppercase tracking-wider mb-3 hover:text-text transition"
                    >
                        <span>Safe Metadata</span>
                        <Triangle :class="[showSafeMetadata ? 'rotate-180' : 'rotate-90']" class="w-3 h-3 transition-transform" />
                    </button>
                    
                    <div v-show="showSafeMetadata" class="bg-background rounded-xl border border-border p-4 overflow-x-auto">
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
                                <NuxtLink 
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
                                </NuxtLink>
                            </div>
                            <p v-else class="text-sm text-muted italic">No comments yet.</p>
                        </div>

                        <!-- Messages -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <Mail class="w-4 h-4 text-primary" />
                                <span class="text-sm font-bold uppercase text-muted tracking-wider">Messages ({{ userMessages.length }})</span>
                            </div>
                             <div v-if="userMessages.length > 0" class="max-h-60 overflow-y-auto pr-2 space-y-2">
                                <NuxtLink 
                                    v-for="msg in userMessages" 
                                    :key="msg.id"
                                    :to="`/profile?messageId=${msg.id}`"
                                    class="block bg-background border border-border p-3 rounded-lg text-sm hover:border-primary transition"
                                >
                                    <div class="flex justify-between mb-1 items-center">
                                        <span class="font-bold text-[10px] uppercase text-primary tracking-widest">{{ msg.subject || 'Direct Message' }}</span>
                                        <span class="text-[10px] text-muted">{{ msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Just now' }}</span>
                                    </div>
                                    <p class="truncate opacity-70">{{ msg.content }}</p>
                                </NuxtLink>
                            </div>
                            <p v-else class="text-sm text-muted italic">No messages sent yet.</p>
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

    <!-- Update Request Modal -->
    <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-surface border border-border rounded-2xl w-full max-w-md p-6 relative">
            <button @click="showUpdateModal = false" class="absolute top-4 right-4 text-muted hover:text-text">
                <XCircle class="w-6 h-6" />
            </button>
            
            <h3 class="text-xl font-bold mb-2">Request Profile Change</h3>
            <p class="text-sm text-muted mb-6">Since your profile is verified, changes must be approved by an admin.</p>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Field to Update</label>
                    <div class="p-3 bg-background border border-border rounded-xl font-mono text-sm capitalize">
                        {{ updateRequestField === 'fullName' ? 'Full Name' : 'Birthday' }}
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-muted uppercase tracking-wider mb-2">New Value</label>
                    <input 
                        v-model="updateRequestValue" 
                        :type="updateRequestField === 'birthday' ? 'date' : 'text'" 
                        class="w-full bg-background border-2 border-border text-text rounded-xl p-3 outline-none focus:border-primary transition"
                        placeholder="Enter correct information"
                    />
                </div>

                <button 
                    @click="submitUpdateRequest" 
                    :disabled="requesting || !updateRequestValue"
                    class="w-full py-3 bg-primary text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ requesting ? 'Submitting Request...' : 'Submit Request' }}
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { Palette, Database, User as UserIcon, MessageSquare, Lightbulb, Trophy, ShieldCheck, MailWarning, Mail, Info, ArrowRight, Triangle, Scale, XCircle, Lock, LayoutDashboard, Wrench } from 'lucide-vue-next'
import { updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, orderBy, collectionGroup, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '#imports'

const config = useAppConfig()
const { user, loading, logout, isAdmin, isCreator } = useAuth()
const { activeTheme, themes } = useTheme()
const toast = useToast()
const { $auth, $db } = useNuxtApp()

useHead({
    title: 'User Profile - Settings'
})


// Profile State
const newDisplayName = ref('')
const newFullName = ref('')
const newBirthday = ref('')
const updating = ref(false)
const userProfile = ref(null) // Holds full Firestore Doc Data
const showSafeMetadata = ref(false)

// Request Update State
const showUpdateModal = ref(false)
const updateRequestField = ref('') // 'fullName' | 'birthday'
const updateRequestValue = ref('')
const requesting = ref(false)

const openRequestModal = (field) => {
    updateRequestField.value = field
    updateRequestValue.value = ''
    showUpdateModal.value = true
}

const submitUpdateRequest = async () => {
    if (!user.value || !updateRequestValue.value) return
    requesting.value = true
    try {
        await addDoc(collection($db, 'profile_update_requests'), {
            userId: user.value.uid,
            userEmail: user.value.email,
            field: updateRequestField.value,
            value: updateRequestValue.value,
            status: 'pending',
            createdAt: serverTimestamp()
        })
        toast.success('Request submitted for approval.')
        showUpdateModal.value = false
    } catch (e) {
        console.error(e)
        toast.error('Failed to submit request.')
    } finally {
        requesting.value = false
    }
}


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
const userMessages = ref([])

const fetchUserContent = async () => {
    if (!user.value) return
    contentLoading.value = true
    errorMessage.value = ''
    
    // 0. Fetch Full User Profile (Firestore)
    try {
        const docRef = doc($db, 'users', user.value.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            userProfile.value = docSnap.data()
        }
    } catch (e) {
        console.error("Profile fetch failed:", e)
        errorMessage.value += `Profile: ${e.message} `
    }
    
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

    // 4. Fetch Messages
    try {
        const messagesQ = query(
            collection($db, 'messages'),
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc')
        )
        const messagesSnap = await getDocs(messagesQ)
        userMessages.value = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
         console.error("Messages fetch failed:", e)
         errorMessage.value += `Messages: ${e.message} `
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
    if (userProfile.value) {
        if(userProfile.value.fullName) newFullName.value = userProfile.value.fullName
        if(userProfile.value.birthday) newBirthday.value = userProfile.value.birthday
    }
})

const handleUpdateProfile = async () => {
    updating.value = true
    
    try {
        if ($auth.currentUser) {
            // 1. Update Auth Profile (Display Name only)
            if (newDisplayName.value !== user.value.displayName) {
                await updateProfile($auth.currentUser, {
                    displayName: newDisplayName.value
                })
            }
            
            // 2. Sync to Firestore 'users' collection
            const { $db } = useNuxtApp()
            await setDoc(doc($db, 'users', $auth.currentUser.uid), {
                displayName: newDisplayName.value,
                fullName: newFullName.value,
                birthday: newBirthday.value,
                email: $auth.currentUser.email,
                photoURL: $auth.currentUser.photoURL,
                updatedAt: new Date()
            }, { merge: true })

            // Force refresh user profile data
            await fetchUserContent() // Refresh local profile data
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
    
    
    // Merge Auth data with Firestore Profile data for full transparency
    if (userProfile.value) {
        data.firestoreProfile = userProfile.value
    }
    
    return data

})
</script>
