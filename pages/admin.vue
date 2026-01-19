<template>
  <div class="min-h-screen bg-background flex text-text">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-surface border-r border-border text-text hidden md:flex flex-col p-6">
        <div class="mb-10">
            <h1 class="text-2xl font-bold tracking-tight">THE OFFICE</h1>
            <p class="text-xs text-muted mt-1">Admin Dashboard</p>
        </div>
        
        <nav class="space-y-2 flex-1">
            <button 
                @click="switchSection('launchpad')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'launchpad' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Rocket class="w-5 h-5" />
                Launchpad
            </button>
            <button 
                v-if="isAdmin || role === 'creator'"
                @click="switchSection('community')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'community' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Users class="w-5 h-5" />
                Community
            </button>
            <button 
                v-if="isAdmin || role === 'creator'"
                @click="switchSection('business')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'business' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Briefcase class="w-5 h-5" />
                Business
            </button>
             <button 
                v-if="isAdmin"
                @click="switchSection('requests')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'requests' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <ClipboardCheck class="w-5 h-5" />
                Requests
                <span v-if="pendingRequestsCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{{ pendingRequestsCount }}</span>
            </button>
            <button 
                @click="switchSection('engineering')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'engineering' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Wrench class="w-5 h-5" />
                Engineering
            </button>

            <div class="pt-4 mt-4 border-t border-border space-y-2">
                 <a 
                    v-if="role === 'creator' || isAdmin || isDeveloper"
                    href="/creator" 
                    class="flex items-center gap-3 px-4 py-3 text-indigo-400 hover:text-text rounded-xl text-sm font-medium transition"
                >
                    <LayoutDashboard class="w-5 h-5" />
                    Creator Studio
                </a>
                <a href="/feed" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text rounded-xl text-sm font-medium transition">
                    <ExternalLink class="w-5 h-5" />
                    View Feed
                </a>
            </div>
        </nav>

        <div class="flex items-center gap-3 mt-auto mb-2">
            <NotificationBell />
            <span class="text-xs text-muted font-medium">Alerts</span>
        </div>

        <button @click="logout" class="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition text-sm font-medium">
            <LogOut class="w-5 h-5" />
            Log Out
        </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 md:p-10 overflow-y-auto">
        <!-- Mobile Header -->
        <div class="md:hidden flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <NuxtLink to="/feed" class="p-2 -ml-2 text-muted hover:text-text">
                    <ArrowLeft class="w-6 h-6" />
                </NuxtLink>
                <h1 class="font-bold text-xl text-text">THE OFFICE</h1>
            </div>
            <div class="flex gap-4 items-center">
                 <NotificationBell />
                 <NuxtLink v-if="role === 'creator' || isAdmin || isDeveloper" to="/creator" class="text-xs font-bold text-indigo-600 border border-indigo-200 px-2 py-1 rounded-full">Studio</NuxtLink>
                <button @click="logout" class="text-xs text-red-500 font-medium">Log Out</button>
            </div>
        </div>

        <!-- Mobile Tab Navigation -->
        <div class="md:hidden flex overflow-x-auto gap-2 mb-8 pb-4 -mx-6 px-6 snap-x">
             <button @click="switchSection('launchpad')" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition snap-start', activeSection === 'launchpad' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Launchpad
            </button>
             <button v-if="isAdmin || role === 'creator'" @click="switchSection('community')" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition snap-start', activeSection === 'community' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Community
            </button>
             <button v-if="isAdmin || role === 'creator'" @click="switchSection('business')" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition snap-start', activeSection === 'business' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Business
            </button>
             <button v-if="isAdmin" @click="switchSection('requests')" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition snap-start', activeSection === 'requests' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted relative']">
                Requests
                <span v-if="pendingRequestsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{{ pendingRequestsCount }}</span>
            </button>
             <button @click="switchSection('engineering')" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition snap-start', activeSection === 'engineering' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Engineering
            </button>
        </div>

        <!-- LAUNCHPAD TAB -->
        <div v-if="currentTab === 'launchpad'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <header class="mb-10">
                <h2 class="text-3xl font-serif text-text mb-2">Mission Control</h2>
                <p class="text-muted">Quick access to all essential external tools.</p>
            </header>

            <div class="space-y-12">
                <!-- Admins Links -->
                <div>
                     <h3 class="font-bold text-xl text-text mb-4 flex items-center gap-2">
                        <Wrench class="w-5 h-5 text-muted" />
                        Administration
                     </h3>
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a 
                            v-for="(link, i) in appConfig.adminLinks" 
                            :key="i"
                            :href="link.url"
                            target="_blank"
                            class="group relative overflow-hidden bg-surface border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                            :class="[link.borderColor || 'border-border']"
                        >
                            <!-- Background Splash -->
                            <div class="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition duration-700" :class="link.color.replace('text', 'bg')"></div>

                            <div class="flex items-start justify-between mb-4">
                                <div class="p-3 rounded-xl transition-colors duration-300" :class="link.bgColor || 'bg-background'">
                                    <component :is="getIcon(link.icon)" class="w-6 h-6" :class="link.color" />
                                </div>
                                <ExternalLink class="w-4 h-4 text-muted group-hover:text-primary transition" />
                            </div>

                            <h3 class="font-bold text-lg text-text mb-1 group-hover:text-primary transition">{{ link.label }}</h3>
                            <p class="text-sm text-muted leading-relaxed group-hover:text-text/70 transition">{{ link.description }}</p>
                        </a>
                    </div>
                </div>

                <!-- Creator Links -->
                <div>
                     <h3 class="font-bold text-xl text-text mb-4 flex items-center gap-2">
                        <Palette class="w-5 h-5 text-muted" />
                        Creative Suite
                     </h3>
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a 
                            v-for="(link, i) in appConfig.creatorLinks" 
                            :key="i"
                            :href="link.url"
                            target="_blank"
                            class="group relative overflow-hidden bg-surface border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                            :class="[link.borderColor || 'border-border']"
                        >
                            <!-- Background Splash -->
                            <div class="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition duration-700" :class="link.color.replace('text', 'bg')"></div>

                            <div class="flex items-start justify-between mb-4">
                                <div class="p-3 rounded-xl transition-colors duration-300" :class="link.bgColor || 'bg-background'">
                                    <component :is="getIcon(link.icon)" class="w-6 h-6" :class="link.color" />
                                </div>
                                <ExternalLink class="w-4 h-4 text-muted group-hover:text-primary transition" />
                            </div>

                            <h3 class="font-bold text-lg text-text mb-1 group-hover:text-primary transition">{{ link.label }}</h3>
                            <p class="text-sm text-muted leading-relaxed group-hover:text-text/70 transition">{{ link.description }}</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- COMMUNITY SECTION -->
        <div v-if="activeSection === 'community'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Sub-Nav -->
            <div class="flex gap-1 mb-8 bg-surface p-1 rounded-xl border border-border inline-flex">
                <button @click="activeSubTab = 'users'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'users' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Users</button>
                <button @click="activeSubTab = 'suggestions'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'suggestions' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Suggestions</button>
                <button v-if="role === 'creator'" @click="activeSubTab = 'inbox'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'inbox' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Inbox</button>
                <button @click="activeSubTab = 'broadcasts'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'broadcasts' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Broadcasts</button>
            </div>

            <!-- USERS TAB -->
            <div v-if="activeSubTab === 'users'">
                <header class="mb-8 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-serif text-text mb-2">User Management</h2>
                        <p class="text-muted">View all registered users and their status.</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <select v-model="pageSize" @change="fetchUsers('first')" class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-black focus:border-black">
                            <option :value="10">10 per page</option>
                            <option :value="20">20 per page</option>
                            <option :value="50">50 per page</option>
                        </select>
                        <button @click="fetchUsers('first')" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold">Refresh</button>
                    </div>
                    <button @click="fetchUsers" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text">Refresh</button>
                </header>

                <!-- Users Table Component -->
                <AdminUsersTable 
                    :users="userList"
                    :loading="loadingUsers"
                    :page="pageNumber"
                    :pageSize="pageSize"
                    @prevPage="fetchUsers('prev')"
                    @nextPage="fetchUsers('next')"
                    @removeRole="removeUserRole"
                    @addRole="addUserRole"
                    @notify="initiateNotification"
                />
            </div>

            <!-- SUGGESTIONS TAB -->
            <div v-if="activeSubTab === 'suggestions'">
                <header class="mb-8 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-serif text-text mb-2">Member Suggestions</h2>
                        <p class="text-muted">Review ideas from subscribers. Flag important ones or reply.</p>
                    </div>
                    <button @click="fetchSuggestions" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text">Refresh</button>
                </header>
                
                <AdminSuggestionsTable 
                    :suggestions="suggestions"
                    @toggleFlag="toggleFlag"
                    @reply="replyToSuggestion"
                />
            </div>

            <div v-if="activeSubTab === 'inbox'">
                <header class="mb-6">
                    <h2 class="text-2xl font-serif text-text">Message Inbox</h2>
                    <p class="text-muted text-sm">Direct messages from fans.</p>
                </header>
                <div class="bg-surface rounded-2xl border border-border p-2">
                    <MessageInbox />
                </div>
            </div>

            <!-- BROADCASTS TAB -->
            <div v-if="activeSubTab === 'broadcasts'">
                <AdminBroadcastManager 
                    :initialTarget="pendingNotificationTarget" 
                    @cleared="pendingNotificationTarget = null" 
                />
            </div>
        </div>

        <!-- BUSINESS SECTION -->
        <div v-if="activeSection === 'business'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <!-- Sub-Nav -->
            <div class="flex gap-1 mb-8 bg-surface p-1 rounded-xl border border-border inline-flex">
                <button @click="activeSubTab = 'deals'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'deals' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Brand Deals</button>
                <button @click="activeSubTab = 'giveaways'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'giveaways' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Giveaways</button>
                <button @click="activeSubTab = 'merch'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'merch' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Merch Store</button>
            </div>

            <!-- BRAND DEALS TAB -->
            <div v-if="activeSubTab === 'deals'">
                <AdminBrandDealsManager />
            </div>

             <!-- GIVEAWAYS TAB -->
            <div v-if="activeSubTab === 'giveaways'">
                <AdminGiveawaysManager />
            </div>

            <!-- MERCH STORE TAB -->
            <div v-if="activeSubTab === 'merch'">
                 <header class="mb-10">
                    <h2 class="text-3xl font-serif text-text mb-2">Merch Store</h2>
                    <p class="text-muted">Manage products, inventory, and orders.</p>
                </header>
                <div class="bg-surface rounded-2xl border border-border p-12 text-center text-muted">
                    <ShoppingBag class="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h3 class="font-bold text-lg text-text">Store Integration</h3>
                    <p class="mb-6">Connect your Shopify or Printful account to manage products here.</p>
                    <NuxtLink to="/merch" class="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold">
                        Go to Public Storefront
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- REQUESTS SECTION -->
        <AdminRequestsManager v-if="activeSection === 'requests'" />

        <!-- ENGINEERING SECTION -->
        <AdminEngineeringSection v-if="activeSection === 'engineering'" />
    </main>
  </div>
