<template>
    <div>
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
                        <p class="text-xs text-muted">{{ formatDateOnly(deal.createdAt) }}</p>
                    </div>
                </div>
            </div>
            <div v-if="brandDeals.length === 0 && !showDealForm" class="text-center py-20 text-muted">
                <Briefcase class="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No brand deals yet.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Hammer, Briefcase, User } from 'lucide-vue-next'
import { collection, query, orderBy, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const toast = useToast()

const brandDeals = ref([])
const showDealForm = ref(false)
const uploading = ref(false)
const newDeal = ref({
    id: null,
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
    newDeal.value = { ...deal }
    showDealForm.value = true
}

const saveBrandDeal = async () => {
    uploading.value = true
    try {
        if (newDeal.value.id) {
            // UPDATE
            const dealRef = doc($db, 'brand_deals', newDeal.value.id)
            const { id, ...data } = newDeal.value
            await setDoc(dealRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true })
        } else {
            // CREATE
            const { id, ...data } = newDeal.value
            await addDoc(collection($db, 'brand_deals'), {
                ...data,
                createdAt: serverTimestamp()
            })
        }
        toast.success(`Deal ${newDeal.value.id ? 'updated' : 'created'}!`)
        showDealForm.value = false
        newDeal.value = { id: null, status: 'pending', brandName: '', value: '', contactName: '', contactEmail: '', deliverables: '', notes: '' }
        await fetchDeals()
    } catch (e) {
        console.error(e)
        // toast.error('Failed to save deal') // toast usage assumed from parent context, but using useToast() here
    } finally {
        uploading.value = false
    }
}

const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700'
        case 'completed': return 'bg-blue-100 text-blue-700'
        case 'cancelled': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

onMounted(() => {
    fetchDeals()
})
</script>
