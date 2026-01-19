<template>
    <div>
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
                        <button type="submit" :disabled="uploading" class="bg-primary text-white px-6 py-2 rounded-lg font-bold">
                            {{ uploading ? 'Creating...' : 'Create' }}
                        </button>
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
                            <span v-if="new Date() < (cam.goLiveDate?.toDate ? cam.goLiveDate.toDate() : new Date(cam.goLiveDate || 0))" class="px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase rounded">Scheduled</span>
                            <span v-else-if="new Date() > (cam.endDate?.toDate ? cam.endDate.toDate() : new Date(cam.endDate || 0))" class="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded">Ended</span>
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
                        <button type="submit" :disabled="uploading" class="bg-primary text-white px-6 py-2 rounded-lg font-bold">
                            {{ uploading ? 'Scheduling...' : 'Schedule Drop' }}
                        </button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Gift, Calendar } from 'lucide-vue-next'
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const toast = useToast()

const campaigns = ref([])
const activeCampaign = ref(null)
const rounds = ref([])
const showCampaignForm = ref(false)
const showRoundForm = ref(false)
const uploading = ref(false)

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
        toast.success('Campaign created!')
    } catch (e) {
        console.error(e)
        toast.error('Error: ' + e.message)
    } finally {
        uploading.value = false
    }
}

const viewCampaign = async (cam) => {
    activeCampaign.value = cam
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
        await viewCampaign(activeCampaign.value)
        toast.success('Round scheduled!')
    } catch (e) {
        console.error(e)
        toast.error('Failed to add round: ' + e.message)
    } finally {
        uploading.value = false
    }
}

const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(() => {
    fetchCampaigns()
})
</script>