</template>

<script setup>
definePageMeta({
    middleware: 'admin'
})
import { collection, query, orderBy, getDocs, doc, setDoc, startAfter, endBefore, limit, limitToLast, deleteDoc, updateDoc } from 'firebase/firestore'
import { 
    LayoutDashboard, ExternalLink, LogOut, Users, Briefcase, 
    Rocket, Flame, Github, CreditCard, BarChart3, Triangle, Globe, ArrowLeft,
    Wrench, Palette, ClipboardCheck,  ShoppingBag
} from 'lucide-vue-next'

const { $db } = useNuxtApp()
const { logout, user, isAdmin, role, isDeveloper } = useAuth()
const toast = useToast()
const appConfig = useAppConfig()
const route = useRoute()
const router = useRouter()

// TABS & NAVIGATION
// Initialize from URL query params
const activeSection = ref(route.query.section || 'launchpad')
const activeSubTab = ref(route.query.subtab || '')

// Initialize subtabs when switching main sections
const switchSection = (sectionId) => {
    activeSection.value = sectionId
    // Default subtabs
    if (sectionId === 'community') activeSubTab.value = 'users'
    if (sectionId === 'business') activeSubTab.value = 'deals'
    if (sectionId === 'engineering') activeSubTab.value = 'tasks'
}

