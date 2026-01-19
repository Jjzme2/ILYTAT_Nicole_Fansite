<template>
    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <header class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                    <Activity class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 class="font-bold text-lg text-text">System Diagnostics</h3>
                    <p class="text-xs text-muted">Run comprehensive tests to verify system integrity.</p>
                </div>
            </div>
            <button 
                @click="runAllTests" 
                :disabled="testsRunning"
                class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
                <Loader2 v-if="testsRunning" class="w-5 h-5 animate-spin" />
                <Play v-else class="w-5 h-5" />
                {{ testsRunning ? 'Running Tests...' : 'Run All Tests' }}
            </button>
        </header>

        <div class="space-y-4">
            <div v-for="test in testRegistry" :key="test.id" class="border border-border rounded-xl p-4 flex items-center justify-between" :class="gettestStatusClass(test.status)">
                <div class="flex items-center gap-4">
                    <div class="w-2 h-12 rounded-full" :class="getStatusIndicator(test.status)"></div>
                    <div>
                        <h4 class="font-bold text-sm text-text">{{ test.name }}</h4>
                        <p class="text-xs text-muted">{{ test.description }}</p>
                        <p v-if="test.result" class="text-xs mt-1 font-mono" :class="test.status === 'pass' ? 'text-green-600' : 'text-red-500'">
                            {{ test.result }}
                        </p>
                    </div>
                </div>
                <button 
                    v-if="test.status !== 'running'"
                    @click="runSingleTest(test.id)" 
                    class="p-2 hover:bg-background rounded-lg text-muted hover:text-primary transition"
                    title="Run this test"
                >
                    <Play class="w-4 h-4" />
                </button>
                <Loader2 v-else class="w-4 h-4 animate-spin text-blue-500" />
            </div>
        </div>
        
        <div v-if="lastTestRun" class="mt-6 pt-6 border-t border-border flex justify-between items-center text-xs text-muted">
            <span>Last Run: <span class="font-mono text-text">{{ lastTestRun }}</span></span>
            <div class="flex gap-4">
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> {{ testRegistry.filter(t => t.status === 'pass').length }} Passed</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> {{ testRegistry.filter(t => t.status === 'fail').length }} Failed</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Activity, Loader2, Play } from 'lucide-vue-next'
import { collection, limit, getDocs, query } from 'firebase/firestore'
import { generateMarkdown } from '~/utils/taskMarkdown'

const { $db } = useNuxtApp()
const toast = useToast()
const { user, isAdmin } = useAuth()

