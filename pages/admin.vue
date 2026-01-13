<template>
  <div class="min-h-screen bg-gray-50 flex">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-black text-white hidden md:flex flex-col p-6">
        <div class="mb-10">
            <h1 class="text-2xl font-bold tracking-tight">THE OFFICE</h1>
            <p class="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        
        <nav class="space-y-2 flex-1">
             <button 
                @click="currentTab = 'deals'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'deals' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white']"
            >
                <Briefcase class="w-5 h-5" />
                Brand Deals
            </button>
             <button 
                @click="currentTab = 'users'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white']"
            >
                <Users class="w-5 h-5" />
                Users
            </button>

            <div class="pt-4 mt-4 border-t border-white/10 space-y-2">
                 <a 
                    v-if="role === 'creator'"
                    href="/creator" 
                    class="flex items-center gap-3 px-4 py-3 text-indigo-400 hover:text-white rounded-xl text-sm font-medium transition"
                >
                    <LayoutDashboard class="w-5 h-5" />
                    Creator Studio
                </a>
                <a href="/feed" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition">
                    <ExternalLink class="w-5 h-5" />
                    View Feed
                </a>
            </div>
        </nav>

        <button @click="logout" class="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition text-sm font-medium mt-auto">
            <LogOut class="w-5 h-5" />
            Log Out
        </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 md:p-10 overflow-y-auto">
        <!-- Mobile Header -->
        <div class="md:hidden flex justify-between items-center mb-8">
            <h1 class="font-bold text-xl">THE OFFICE</h1>
            <div class="flex gap-4">
                 <NuxtLink v-if="role === 'creator'" to="/creator" class="text-sm font-bold text-indigo-600">Studio</NuxtLink>
                <button @click="logout" class="text-sm text-red-500">Log Out</button>
            </div>
        </div>

        <!-- USERS TAB -->
        <div v-if="currentTab === 'users'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-serif text-gray-900 mb-2">User Management</h2>
                    <p class="text-gray-500">View all registered users and their status.</p>
                </div>
                <button @click="fetchUsers" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold">Refresh</button>
            </header>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                            <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                            <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Subscriber</th>
                            <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="u in userList" :key="u.id" class="hover:bg-gray-50">
                            <td class="p-4 font-medium">{{ u.email }}</td>
                            <td class="p-4">
                                <select 
                                    v-model="u.role" 
                                    @change="updateUserRole(u)"
                                    class="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block w-auto p-2.5 font-bold uppercase"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="creator">Creator</option>
                                </select>
                            </td>
                            <td class="p-4">
                                <span v-if="u.isSubscriber" class="text-green-600 font-bold flex items-center gap-1">
                                    <Check class="w-4 h-4" /> Active
                                </span>
                                <span v-else class="text-gray-400 text-xs">Free</span>
                            </td>
                            <td class="p-4 text-sm text-gray-500">{{ formatDate(u.createdAt) }}</td>
                        </tr>
                        <tr v-if="userList.length === 0">
                             <td colspan="4" class="p-8 text-center text-gray-400">Loading users...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- BRAND DEALS TAB -->
        <div v-if="currentTab === 'deals'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-gray-900 mb-2">Brand Deals</h2>
                    <p class="text-gray-500">Track and manage your sponsorships.</p>
                </div>
                <button @click="showDealForm = true" class="bg-black text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center gap-2">
                    <Plus class="w-5 h-5" />
                    New Deal
                </button>
            </header>

            <!-- New Deal Modal/Form -->
            <div v-if="showDealForm" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <h3 class="font-bold text-lg mb-4">Add New Brand Deal</h3>
                <form @submit.prevent="saveBrandDeal" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Brand Name</label>
                            <input v-model="newDeal.brandName" required type="text" class="w-full border rounded-lg p-2">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Deal Value</label>
                            <input v-model="newDeal.value" required type="text" placeholder="$500" class="w-full border rounded-lg p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Contact Name</label>
                            <input v-model="newDeal.contactName" type="text" class="w-full border rounded-lg p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                            <input v-model="newDeal.contactEmail" type="email" class="w-full border rounded-lg p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select v-model="newDeal.status" class="w-full border rounded-lg p-2 bg-white">
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Deliverables</label>
                             <textarea v-model="newDeal.deliverables" rows="2" class="w-full border rounded-lg p-2" placeholder="e.g. 1 Instagram Post, 2 Stories"></textarea>
                        </div>
                        <div class="col-span-2">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Notes / Description</label>
                             <textarea v-model="newDeal.notes" rows="3" class="w-full border rounded-lg p-2" placeholder="Internal notes, campaign details, or reminders..."></textarea>
                        </div>
                    </div>
                     <div class="flex justify-end gap-3 pt-4">
                        <button type="button" @click="showDealForm = false" class="text-gray-500 hover:text-black">Cancel</button>
                         <button type="submit" :disabled="uploading" class="bg-black text-white px-6 py-2 rounded-lg font-bold">
                             {{ uploading ? 'Saving...' : 'Save Deal' }}
                         </button>
                     </div>
                </form>
            </div>

            <div class="grid gap-4">
                <div v-for="deal in brandDeals" :key="deal.id" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-black transition">
                    <div class="flex-1 pr-6">
                        <div class="flex items-center gap-3 mb-1">
                            <h3 class="font-bold text-lg">{{ deal.brandName }}</h3>
                            <span :class="getStatusColor(deal.status) + ' px-2 py-0.5 rounded text-[10px] font-bold uppercase'">{{ deal.status }}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-1"><span class="font-bold">Deliverables:</span> {{ deal.deliverables }}</p>
                        <p v-if="deal.notes" class="text-xs text-gray-500 italic mb-3 bg-gray-50 p-2 rounded max-w-lg">{{ deal.notes }}</p>
                        <div class="flex items-center gap-4 text-xs text-gray-400">
                            <span class="flex items-center gap-1"><User class="w-3 h-3" /> {{ deal.contactName }}</span>
                            <span>{{ deal.contactEmail }}</span>
                        </div>
                    </div>
                    <div class="text-right whitespace-nowrap">
                        <p class="font-bold text-xl">{{ deal.value }}</p>
                        <p class="text-xs text-gray-400">{{ formatDate(deal.createdAt) }}</p>
                    </div>
                </div>
                 <div v-if="brandDeals.length === 0 && !showDealForm" class="text-center py-20 text-gray-400">
                    <Briefcase class="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No brand deals yet.</p>
                </div>
            </div>

        </div>

        <!-- DEV BOARD TAB -->
        <div v-if="currentTab === 'dev'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-gray-900 mb-2">Dev Board</h2>
                    <p class="text-gray-500">Track features, bugs, and tasks for the developer.</p>
                </div>
                <button @click="fetchTasks" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold">Refresh</button>
            </header>

            <!-- New Task Form -->
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                <form @submit.prevent="submitTask" class="flex gap-4 items-end">
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Task Title</label>
                         <input v-model="newTask.title" type="text" class="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-black focus:ring-0 outline-none" placeholder="e.g. Fix login bug" required>
                    </div>
                     <div class="w-40">
                        <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Type</label>
                         <select v-model="newTask.type" class="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-black focus:ring-0 outline-none bg-white">
                            <option value="feature">Feature</option>
                            <option value="bug">Bug</option>
                            <option value="chore">Chore</option>
                        </select>
                    </div>
                     <div class="w-40">
                        <label class="block text-xs font-bold text-gray-400 mb-1 uppercase">Priority</label>
                         <select v-model="newTask.priority" class="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-black focus:ring-0 outline-none bg-white">
                            <option value="low">Low</option>
                            <option value="med">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                     <button type="submit" :disabled="uploading" class="bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition h-full">
                        {{ uploading ? '...' : 'Add' }}
                    </button>
                </form>
            </div>

            <!-- Task List -->
            <div class="space-y-4">
                 <div v-for="task in tasks" :key="task.id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div :class="{
                            'bg-blue-100 text-blue-700': task.type === 'feature',
                            'bg-red-100 text-red-700': task.type === 'bug',
                            'bg-gray-100 text-gray-700': task.type === 'chore'
                        }" class="p-2 rounded-lg">
                            <Zap v-if="task.type === 'feature'" class="w-5 h-5" />
                            <Bug v-else-if="task.type === 'bug'" class="w-5 h-5" />
                            <Hammer v-else class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="font-bold text-lg">{{ task.title }}</h4>
                             <div class="flex items-center gap-2 text-xs text-gray-400">
                                <span class="capitalize">{{ task.priority }} Priority</span>
                                <span>•</span>
                                <span class="capitalize">{{ task.status }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button v-if="task.status !== 'done'" @click="updateTaskStatus(task.id, 'done')" class="p-2 hover:bg-green-50 text-green-600 rounded-lg transition" title="Mark Done">
                            <Check class="w-5 h-5" />
                        </button>
                         <button @click="deleteTask(task.id)" class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition" title="Delete">
                            <Trash2 class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

        </div>

    </main>

  </div>
</template>

<script setup>
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc } from 'firebase/firestore'
import { 
    LayoutDashboard, ExternalLink, LogOut, Check,
    Users, Briefcase, Plus, User 
} from 'lucide-vue-next'

