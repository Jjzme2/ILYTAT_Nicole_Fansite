<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Daily Report Section -->
        <UiCard title="Daily Report" subtitle="Manually trigger the daily analytics email.">
            <template #icon>
                <BarChart3 class="w-5 h-5 text-indigo-600" />
            </template>

            <div class="bg-background rounded-xl p-4 mb-4 text-sm border border-border">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-muted">Recipients:</span>
                    <span class="font-mono text-xs text-text">{{ reportEmails || 'Not configured' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-muted">Schedule:</span>
                    <span class="text-text font-medium">Daily @ 8:00 AM CST</span>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <UiButton 
                    @click="sendDailyReport" 
                    :loading="devToolsLoading.report"
                    block
                    variant="primary"
                >
                    <template #icon-left><Send class="w-4 h-4" /></template>
                    {{ devToolsLoading.report ? 'Broadcasting...' : 'Broadcast to Team Now' }}
                </UiButton>

            </div>


            <div v-if="devToolsResults.report" class="mt-4 p-3 rounded-xl text-xs" :class="devToolsResults.report.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                <p class="font-bold mb-1">{{ devToolsResults.report.message }}</p>
                <pre v-if="devToolsResults.report.results" class="mt-2 text-[10px] overflow-auto max-h-32 bg-white/50 p-2 rounded">{{ JSON.stringify(devToolsResults.report.results, null, 2) }}</pre>
            </div>
        </UiCard>

        <!-- Test Email Section -->
        <UiCard title="Test Email" subtitle="Verify email delivery configuration.">
            <template #icon>
                <Send class="w-5 h-5 text-emerald-600" />
            </template>

            <form @submit.prevent="sendTestEmail" class="space-y-4">
                 <!-- Template Select (Custom for now until UiSelect) -->
                 <div class="space-y-1.5">
                    <label class="text-xs font-bold text-muted uppercase tracking-wider ml-1">Template</label>
                    <select v-model="testEmail.template" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-emerald-500 outline-none">
                        <option value="general">General Template</option>
                        <option value="daily">Daily Report Template</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                     <UiInput v-model="testEmail.to" type="email" placeholder="recipient@example.com" label="Recipient" required />
                     <UiInput v-model="testEmail.subject" placeholder="Subject line" label="Subject" required />
                </div>
                
                <div v-if="testEmail.template === 'general'">
                    <UiTextarea v-model="testEmail.message" label="Message" placeholder="Email content..." required />
                </div>

                <div v-else class="space-y-2">
                    <div class="flex justify-between items-end">
                        <label class="text-xs font-bold text-muted uppercase tracking-wider ml-1">Variables (JSON)</label>
                        <button type="button" @click="prefillDailyData" class="text-xs text-emerald-500 hover:text-emerald-400 font-bold mb-1">Fill Mock Data</button>
                    </div>
                    <UiTextarea v-model="testEmail.jsonData" rows="8" placeholder="{ ... }" monospace />
                </div>
                
                <UiButton 
                    type="submit"
                    :loading="devToolsLoading.email"
                    block
                    variant="success"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <template #icon-left><Send class="w-4 h-4" /></template>
                    {{ devToolsLoading.email ? 'Sending...' : 'Send Test Email' }}
                </UiButton>
            </form>

            <div v-if="devToolsResults.email" class="mt-4 p-3 rounded-xl text-xs" :class="devToolsResults.email.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                 <p class="font-bold">{{ devToolsResults.email.message }}</p>
                 <p v-if="devToolsResults.email.provider" class="text-[10px] opacity-75 mt-1">Provider: {{ devToolsResults.email.provider }}</p>
            </div>
        </UiCard>

        <!-- System Status -->
        <UiCard title="System Status" subtitle="Current environment and configuration overview" class="lg:col-span-2">
            <template #icon>
                <Activity class="w-5 h-5 text-amber-600" />
            </template>
            <template #actions>
                 <UiButton size="xs" variant="ghost" @click="refreshSystemStats" :loading="devToolsLoading.stats">
                    <RefreshCw class="w-3 h-3 mr-1" /> Refresh
                </UiButton>
            </template>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-background rounded-xl p-4 text-center border border-border">
                    <div class="text-2xl font-bold text-primary">{{ systemStats.users }}</div>
                    <div class="text-xs text-muted uppercase mt-1">Users</div>
                </div>
                <div class="bg-background rounded-xl p-4 text-center border border-border">
                    <div class="text-2xl font-bold text-emerald-500">{{ systemStats.posts }}</div>
                    <div class="text-xs text-muted uppercase mt-1">Posts</div>
                </div>
                <div class="bg-background rounded-xl p-4 text-center border border-border">
                    <div class="text-2xl font-bold text-amber-500">{{ systemStats.deals }}</div>
                    <div class="text-xs text-muted uppercase mt-1">Brand Deals</div>
                </div>
                <div class="bg-background rounded-xl p-4 text-center border border-border">
                    <div class="text-2xl font-bold text-purple-500">{{ systemStats.tasks }}</div>
                    <div class="text-xs text-muted uppercase mt-1">Dev Tasks</div>
                </div>
            </div>

             <div class="bg-surface border border-border rounded-xl">
                 <div class="p-3 border-b border-border bg-background/50 flex items-center gap-2">
                    <FileText class="w-4 h-4 text-slate-500" />
                    <span class="text-xs font-bold text-text">Runtime Config</span>
                    <UiBadge :variant="isDev ? 'warning' : 'success'" class="ml-auto">
                        {{ isDev ? 'DEVELOPMENT' : 'PRODUCTION' }}
                    </UiBadge>
                 </div>
                <div class="bg-gray-950 text-gray-300 p-4 rounded-b-xl text-xs font-mono overflow-auto max-h-48">
                    <pre>{{ JSON.stringify(appConfig, null, 2) }}</pre>
                </div>
            </div>
        </UiCard>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { BarChart3, FileText, Activity, Loader2, Send, RefreshCw } from 'lucide-vue-next'
import { collection, getDocs } from 'firebase/firestore'

const { $db } = useNuxtApp()
const toast = useToast()
const appConfig = useAppConfig()
const { user, isAdmin } = useAuth()

const isDev = computed(() => import.meta.dev || ['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email) || isAdmin.value)

const reportEmails = ref('')


const devToolsLoading = reactive({
    report: false,
    preview: false,
    email: false,
    stats: false
})
const devToolsResults = reactive({
    report: null,
    email: null
})
// Email form state
const testEmail = reactive({
    template: 'general',
    to: '',
    subject: '',
    message: '',
    jsonData: '{}'
})

// System Stats
const systemStats = reactive({
    users: 0,
    posts: 0,
    deals: 0,
    tasks: 0
})

const prefillDailyData = () => {
    testEmail.jsonData = JSON.stringify({
        userName: 'Test User',
        stats: {
            views: 1250,
            likes: 450,
            comments: 12
        }
    }, null, 2)
}

// ...
const sendDailyReport = async () => {
    devToolsLoading.report = true
    devToolsResults.report = null
    try {
        const token = await user.value?.getIdToken()
        const response = await $fetch('/api/reports/daily', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        devToolsResults.report = {
            success: true,
            message: response.message || 'Daily report sent successfully!',
            results: response.results
        }
        toast.success('Daily report sent!')
    } catch (error) {
        devToolsResults.report = {
            success: false,
            message: error.data?.message || error.message || 'Failed to send report'
        }
        toast.error('Failed to send report')
    } finally {
        devToolsLoading.report = false
    }
}



const sendTestEmail = async () => {
    if (!testEmail.to) return
    devToolsLoading.email = true
    devToolsResults.email = null
    try {
        let payload = {
            to: testEmail.to,
            subject: testEmail.subject,
        }

        if (testEmail.template === 'daily') {
            payload.templateName = 'daily'
            try {
                payload.dynamicTemplateData = JSON.parse(testEmail.jsonData)
            } catch (e) {
                throw new Error("Invalid JSON in variables")
            }
        } else {
            // General
            payload.text = testEmail.message
            payload.html = `<div style="font-family: sans-serif; padding: 20px;"><h2>Test Email</h2><p>${testEmail.message}</p><hr><p style="color: #888; font-size: 12px;">Sent from ILYTAT Dev Tools</p></div>`
        }

        const token = await user.value?.getIdToken()
        const response = await $fetch('/api/email/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: payload
        })
        devToolsResults.email = {
            success: true,
            message: 'Test email sent successfully!',
            provider: response.provider
        }
        toast.success('Test email sent!')
    } catch (error) {
        devToolsResults.email = {
            success: false,
            message: error.data?.message || error.message || 'Failed to send email'
        }
        toast.error('Failed to send email')
    } finally {
        devToolsLoading.email = false
    }
}

const refreshSystemStats = async () => {
    devToolsLoading.stats = true
    try {
        const [usersSnap, postsSnap, dealsSnap, tasksSnap] = await Promise.all([
            getDocs(collection($db, 'users')),
            getDocs(collection($db, 'posts')),
            getDocs(collection($db, 'brand_deals')),
            getDocs(collection($db, 'tasks'))
        ])
        systemStats.users = usersSnap.size
        systemStats.posts = postsSnap.size
        systemStats.deals = dealsSnap.size
        systemStats.tasks = tasksSnap.size
    } catch (e) {
        console.error('Failed to fetch system stats:', e)
    } finally {
        devToolsLoading.stats = false
    }
}

const initialMount = () => {
    if (isDev.value) {
        reportEmails.value = '(configured in .env)'
        refreshSystemStats()
    }
    // Prefill on load for testing
    prefillDailyData()
}
onMounted(initialMount)
</script>