// Watch activeSection and sync to URL
watch(activeSection, (val) => {
    router.replace({ query: { ...route.query, section: val } })
}, { immediate: true })

// Watch activeSubTab and sync to URL
watch(activeSubTab, (val) => {
    if (val) {
        router.replace({ query: { ...route.query, section: activeSection.value, subtab: val } })
    }
}, { immediate: true })

const currentTab = computed(() => { // Maintain compatibility 
    if (activeSection.value === 'launchpad') return 'launchpad'
    return activeSection.value // fallback
})

const isDev = computed(() => import.meta.dev || ['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email) || isAdmin.value)

const getIcon = (name) => {
    switch (name) {
        case 'Users': return Users;
        case 'Briefcase': return Briefcase;
        case 'Rocket': return Rocket;
        case 'Flame': return Flame;
        case 'Github': return Github;
        case 'CreditCard': return CreditCard;
        case 'BarChart3': return BarChart3;
        case 'Triangle': return Triangle;
        case 'Globe': return Globe;
        default: return ExternalLink;
    }
}

// --- BROADCASTS LOGIC ---
const pendingNotificationTarget = ref(null)

const initiateNotification = (userObj) => {
    activeSubTab.value = 'broadcasts'
    pendingNotificationTarget.value = userObj
}

// --- USERS LOGIC ---
const userList = ref([])
const loadingUsers = ref(false)
// Pagination State
const pageSize = ref(10)
const lastVisible = ref(null)
const firstVisible = ref(null)
const pageNumber = ref(1)

const fetchUsers = async (direction = 'first') => {
    if (typeof direction !== 'string') direction = 'first'

    loadingUsers.value = true
    try {
        let q = query(collection($db, 'users'), orderBy('createdAt', 'desc'))

        if (direction === 'next' && lastVisible.value) {
            q = query(q, startAfter(lastVisible.value), limit(pageSize.value))
        } else if (direction === 'prev' && firstVisible.value) {
            q = query(q, endBefore(firstVisible.value), limitToLast(pageSize.value))
        } else {
            // first or reset
            q = query(q, limit(pageSize.value))
            pageNumber.value = 1
        }

        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
            userList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            firstVisible.value = snapshot.docs[0]
            lastVisible.value = snapshot.docs[snapshot.docs.length - 1]

            if (direction === 'next') pageNumber.value++
            if (direction === 'prev') pageNumber.value--
        } else {
            if (direction === 'first') {
                userList.value = []
            }
        }
    } catch (e) {
        console.error('Error fetching users:', e)
        toast.error('Failed to load users: ' + e.message)
    } finally {
        loadingUsers.value = false
    }
}

const saveUserRoles = async (userDoc, newRoles) => {
    try {
        const userRef = doc($db, 'users', userDoc.id)
        // Sync legacy 'role' field to the first role for backward/external compatibility
        await setDoc(userRef, { roles: newRoles, role: newRoles[0] || 'user' }, { merge: true })
        
        // Update local state
        userDoc.roles = newRoles
        userDoc.role = newRoles[0] || 'user'
        
        toast.success(`Roles updated for ${userDoc.email}`)
    } catch (e) {
        console.error('Error updating roles:', e)
        toast.error('Failed to update: ' + e.message)
    }
}

const addUserRole = async (u, newRole) => {
    const currentRoles = u.roles && u.roles.length ? u.roles : [u.role || 'user']
    if (currentRoles.includes(newRole)) return
    await saveUserRoles(u, [...currentRoles, newRole])
}

const removeUserRole = async (u, roleToRemove) => {
    const currentRoles = u.roles && u.roles.length ? u.roles : [u.role || 'user']
    const newRoles = currentRoles.filter(r => r !== roleToRemove)
    
    if (newRoles.length === 0) {
        toast.error('User must have at least one role.')
        return
    }
    await saveUserRoles(u, newRoles)
}

// Suggestions Logic
const suggestions = ref([])
const fetchSuggestions = async () => {
    try {
        const q = query(collection($db, 'suggestions'), limit(50))
        const snap = await getDocs(q)
        console.log(`[Admin] Fetched ${snap.size} suggestions`)
        suggestions.value = snap.docs.map(d => ({id: d.id, ...d.data()}))
    } catch(e) { 
        console.error('[Admin] Fetch suggestions failed:', e)
        toast.error('Failed to load suggestions')
    }
}

const toggleFlag = async (s) => {
    try {
        await updateDoc(doc($db, 'suggestions', s.id), {
            isFlagged: !s.isFlagged
        })
        s.isFlagged = !s.isFlagged
        toast.success(s.isFlagged ? 'Flagged' : 'Unflagged')
    } catch(e) { console.error(e); toast.error('Update failed') }
}

const replyToSuggestion = (s) => {
    initiateNotification({
        id: s.userId,
        email: s.userEmail
    })
    // Note: Pre-filling message is handled by AdminBroadcastManager watching pendingNotificationTarget
}

// Watch tab changes to load data
watch(activeSubTab, (tab) => {
    if (tab === 'users') fetchUsers()
    if (tab === 'suggestions') fetchSuggestions()
}, { immediate: true })

</script>

<style scoped>
/* Resetting style block to fix Vite HMR error */
</style>
