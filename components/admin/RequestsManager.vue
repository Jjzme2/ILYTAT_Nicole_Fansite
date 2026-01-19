<template>
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header class="mb-8 flex justify-between items-end">
            <div>
                <h2 class="text-3xl font-bold font-serif mb-2">Profile Change Requests</h2>
                <p class="text-muted">Review and approve user profile updates.</p>
            </div>
            <button @click="fetchRequests" class="p-2 border border-border rounded-lg hover:border-primary transition"><RefreshCw class="w-4 h-4" /></button>
        </header>

        <div class="bg-surface border border-border rounded-2xl overflow-x-auto">
            <table class="w-full text-left text-sm min-w-[600px]">
                <thead class="bg-background border-b border-border text-muted font-bold uppercase text-xs">
                    <tr>
                        <th class="p-4">User</th>
                        <th class="p-4">Field</th>
                        <th class="p-4">Requested Value</th>
                        <th class="p-4">Date</th>
                        <th class="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-if="requestsLoading" key="loading">
                        <td colspan="5" class="p-8 text-center text-muted">
                            <div class="flex items-center justify-center gap-2">
                                <Loader2 class="w-5 h-5 animate-spin" />
                                <span>Loading requests...</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-for="req in requests" v-else-if="requests.length > 0" :key="req.id" class="hover:bg-background/50 transition">
                        <td class="p-4">
                            <div class="font-bold">{{ req.userEmail }}</div>
                            <div class="text-xs text-muted font-mono">{{ req.userId }}</div>
                        </td>
                        <td class="p-4 capitalize badge"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">{{ req.field }}</span></td>
                        <td class="p-4 font-mono">{{ req.value }}</td>
                        <td class="p-4 text-muted">{{ req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now' }}</td>
                        <td class="p-4 text-right flex justify-end gap-2">
                            <button @click="handleRequestAction(req, 'approve')" class="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition" title="Approve">
                                <Check class="w-4 h-4" />
                            </button>
                            <button @click="handleRequestAction(req, 'deny')" class="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition" title="Deny">
                                <XCircle class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                    <tr v-else-if="!requestsLoading && requests.length === 0" key="empty">
                        <td colspan="5" class="p-8 text-center text-muted italic">No pending requests.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RefreshCw, Check, XCircle, Loader2 } from 'lucide-vue-next'
import { collection, query, where, orderBy, limit, getDocs, setDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()
const toast = useToast()

const requests = ref([])
const requestsLoading = ref(false)
const pendingRequestsCount = ref(0) // Could implement realtime listener later

const fetchRequests = async () => {
    requestsLoading.value = true
    try {
        const q = query(collection($db, 'profile_update_requests'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(50))
        const snap = await getDocs(q)
        requests.value = snap.docs.map(d => ({id: d.id, ...d.data()}))
        pendingRequestsCount.value = requests.value.length
    } catch(e) {
        console.error("Fetch requests failed:", e)
    } finally {
        requestsLoading.value = false
    }
}

const handleRequestAction = async (req, action) => {
    try {
        if (action === 'approve') {
             // Update User Profile
             await setDoc(doc($db, 'users', req.userId), {
                [req.field]: req.value,
                updatedAt: serverTimestamp()
            }, { merge: true })
            
            // Mark Request Approved
            await updateDoc(doc($db, 'profile_update_requests', req.id), { status: 'approved' })
            
            // Notify User
            await addDoc(collection($db, `users/${req.userId}/notifications`), {
                title: 'Profile Update Approved',
                message: `Your request to update your ${req.field === 'fullName' ? 'Full Name' : 'Birthday'} has been approved.`,
                type: 'success',
                read: false,
                createdAt: serverTimestamp()
            })

             toast.success('Request Approved & Profile Updated')
        } else {
            // Mark Request Denied
            await updateDoc(doc($db, 'profile_update_requests', req.id), { status: 'denied' })
            
            // Notify User
            await addDoc(collection($db, `users/${req.userId}/notifications`), {
                title: 'update Request Denied',
                message: `Your request to update your ${req.field === 'fullName' ? 'Full Name' : 'Birthday'} was denied. Please ensure the information is accurate.`,
                type: 'error',
                read: false,
                createdAt: serverTimestamp()
            })

             toast.success('Request Denied')
        }
        await fetchRequests() // Refresh list
    } catch(e) { 
        console.error(e)
        toast.error('Action Failed: ' + e.message) 
    }
}

onMounted(() => {
    fetchRequests()
})
</script>