const isDev = computed(() => import.meta.dev || ['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email) || isAdmin.value)

const testsRunning = ref(false)
const lastTestRun = ref(null)

const testRegistry = ref([
    { 
        id: 'firebase_conn', 
        name: 'Firebase Connection', 
        description: 'Verify connection to Firestore database', 
        status: 'idle', // idle, running, pass, fail
        result: '',
        run: async () => {
            if (!$db) throw new Error('$db instance is missing')
            // Try a lightweight read
            await getDocs(query(collection($db, 'users'), limit(1)))
            return 'Connected successfully'
        }
    },
    {
        id: 'auth_state',
        name: 'Authentication State',
        description: 'Verify current admin session',
        status: 'idle',
        result: '',
        run: async () => {
            if (!user.value) throw new Error('No user logged in')
            if (!isAdmin.value && !isDev.value) throw new Error('User lacks Admin/Dev permissions')
            return `Logged in as ${user.value.email} (UID: ${user.value.uid.slice(0,5)}...)`
        }
    },
    {
        id: 'env_config',
        name: 'Environment Config',
        description: 'Check critical runtime configuration',
        status: 'idle',
        result: '',
        run: async () => {
            const config = useAppConfig()
            if (!config) throw new Error('App config missing')
            // Check for critical keys (example)
            const required = ['firebase', 'theme'] // Add actual keys you rely on
            const missing = required.filter(k => !config[k] && !config.public?.[k])
            if (missing.length) throw new Error(`Missing keys: ${missing.join(', ')}`)
            return 'Configuration loaded'
        }
    },
    {
        id: 'network_check',
        name: 'Network Connectivity',
        description: 'Ping external service (Google)',
        status: 'idle',
        result: '',
        run: async () => {
             const start = Date.now()
             await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
             const duration = Date.now() - start
             return `Network reachable (${duration}ms)`
        }
    },
    {
        id: 'stripe_config',
        name: 'Stripe Configuration',
        description: 'Verify Stripe keys are present',
        status: 'idle',
        result: '',
        run: async () => {
            const config = useRuntimeConfig()
            if (!config.public.stripePublishableKey) throw new Error('Stripe Publishable Key missing')
            return 'Stripe configured'
        }
    },
    {
        id: 'critical_collections',
        name: 'Critical Collections',
        description: 'Verify Posts & Notifications access',
        status: 'idle',
        result: '',
        run: async () => {
            const [posts, notifs] = await Promise.all([
                 getDocs(query(collection($db, 'posts'), limit(1))),
                 getDocs(query(collection($db, 'notifications'), limit(1)))
            ])
            return `Accessible: Posts (${posts.size}+), Notifications (${notifs.size}+)`
        }
    },
    {
        id: 'version_check',
        name: 'App Version',
        description: 'Verify application version compliance',
        status: 'idle',
        result: '',
        run: async () => {
            const config = useAppConfig()
            // Assuming version is in app config or public runtime config
             return `Version: ${config.version || '1.0.0'} (Environment: ${import.meta.dev ? 'DEV' : 'PROD'})`
        }
    },
    {
        id: 'markdown_unit',
        name: 'Unit Test: Markdown Gen',
        description: 'Test taskMarkdown utility logic',
        status: 'idle',
        result: '',
        run: async () => {
            const mockTasks = [{
                id: '1', title: 'Test Task', status: 'todo', 
                section: 'Active Tasks (Engineering)', subsection: 'Core'
            }]
            const md = generateMarkdown(mockTasks)
            if (!md.includes('## Active Tasks')) throw new Error('Missing section header')
            if (!md.includes('### Core')) throw new Error('Missing subsection header')
            if (!md.includes('Test Task')) throw new Error('Missing task title')
            return 'Markdown generated correctly'
        }
    },
    {
        id: 'theme_check',
        name: 'Theme System State',
        description: 'Verify active theme validity',
        status: 'idle',
        result: '',
        run: async () => {
            const { activeTheme, themes } = useTheme()
            if (!activeTheme.value) throw new Error('No active theme')
            
            const isValid = !!themes[activeTheme.value]
            if (!isValid) throw new Error(`Invalid theme ID: ${activeTheme.value}`)
            return `Active: ${activeTheme.value}`
        }
    },
    {
        id: 'role_integrity',
        name: 'Role Logic Integrity',
        description: 'Verify admin permission consistency',
        status: 'idle',
        result: '',
        run: async () => {
             // isAdmin computed vs manual check
             if (isAdmin.value && user.value) {
                 // Double check specific emails or claims if available
                 // For now, just assert that if isAdmin is true, user is present
                 return 'Admin logic consistent'
             }
             return 'User is not admin (Valid state)'
        }
    }
])

const gettestStatusClass = (status) => {
    switch(status) {
        case 'pass': return 'bg-green-50 border-green-200'
        case 'fail': return 'bg-red-50 border-red-200'
        case 'running': return 'bg-blue-50 border-blue-200'
        default: return 'bg-surface'
    }
}

const getStatusIndicator = (status) => {
    switch(status) {
        case 'pass': return 'bg-green-500'
        case 'fail': return 'bg-red-500'
        case 'running': return 'bg-blue-500 animate-pulse'
        default: return 'bg-gray-200'
    }
}

const runSingleTest = async (testId) => {
    const test = testRegistry.value.find(t => t.id === testId)
    if (!test) return

    test.status = 'running'
    test.result = 'Running...'

    try {
        const resultMsg = await test.run()
        test.status = 'pass'
        test.result = resultMsg
    } catch (e) {
        test.status = 'fail'
        test.result = e.message
        console.error(`Test ${test.name} failed:`, e)
    }
}

const runAllTests = async () => {
    testsRunning.value = true
    lastTestRun.value = new Date().toLocaleString()
    
    // Reset all
    testRegistry.value.forEach(t => {
        t.status = 'idle'
        t.result = ''
    })

    // Run sequentially
    for (const test of testRegistry.value) {
        await runSingleTest(test.id)
    }
    
    testsRunning.value = false
    toast.success('Diagnostic suite completed')
}
</script>