definePageMeta({
    middleware: 'admin'
})

const { $db } = useNuxtApp()
const { logout, user, isAdmin, role } = useAuth()

// TABS
const currentTab = ref('deals') // Default to management view

const uploading = ref(false)

// --- USERS LOGIC ---
const userList = ref([])
const fetchUsers = async () => {
    try {
        const q = query(collection($db, 'users'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        userList.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('Error fetching users:', e)
    }
}

const updateUserRole = async (userDoc) => {
    try {
        const userRef = doc($db, 'users', userDoc.id)
        await setDoc(userRef, { role: userDoc.role }, { merge: true })
        alert(`User role updated to ${userDoc.role}`)
    } catch (e) {
        console.error('Error updating role:', e)
        alert('Failed to update role: ' + e.message)
    }
}

// --- BRAND DEALS LOGIC ---
const brandDeals = ref([])
const showDealForm = ref(false)
const newDeal = ref({
    brandName: '',
    value: '',
    contactName: '',
    contactEmail: '',
    status: 'pending',
    deliverables: '',
    notes: ''
})

const fetchDeals = async () => {
     try {
        const q = query(collection($db, 'brand_deals'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        brandDeals.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('Error fetching deals:', e)
    }
}

const saveBrandDeal = async () => {
    uploading.value = true
    try {
        await addDoc(collection($db, 'brand_deals'), {
            ...newDeal.value,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })
        showDealForm.value = false
        // Reset
        newDeal.value = { brandName: '', value: '', contactName: '', contactEmail: '', status: 'pending', deliverables: '', notes: '' }
        await fetchDeals()
    } catch (e) {
        console.error(e)
        alert('Error saving deal: ' + e.message)
    } finally {
        uploading.value = false
    }
}

const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700'
        case 'completed': return 'bg-blue-100 text-blue-700'
        case 'cancelled': return 'bg-red-100 text-red-700'
        default: return 'bg-yellow-100 text-yellow-700'
    }
}

// --- SHARED ---
const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

// Watch tab changes to load data
watch(currentTab, (tab) => {
    if (tab === 'users') fetchUsers()
    if (tab === 'deals') fetchDeals()
}, { immediate: true })
</script>

<style scoped>
/* Resetting style block to fix Vite HMR error */
</style>
