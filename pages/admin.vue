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
                @click="currentTab = 'deals'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'deals' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Briefcase class="w-5 h-5" />
                Brand Deals
            </button>
             <button 
                @click="currentTab = 'users'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'users' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Users class="w-5 h-5" />
                Users
            </button>
            <button 
                @click="currentTab = 'giveaways'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'giveaways' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <div class="w-5 h-5 flex items-center justify-center"><component :is="activeCampaign ? Trophy : Gift" class="w-4 h-4" /></div>
                Giveaways
            </button>
             <button 
                @click="currentTab = 'dev'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'dev' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Bug class="w-5 h-5" />
                Dev Board
            </button>

            <div class="pt-4 mt-4 border-t border-border space-y-2">
                 <a 
                    v-if="role === 'creator'"
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

        <button @click="logout" class="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition text-sm font-medium mt-auto">
            <LogOut class="w-5 h-5" />
            Log Out
        </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 md:p-10 overflow-y-auto">
        <!-- Mobile Header -->
        <div class="md:hidden flex justify-between items-center mb-8">
            <h1 class="font-bold text-xl text-text">THE OFFICE</h1>
            <div class="flex gap-4">
                 <NuxtLink v-if="role === 'creator'" to="/creator" class="text-sm font-bold text-indigo-600">Studio</NuxtLink>
                <button @click="logout" class="text-sm text-red-500">Log Out</button>
            </div>
        </div>

        <!-- USERS TAB -->
        <div v-if="currentTab === 'users'">
             <header class="mb-10 flex justify-between items-center">
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

            <div class="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-surface/50 border-b border-border">
                        <tr>
                            <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Email</th>
                            <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Role</th>
                            <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Subscriber</th>
                            <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        <tr v-for="u in userList" :key="u.id" class="hover:bg-background/50">
                            <td class="p-4 font-medium text-text">{{ u.email }}</td>
                            <td class="p-4">
                                <select 
                                    v-model="u.role" 
                                    @change="updateUserRole(u)"
                                    class="bg-background border border-border text-text text-xs rounded-lg focus:ring-primary focus:border-primary block w-auto p-2.5 font-bold uppercase"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="creator">Creator</option>
                                </select>
                            </td>
                            <td class="p-4">
                                <span v-if="u.isSubscriber" class="text-green-500 font-bold flex items-center gap-1">
                                    <Check class="w-4 h-4" /> Active
                                </span>
                                <span v-else class="text-muted text-xs">Free</span>
                            </td>
                            <td class="p-4 text-sm text-muted">{{ formatDate(u.createdAt) }}</td>
                        </tr>
                        <tr v-if="userList.length === 0">
                             <td colspan="4" class="p-8 text-center text-muted">Loading users...</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination Footer -->
                <div class="p-4 border-t border-border flex justify-between items-center bg-surface">
                    <span class="text-xs text-muted font-bold uppercase">Page {{ pageNumber }}</span>
                    <div class="flex gap-2">
                        <button
                            @click="fetchUsers('prev')"
                            :disabled="pageNumber === 1"
                            class="px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold hover:bg-surface/50 text-text disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <button
                            @click="fetchUsers('next')"
                            :disabled="userList.length < pageSize"
                            class="px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold hover:bg-surface/50 text-text disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- BRAND DEALS TAB -->
        <div v-if="currentTab === 'deals'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-text mb-2">Brand Deals</h2>
                    <p class="text-muted">Track and manage your sponsorships.</p>
                </div>
                <button @click="newDeal = { id: null, status: 'pending' }; showDealForm = true" class="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition flex items-center gap-2">
                    <Plus class="w-5 h-5" />
                    New Deal
                </button>
            </header>

            <!-- New Deal Modal/Form -->
            <div v-if="showDealForm" class="bg-surface rounded-2xl shadow-lg border border-border p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <h3 class="font-bold text-lg mb-4 text-text">{{ newDeal.id ? 'Edit Deal' : 'Add New Brand Deal' }}</h3>
                <form @submit.prevent="saveBrandDeal" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-muted mb-1">Brand Name</label>
                            <input v-model="newDeal.brandName" required type="text" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-muted mb-1">Deal Value</label>
                            <input v-model="newDeal.value" required type="text" placeholder="$500" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-muted mb-1">Contact Name</label>
                            <input v-model="newDeal.contactName" type="text" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-muted mb-1">Contact Email</label>
                            <input v-model="newDeal.contactEmail" type="email" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none">
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-muted mb-1">Status</label>
                            <select v-model="newDeal.status" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none">
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                             <label class="block text-sm font-bold text-muted mb-1">Deliverables</label>
                             <textarea v-model="newDeal.deliverables" rows="2" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none" placeholder="e.g. 1 Instagram Post, 2 Stories"></textarea>
                        </div>
                        <div class="col-span-2">
                             <label class="block text-sm font-bold text-muted mb-1">Notes / Description</label>
                             <textarea v-model="newDeal.notes" rows="3" class="w-full bg-background border border-border text-text rounded-lg p-2 focus:border-primary outline-none" placeholder="Internal notes, campaign details, or reminders..."></textarea>
                        </div>
                    </div>
                     <div class="flex justify-end gap-3 pt-4">
                        <button type="button" @click="showDealForm = false" class="text-muted hover:text-text">Cancel</button>
                         <button type="submit" :disabled="uploading" class="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90">
                             {{ uploading ? 'Saving...' : (newDeal.id ? 'Update Deal' : 'Save Deal') }}
                         </button>
                     </div>
                </form>
            </div>

            <div class="grid gap-4">
                <div v-for="deal in brandDeals" :key="deal.id" class="bg-surface p-6 rounded-xl border border-border shadow-sm flex justify-between items-center group hover:border-primary transition">
                    <div class="flex-1 pr-6">
                        <div class="flex items-center gap-3 mb-1">
                            <h3 class="font-bold text-lg text-text">{{ deal.brandName }}</h3>
                            <span :class="getStatusColor(deal.status) + ' px-2 py-0.5 rounded text-[10px] font-bold uppercase'">{{ deal.status }}</span>
                        </div>
                        <p class="text-sm text-text mb-1"><span class="font-bold">Deliverables:</span> {{ deal.deliverables }}</p>
                        <p v-if="deal.notes" class="text-xs text-muted italic mb-3 bg-background p-2 rounded max-w-lg">{{ deal.notes }}</p>
                        <div class="flex items-center gap-4 text-xs text-muted">
                            <span class="flex items-center gap-1"><User class="w-3 h-3" /> {{ deal.contactName }}</span>
                            <span>{{ deal.contactEmail }}</span>
                        </div>
                    </div>
                    <div class="text-right whitespace-nowrap flex flex-col items-end gap-2">
                        <button @click="editDeal(deal)" class="bg-surface border border-border p-2 rounded-lg hover:bg-background transition text-muted hover:text-primary">
                            <Hammer class="w-4 h-4" />
                        </button>
                        <div>
                            <p class="font-bold text-xl text-text">{{ deal.value }}</p>
                            <p class="text-xs text-muted">{{ formatDate(deal.createdAt) }}</p>
                        </div>
                    </div>
                </div>
                 <div v-if="brandDeals.length === 0 && !showDealForm" class="text-center py-20 text-muted">
                    <Briefcase class="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No brand deals yet.</p>
                </div>
            </div>

        </div>

        <!-- DEV BOARD TAB -->
        <div v-if="currentTab === 'dev'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-text mb-2">Dev Board</h2>
                    <p class="text-muted">Track features, bugs, and tasks for the developer.</p>
                </div>
                <button @click="fetchTasks" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text">Refresh</button>
            </header>

            <!-- New Task Form -->
            <div class="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-8">
                <form @submit.prevent="submitTask" class="flex gap-4 items-end">
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Task Title</label>
                         <input v-model="newTask.title" type="text" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="e.g. Fix login bug" required>
                    </div>
                     <div class="w-40">
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Type</label>
                         <select v-model="newTask.type" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none">
                            <option value="feature">Feature</option>
                            <option value="bug">Bug</option>
                            <option value="chore">Chore</option>
                        </select>
                    </div>
                     <div class="w-40">
                        <label class="block text-xs font-bold text-muted mb-1 uppercase">Priority</label>
                         <select v-model="newTask.priority" class="w-full bg-background border-2 border-border text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none">
                            <option value="low">Low</option>
                            <option value="med">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                     <button type="submit" :disabled="uploading" class="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition h-full">
                        {{ uploading ? '...' : 'Add' }}
                    </button>
                </form>
            </div>

            <!-- Task List -->
            <div class="space-y-4">
                 <div v-for="task in tasks" :key="task.id" class="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
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
                            <h4 class="font-bold text-lg text-text">{{ task.title }}</h4>
                             <div class="flex items-center gap-2 text-xs text-muted">
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

        <!-- GIVEAWAYS TAB -->
        <div v-if="currentTab === 'giveaways'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-text mb-2">Giveaways</h2>
                    <p class="text-muted">Manage generic campaigns and schedule drops.</p>
                </div>
                <button v-if="!activeCampaign" @click="showCampaignForm = true" class="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition flex items-center gap-2">
                    <Plus class="w-5 h-5" />
                    New Campaign
                </button>
                <button v-else @click="activeCampaign = null" class="bg-surface border border-border px-6 py-3 rounded-xl font-bold hover:bg-background transition text-muted">
                    Back to Campaigns
                </button>
            </header>

            <!-- CAMPAIGNS LIST (Level 1) -->
            <div v-if="!activeCampaign">
                <!-- New Campaign Form -->
                <div v-if="showCampaignForm" class="bg-surface p-6 rounded-2xl border border-border mb-8 animate-in fade-in slide-in-from-top-4">
                    <form @submit.prevent="saveCampaign" class="space-y-4">
                        <input v-model="newCampaign.title" placeholder="Campaign Title (e.g. Monthly Merch)" required class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none">
                        <textarea v-model="newCampaign.description" placeholder="Description" rows="2" class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none"></textarea>
                        <input v-model="newCampaign.image" placeholder="Image URL" class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none">
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Coming Soon (Go Live)</label>
                                <input v-model="newCampaign.goLiveDate" type="datetime-local" class="w-full bg-background border border-border rounded-xl p-2 focus:border-primary outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Start Date</label>
                                <input v-model="newCampaign.startDate" type="datetime-local" required class="w-full bg-background border border-border rounded-xl p-2 focus:border-primary outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">End Date</label>
                                <input v-model="newCampaign.endDate" type="datetime-local" required class="w-full bg-background border border-border rounded-xl p-2 focus:border-primary outline-none">
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                             <button type="button" @click="showCampaignForm = false" class="text-muted">Cancel</button>
                            <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg font-bold">Create</button>
                        </div>
                    </form>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div v-for="cam in campaigns" :key="cam.id" class="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm group cursor-pointer hover:border-primary transition" @click="viewCampaign(cam)">
                        <div class="h-32 bg-gray-100 relative">
                            <img v-if="cam.image" :src="cam.image" class="w-full h-full object-cover">
                            <div v-else class="absolute inset-0 flex items-center justify-center text-muted"><Gift class="w-8 h-8 opacity-20"/></div>
                            <!-- Status Badges -->
                            <div class="absolute top-2 right-2 flex gap-1">
                                <span v-if="new Date() < cam.goLiveDate?.toDate()" class="px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase rounded">Scheduled</span>
                                <span v-else-if="new Date() > cam.endDate?.toDate()" class="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded">Ended</span>
                                <span v-else class="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold uppercase rounded">Live</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <h3 class="font-bold text-lg mb-1 group-hover:text-primary transition">{{ cam.title }}</h3>
                            <p class="text-sm text-muted line-clamp-2">{{ cam.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ROUNDS MANAGEMENT (Level 2) -->
            <div v-else>
                <div class="bg-surface border border-border rounded-2xl p-6 mb-8 flex justify-between items-center">
                    <div>
                         <h3 class="font-bold text-xl text-text mb-1">{{ activeCampaign.title }}</h3>
                         <p class="text-sm text-muted">Manage Rounds & Schedule</p>
                    </div>
                    <button @click="showRoundForm = true" class="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        <Calendar class="w-4 h-4" /> Schedule Round
                    </button>
                </div>

                <!-- Schedule Logic -->
                <div v-if="showRoundForm" class="bg-surface p-6 rounded-2xl border border-border mb-8 animate-in fade-in slide-in-from-top-4">
                     <form @submit.prevent="saveRound" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Start Time</label>
                                <input v-model="newRound.activationTime" type="datetime-local" required class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">End Time</label>
                                <input v-model="newRound.endTime" type="datetime-local" required class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none">
                            </div>
                        </div>
                        <div class="flex justify-end gap-2">
                            <button type="button" @click="showRoundForm = false" class="text-muted">Cancel</button>
                            <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg font-bold">Schedule Drop</button>
                        </div>
                    </form>
                </div>

                <div class="space-y-4">
                    <div v-for="round in rounds" :key="round.id" class="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                        <div>
                             <div class="flex items-center gap-2 mb-1">
                                <span class="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{{ round.status }}</span>
                                <span class="text-sm font-mono">{{ formatDate(round.activationTime) }}</span>
                             </div>
                             <p class="text-xs text-muted">Ends: {{ formatDate(round.endTime) }}</p>
                        </div>
                        <div class="text-right">
                             <div class="text-xs text-muted mb-1">Winner</div>
                             <div v-if="round.winner" class="font-bold text-green-600">{{ round.winner }}</div>
                             <div v-else class="text-muted italic">-</div>
                        </div>
                    </div>
                     <div v-if="rounds.length === 0" class="text-center py-10 text-muted italic">
                        No rounds scheduled yet.
                    </div>
                </div>
            </div>

        </div>

    </main>
  </div>
</template>

<script setup>
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc, startAfter, endBefore, limit, limitToLast, deleteDoc } from 'firebase/firestore'
import { 
    LayoutDashboard, ExternalLink, LogOut, Check,
    Users, Briefcase, Plus, User, Zap, Bug, Hammer, Trash2
} from 'lucide-vue-next'

definePageMeta({
    middleware: 'admin'
})

const { $db } = useNuxtApp()
const { logout, user, isAdmin, role } = useAuth()
const toast = useToast()

// --- GIFT/GIVEAWAY ICONS ---
import { Gift, Calendar, Trophy } from 'lucide-vue-next'

// ... existing imports ...

// TABS
const currentTab = ref('deals') 
const uploading = ref(false)

// --- DEV BOARD LOGIC ---
const tasks = ref([])
const newTask = ref({ title: '', type: 'feature', priority: 'med', status: 'todo' })

const fetchTasks = async () => {
    try {
        const q = query(collection($db, 'tasks'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        tasks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error(e)
    }
}

const submitTask = async () => {
    if (!newTask.value.title) return
    uploading.value = true
    try {
        await addDoc(collection($db, 'tasks'), {
            ...newTask.value,
            createdAt: serverTimestamp()
        })
        newTask.value = { title: '', type: 'feature', priority: 'med', status: 'todo' }
        await fetchTasks()
    } catch (e) {
        console.error(e)
    } finally {
        uploading.value = false
    }
}

const updateTaskStatus = async (taskId, status) => {
    try {
        await setDoc(doc($db, 'tasks', taskId), { status }, { merge: true })
        await fetchTasks()
    } catch (e) {
        console.error(e)
    }
}

const deleteTask = async (taskId) => {
    if(!confirm('Delete task?')) return
    try {
        await deleteDoc(doc($db, 'tasks', taskId))
        tasks.value = tasks.value.filter(t => t.id !== taskId)
    } catch (e) {
        console.error(e)
    }
}

// --- GIVEAWAYS LOGIC ---
const campaigns = ref([])
const activeCampaign = ref(null) // Selected for viewing rounds
const rounds = ref([])
const showCampaignForm = ref(false)
const showRoundForm = ref(false)

const newCampaign = ref({ title: '', description: '', image: '', startDate: '', endDate: '', goLiveDate: '' })
const newRound = ref({ activationTime: '', endTime: '', status: 'scheduled' })

const fetchCampaigns = async () => {
    try {
        const q = query(collection($db, 'giveaways'))
        const snapshot = await getDocs(q)
        campaigns.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error(e)
    }
}

const saveCampaign = async () => {
    uploading.value = true
    try {
        await addDoc(collection($db, 'giveaways'), {
            ...newCampaign.value,
            startDate: newCampaign.value.startDate ? new Date(newCampaign.value.startDate) : null,
            endDate: newCampaign.value.endDate ? new Date(newCampaign.value.endDate) : null,
            goLiveDate: newCampaign.value.goLiveDate ? new Date(newCampaign.value.goLiveDate) : null,
            createdAt: serverTimestamp()
        })
        showCampaignForm.value = false
        newCampaign.value = { title: '', description: '', image: '', startDate: '', endDate: '', goLiveDate: '' }
        await fetchCampaigns()
    } catch (e) {
        console.error(e)
        toast.error('Error: ' + e.message)
    } finally {
        uploading.value = false
    }
}

const viewCampaign = async (cam) => {
    activeCampaign.value = cam
    // Fetch Rounds for this campaign
    try {
        const q = query(collection($db, 'giveaways', cam.id, 'rounds'), orderBy('activationTime', 'desc'))
        const snapshot = await getDocs(q)
        rounds.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error(e)
    }
}

const saveRound = async () => {
    if (!activeCampaign.value) return
    uploading.value = true
    try {
        // Convert datetime-local strings to Date objects if needed, or allow Firestore to handle timestamps
        // Firestore prefers Date objects or Timestamp objects.
        const start = new Date(newRound.value.activationTime)
        const end = new Date(newRound.value.endTime)

        await addDoc(collection($db, 'giveaways', activeCampaign.value.id, 'rounds'), {
            activationTime: start,
            endTime: end,
            status: 'scheduled',
            winner: null,
            createdAt: serverTimestamp()
        })
        showRoundForm.value = false
        newRound.value = { activationTime: '', endTime: '', status: 'scheduled' }
        await viewCampaign(activeCampaign.value) // Refresh
    } catch (e) {
        console.error(e)
        toast.error('Error: ' + e.message)
    } finally {
        uploading.value = false
    }
}



// --- USERS LOGIC ---
const userList = ref([])
// Pagination State
const pageSize = ref(10)
const lastVisible = ref(null)
const firstVisible = ref(null)
const pageNumber = ref(1)

const fetchUsers = async (direction = 'first') => {
    // Handle Event object from click listeners
    if (typeof direction !== 'string') direction = 'first'

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
    }
}

const updateUserRole = async (userDoc) => {
    try {
        const userRef = doc($db, 'users', userDoc.id)
        await setDoc(userRef, { role: userDoc.role }, { merge: true })
        toast.success(`User role updated to ${userDoc.role}`)
    } catch (e) {
        console.error('Error updating role:', e)
        toast.error('Failed to update role: ' + e.message)
    }
}

// --- BRAND DEALS LOGIC ---
const brandDeals = ref([])
const showDealForm = ref(false)
const newDeal = ref({
    id: null, // Add ID tracking
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

const editDeal = (deal) => {
    newDeal.value = { ...deal } // Clone data
    showDealForm.value = true
}

const saveBrandDeal = async () => {
    uploading.value = true
    try {
        if (newDeal.value.id) {
            // UPDATE
            const dealRef = doc($db, 'brand_deals', newDeal.value.id)
            const { id, ...data } = newDeal.value // Exclude ID from payload
            await setDoc(dealRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true })
        } else {
             // CREATE
            await addDoc(collection($db, 'brand_deals'), {
                ...newDeal.value,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        }
       
        showDealForm.value = false
        // Reset
        newDeal.value = { id: null, brandName: '', value: '', contactName: '', contactEmail: '', status: 'pending', deliverables: '', notes: '' }
        await fetchDeals()
    } catch (e) {
        console.error(e)
        toast.error('Error saving deal: ' + e.message)
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
    if (tab === 'giveaways') fetchCampaigns()
    if (tab === 'dev') fetchTasks()
}, { immediate: true })
</script>

<style scoped>
/* Resetting style block to fix Vite HMR error */
</style>
