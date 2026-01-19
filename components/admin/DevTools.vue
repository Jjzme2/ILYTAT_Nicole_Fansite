<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Daily Report Section -->
        <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 class="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 class="font-bold text-lg text-text">Daily Report</h3>
                    <p class="text-xs text-muted">Manually trigger the daily analytics email.</p>
                </div>
            </div>

            <div class="bg-background rounded-xl p-4 mb-4 text-sm">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-muted">Recipients:</span>
                    <span class="font-mono text-xs text-text">{{ reportEmails || 'Not configured' }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-muted">Schedule:</span>
                    <span class="text-text font-medium">Daily @ 8:00 AM CST</span>
                </div>
            </div>

            <button 
                @click="sendDailyReport" 
                :disabled="devToolsLoading.report"
                class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
                <Loader2 v-if="devToolsLoading.report" class="w-4 h-4 animate-spin" />
                <Send v-else class="w-4 h-4" />
                {{ devToolsLoading.report ? 'Sending...' : 'Send Daily Report Now' }}
            </button>

            <div v-if="devToolsResults.report" class="mt-4 p-3 rounded-xl text-xs" :class="devToolsResults.report.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                <p class="font-bold mb-1">{{ devToolsResults.report.message }}</p>
                <pre v-if="devToolsResults.report.results" class="mt-2 text-[10px] overflow-auto max-h-32 bg-white/50 p-2 rounded">{{ JSON.stringify(devToolsResults.report.results, null, 2) }}</pre>
            </div>
        </div>

        <!-- Test Email Section -->
        <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-emerald-100 rounded-lg">
                    <Send class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 class="font-bold text-lg text-text">Test Email</h3>
                    <p class="text-xs text-muted">Verify email delivery configuration.</p>
                </div>
            </div>

            <form @submit.prevent="sendTestEmail" class="space-y-3">
                <input v-model="testEmail.to" type="email" placeholder="Recipient (e.g. you@example.com)" required class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-emerald-500 outline-none">
                <input v-model="testEmail.subject" type="text" placeholder="Subject" required class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-emerald-500 outline-none">
                <textarea v-model="testEmail.message" rows="2" placeholder="Message content..." required class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-emerald-500 outline-none resize-none"></textarea>
                
                <button 
                    type="submit" 
                    :disabled="devToolsLoading.email"
                    class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                    <Loader2 v-if="devToolsLoading.email" class="w-4 h-4 animate-spin" />
                    <Send v-else class="w-4 h-4" />
                    {{ devToolsLoading.email ? 'Sending...' : 'Send Test Email' }}
                </button>
            </form>

            <div v-if="devToolsResults.email" class="mt-4 p-3 rounded-xl text-xs" :class="devToolsResults.email.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                 <p class="font-bold">{{ devToolsResults.email.message }}</p>
                 <p v-if="devToolsResults.email.provider" class="text-[10px] opacity-75 mt-1">Provider: {{ devToolsResults.email.provider }}</p>
            </div>
        </div>

        <!-- System Status -->
        <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-amber-100 rounded-lg">
                        <Activity class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-text">System Status</h3>
                        <p class="text-xs text-muted">Current environment and configuration overview</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-background rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-primary">{{ systemStats.users }}</div>
                        <div class="text-xs text-muted uppercase mt-1">Users</div>
                    </div>
                    <div class="bg-background rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-emerald-500">{{ systemStats.posts }}</div>
                        <div class="text-xs text-muted uppercase mt-1">Posts</div>
                    </div>
                    <div class="bg-background rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-amber-500">{{ systemStats.deals }}</div>
                        <div class="text-xs text-muted uppercase mt-1">Brand Deals</div>
                    </div>
                    <div class="bg-background rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-purple-500">{{ systemStats.tasks }}</div>
                        <div class="text-xs text-muted uppercase mt-1">Dev Tasks</div>
                    </div>
                </div>

                <div class="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>Environment: <span class="font-mono font-bold" :class="isDev ? 'text-amber-500' : 'text-green-500'">{{ isDev ? 'DEVELOPMENT' : 'PRODUCTION' }}</span></span>
                    <button @click="refreshSystemStats" class="flex items-center gap-1 hover:text-primary transition">
                        <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': devToolsLoading.stats }" />
                        Refresh
                    </button>
                </div>
            </div>

            <!-- Configuration Viewer -->
            <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-slate-100 rounded-lg">
                        <FileText class="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-text">App Config</h3>
                        <p class="text-xs text-muted">Runtime configuration & environment.</p>
                    </div>
                </div>

                <div class="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-48">
                    <pre>{{ JSON.stringify(appConfig, null, 2) }}</pre>
                </div>
            </div>
        </div>

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
    email: false,
    stats: false
})
const devToolsResults = reactive({
    report: null,
    email: null
})
const testEmail = reactive({
    to: '',
    subject: 'Test Email from ILYTAT Dev Tools',
    message: 'This is a test email sent from the Dev Tools panel.'
})
const systemStats = reactive({
    users: 0,
    posts: 0,
    deals: 0,
    tasks: 0
})

const sendDailyReport = async () => {
    devToolsLoading.report = true
    devToolsResults.report = null
    try {
        const response = await $fetch('/api/reports/daily', { method: 'POST' })
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
        const response = await $fetch('/api/email/send', {
            method: 'POST',
            body: {
                to: testEmail.to,
                subject: testEmail.subject,
                text: testEmail.message,
                html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Test Email</h2><p>${testEmail.message}</p><hr><p style="color: #888; font-size: 12px;">Sent from ILYTAT Dev Tools</p></div>`
            }
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

onMounted(() => {
    if (isDev.value) {
        reportEmails.value = '(configured in .env)'
        refreshSystemStats()
    }
})
</script>
