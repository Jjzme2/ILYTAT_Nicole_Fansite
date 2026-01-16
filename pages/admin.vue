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
                @click="switchSection('engineering')"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', activeSection === 'engineering' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Wrench class="w-5 h-5" />
                Engineering
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
                 <NuxtLink v-if="role === 'creator'" to="/creator" class="text-xs font-bold text-indigo-600 border border-indigo-200 px-2 py-1 rounded-full">Studio</NuxtLink>
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

                <!-- Users Table with Notify Action -->
                <div class="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-surface/50 border-b border-border">
                            <tr>
                                <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Email</th>
                                <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Role</th>
                                <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Subscriber</th>
                                <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider">Joined</th>
                                <th class="p-4 text-xs font-bold text-text opacity-70 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            <tr v-for="u in userList" :key="u.id" class="hover:bg-background/50">
                                <td class="p-4 font-medium text-text">
                                    <div class="flex flex-col">
                                        <span>{{ u.email }}</span>
                                        <span class="text-[10px] text-muted font-mono">{{ u.id }}</span>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-wrap gap-1 items-center">
                                        <span 
                                            v-for="r in (u.roles && u.roles.length ? u.roles : [u.role || 'user'])" 
                                            :key="r" 
                                            class="px-2 py-0.5 rounded text-[10px] uppercase font-bold border flex items-center gap-1 transition"
                                            :class="getRoleBadgeClass(r)"
                                        >
                                            {{ r }}
                                            <button @click="removeUserRole(u, r)" class="hover:text-red-600 rounded-full p-0.5 transition"><XCircle class="w-3 h-3"/></button>
                                        </span>
                                        
                                        <!-- Quick Add Dropdown -->
                                        <div class="relative group">
                                            <button class="px-2 py-0.5 rounded-full border border-dashed border-muted text-muted hover:border-primary hover:text-primary transition flex items-center justify-center">
                                                <Plus class="w-3 h-3" />
                                            </button>
                                            <div class="absolute top-full left-0 mt-1 bg-surface border border-border shadow-xl rounded-xl p-1 hidden group-hover:grid z-50 w-32 animate-in fade-in slide-in-from-top-1">
                                                <button 
                                                    v-for="opt in ['admin', 'creator', 'developer', 'user']" 
                                                    :key="opt" 
                                                    @click="addUserRole(u, opt)" 
                                                    class="text-left px-3 py-2 text-xs font-medium hover:bg-background rounded-lg transition"
                                                >
                                                    {{ opt }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span v-if="u.isSubscriber" class="text-green-500 font-bold flex items-center gap-1">
                                        <Check class="w-4 h-4" /> Active
                                    </span>
                                    <span v-else class="text-muted text-xs">Free</span>
                                </td>
                                <td class="p-4 text-sm text-muted">{{ formatDate(u.createdAt) }}</td>
                                <td class="p-4 text-right">
                                    <button 
                                        @click="initiateNotification(u)" 
                                        class="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition" 
                                        title="Send Notification"
                                    >
                                        <Bell class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="loadingUsers">
                                <td colspan="5" class="p-8 text-center text-muted">
                                    <div class="flex items-center justify-center gap-2">
                                        <Loader2 class="w-5 h-5 animate-spin" />
                                        <span>Loading users...</span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else-if="userList.length === 0">
                                <td colspan="5" class="p-8 text-center text-muted">No users found.</td>
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

            <!-- INBOX TAB -->
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
                <header class="mb-6 bg-surface p-6 rounded-2xl border border-border shadow-sm flex justify-between items-center">
                    <div>
                         <h2 class="text-2xl font-serif text-text mb-1">Communications Center</h2>
                         <p class="text-muted text-sm">Manage global broadcasts and direct user notifications.</p>
                    </div>
                    <div class="flex gap-2">
                         <button 
                            @click="broadcastMode = 'global'" 
                            :class="['px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2', broadcastMode === 'global' ? 'bg-primary text-white' : 'bg-background hover:bg-gray-100 text-text']"
                        >
                            <Megaphone class="w-4 h-4" /> Global Broadcast
                        </button>
                        <button 
                            @click="broadcastMode = 'direct'" 
                            :class="['px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2', broadcastMode === 'direct' ? 'bg-indigo-600 text-white' : 'bg-background hover:bg-gray-100 text-text']"
                        >
                            <Bell class="w-4 h-4" /> Direct Notification
                        </button>
                    </div>
                </header>

                <div class="grid lg:grid-cols-2 gap-8">
                    
                    <!-- GLOBAL BROADCAST MODE -->
                    <div v-if="broadcastMode === 'global'" class="bg-surface rounded-2xl border border-border p-6 h-fit animate-in fade-in slide-in-from-left-4">
                        <h3 class="font-bold text-lg mb-4 text-text flex items-center gap-2">
                            <Megaphone class="w-5 h-5 text-primary" />
                            New Global Broadcast
                        </h3>
                        <form @submit.prevent="createBroadcast" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Message Content</label>
                                <textarea v-model="newBroadcast.content" required rows="3" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none resize-none" placeholder="e.g. Server maintenance in 10 mins..."></textarea>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-muted uppercase mb-1">Type</label>
                                    <select v-model="newBroadcast.type" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none">
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="error">Error</option>
                                        <option value="announcement">Announcement</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-muted uppercase mb-1">Style</label>
                                    <select v-model="newBroadcast.style" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-primary outline-none">
                                        <option value="toast">Toast (Popup)</option>
                                        <option value="banner">Banner (Top)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="p-4 bg-background rounded-xl border border-border space-y-3">
                                <div class="flex items-center justify-between">
                                    <label class="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" v-model="newBroadcast.dismissible" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary">
                                        <span class="text-sm font-medium">User Can Dismiss</span>
                                    </label>
                                    
                                    <!-- Card Options (New) -->
                                    <div class="flex items-center gap-2">
                                        <label class="text-xs font-bold text-muted uppercase">Theme:</label>
                                        <select v-model="newBroadcast.cardTheme" class="bg-surface border border-border rounded-lg text-xs p-1 focus:border-primary outline-none">
                                            <option value="standard">Standard (Colored)</option>
                                            <option value="neutral">Neutral (B&W)</option>
                                        </select>
                                    </div>
                                </div>

                                <div v-if="!newBroadcast.dismissible" class="flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <label class="text-xs font-bold text-muted uppercase whitespace-nowrap">Duration (Hours)</label>
                                    <input v-model="newBroadcast.durationHours" type="number" min="1" class="w-20 bg-surface border border-border rounded-lg p-2 text-sm focus:border-primary outline-none">
                                </div>
                            </div>

                            <button type="submit" :disabled="sendingBroadcast" class="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                                <Megaphone class="w-4 h-4" />
                                {{ sendingBroadcast ? 'Sending...' : 'Broadcast Now' }}
                            </button>
                        </form>
                    </div>

                    <!-- DIRECT NOTIFICATION MODE -->
                    <div v-if="broadcastMode === 'direct'" class="bg-surface rounded-2xl border border-border p-6 h-fit animate-in fade-in slide-in-from-right-4">
                        <h3 class="font-bold text-lg mb-4 text-text flex items-center gap-2">
                            <Bell class="w-5 h-5 text-indigo-600" />
                            Send Direct Notification
                        </h3>
                        <form @submit.prevent="sendDirectNotification" class="space-y-4">
                            <div class="relative">
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Recipient</label>
                                
                                <!-- Search Input (if no user selected) -->
                                <div v-if="!newNotification.targetId" class="relative">
                                    <input 
                                        v-model="userSearchQuery" 
                                        @input="handleUserSearch" 
                                        type="text" 
                                        placeholder="Search user by email..." 
                                        class="w-full bg-background border border-border rounded-xl pl-10 p-3 text-sm focus:border-indigo-500 outline-none"
                                    >
                                    <Search class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <div v-if="isSearchingUsers" class="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 class="w-4 h-4 text-indigo-500 animate-spin" />
                                    </div>

                                    <!-- Results Dropdown -->
                                    <div v-if="userSearchResults.length > 0" class="absolute z-10 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        <button 
                                            v-for="u in userSearchResults" 
                                            :key="u.id" 
                                            @click="selectUser(u)"
                                            type="button"
                                            class="w-full text-left p-3 hover:bg-background/50 text-sm flex items-center justify-between border-b border-border last:border-0"
                                        >
                                            <span class="font-bold text-text truncate">{{ u.email }}</span>
                                            <span class="text-[10px] text-muted font-mono shrink-0 ml-2">UID: {{ u.id.slice(0,4) }}...</span>
                                        </button>
                                    </div>
                                    <div v-else-if="userSearchQuery.length > 2 && !isSearchingUsers && userSearchResults.length === 0" class="absolute z-10 top-full mt-1 px-3 py-2 text-xs text-muted">
                                        No users found.
                                    </div>
                                </div>

                                <!-- Selected User Display -->
                                <div v-else class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p class="text-xs font-bold text-indigo-800">Sending to:</p>
                                        <p class="text-sm font-medium text-indigo-900">{{ newNotification.targetEmail }}</p>
                                        <p class="text-[10px] text-indigo-400 font-mono">{{ newNotification.targetId }}</p>
                                    </div>
                                    <button @click="clearSelectedUser" type="button" class="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                                        <X class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Title</label>
                                <input v-model="newNotification.title" required type="text" placeholder="e.g. You won!" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Message</label>
                                <textarea v-model="newNotification.message" required rows="3" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Notification body..."></textarea>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Action URL (Optional)</label>
                                <input v-model="newNotification.actionUrl" type="text" placeholder="/settings" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-muted uppercase mb-1">Type</label>
                                <select v-model="newNotification.type" class="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-indigo-500 outline-none">
                                    <option value="alert">Alert</option>
                                    <option value="success">Success</option>
                                    <option value="brand_deal">Brand Deal</option>
                                    <option value="giveaway">Giveaway</option>
                                </select>
                            </div>

                            <button type="submit" :disabled="sendingNotification" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                                <Bell class="w-4 h-4" />
                                {{ sendingNotification ? 'Sending...' : 'Send Notification' }}
                            </button>
                        </form>
                    </div>

                    <!-- Active Broadcasts / History List -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                             <h3 class="font-bold text-lg text-text">Active Messages</h3>
                        </div>
                        
                        <div class="space-y-3">
                            <div v-for="msg in activeBroadcasts" :key="msg.id" class="bg-surface rounded-2xl border border-border p-4 flex items-start gap-4 hover:shadow-md transition group relative overflow-hidden">
                                <div 
                                    class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                    :class="msg.style === 'banner' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'"
                                >
                                    <Megaphone class="w-5 h-5" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-background border border-border text-muted">{{ msg.type }}</span>
                                        <span v-if="!msg.dismissible" class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-600">Must Read</span>
                                    </div>
                                    <p class="text-sm font-medium text-text leading-snug break-words">{{ msg.content }}</p>
                                    <p class="text-xs text-muted mt-2">{{ formatDate(msg.createdAt) }}</p>
                                </div>
                                <button @click="deactivateBroadcast(msg.id)" class="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Stop Broadcast">
                                    <XCircle class="w-5 h-5" />
                                </button>
                            </div>
                            <div v-if="activeBroadcasts.length === 0" class="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
                                <Megaphone class="w-8 h-8 mx-auto text-muted/30 mb-2" />
                                <p class="text-muted text-sm">No active broadcasts.</p>
                            </div>
                        </div>
                    </div>
                </div>
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

             <!-- GIVEAWAYS TAB -->
            <div v-if="activeSubTab === 'giveaways'">
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

        <!-- ENGINEERING SECTION -->
        <div v-if="activeSection === 'engineering'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Sub-Nav -->
            <div class="flex gap-1 mb-8 bg-surface p-1 rounded-xl border border-border inline-flex">
                <button @click="activeSubTab = 'tasks'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'tasks' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Dev Board</button>
                <button v-if="isDev" @click="activeSubTab = 'tools'" :class="['px-6 py-2 rounded-lg text-sm font-bold transition', activeSubTab === 'tools' ? 'bg-background shadow-sm text-text' : 'text-muted hover:text-text hover:bg-background/50']">Dev Tools</button>
            </div>

            <div v-if="activeSubTab === 'tasks'">
                <AdminTaskBoard />
            </div>

            <!-- DEV TOOLS TAB -->
            <div v-if="isDev && activeSubTab === 'tools'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
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
                        class="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Loader2 v-if="devToolsLoading.report" class="w-5 h-5 animate-spin" />
                        <Mail v-else class="w-5 h-5" />
                        {{ devToolsLoading.report ? 'Sending...' : 'Send Report Now' }}
                    </button>

                    <div v-if="devToolsResults.report" class="mt-4 p-4 rounded-xl text-sm" :class="devToolsResults.report.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                        <div class="flex items-center gap-2 mb-2">
                            <CheckCircle v-if="devToolsResults.report.success" class="w-4 h-4 text-green-600" />
                            <XCircle v-else class="w-4 h-4 text-red-600" />
                            <span :class="devToolsResults.report.success ? 'text-green-700 font-bold' : 'text-red-700 font-bold'">
                                {{ devToolsResults.report.message }}
                            </span>
                        </div>
                        <div v-if="devToolsResults.report.results" class="space-y-1">
                            <div v-for="r in devToolsResults.report.results" :key="r.email" class="flex items-center gap-2 text-xs">
                                <CheckCircle v-if="r.success" class="w-3 h-3 text-green-500" />
                                <XCircle v-else class="w-3 h-3 text-red-500" />
                                <span class="font-mono">{{ r.email }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                    <!-- Email Test Section -->
                    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-emerald-100 rounded-lg">
                                <Mail class="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-text">Test Email</h3>
                                <p class="text-xs text-muted">Send a test email to verify SMTP/SendGrid configuration</p>
                            </div>
                        </div>

                        <div class="space-y-3 mb-4">
                            <input 
                                v-model="testEmail.to" 
                                type="email" 
                                placeholder="Recipient email"
                                class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none text-text"
                            >
                            <input 
                                v-model="testEmail.subject" 
                                type="text" 
                                placeholder="Subject"
                                class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none text-text"
                            >
                            <textarea 
                                v-model="testEmail.message" 
                                placeholder="Message content..."
                                rows="3"
                                class="w-full bg-background border border-border rounded-xl p-3 focus:border-primary outline-none text-text resize-none"
                            ></textarea>
                        </div>

                        <button 
                            @click="sendTestEmail" 
                            :disabled="devToolsLoading.email || !testEmail.to"
                            class="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Loader2 v-if="devToolsLoading.email" class="w-5 h-5 animate-spin" />
                            <Mail v-else class="w-5 h-5" />
                            {{ devToolsLoading.email ? 'Sending...' : 'Send Test Email' }}
                        </button>

                        <div v-if="devToolsResults.email" class="mt-4 p-4 rounded-xl text-sm" :class="devToolsResults.email.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                            <div class="flex items-center gap-2">
                                <CheckCircle v-if="devToolsResults.email.success" class="w-4 h-4 text-green-600" />
                                <XCircle v-else class="w-4 h-4 text-red-600" />
                                <span :class="devToolsResults.email.success ? 'text-green-700' : 'text-red-700'">
                                    {{ devToolsResults.email.message }}
                                </span>
                            </div>
                            <p v-if="devToolsResults.email.provider" class="text-xs text-muted mt-1">
                                Provider: <span class="font-mono">{{ devToolsResults.email.provider }}</span>
                            </p>
                        </div>
                    </div>

                    <!-- System Status Section -->
                    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-purple-100 rounded-lg">
                                <Server class="w-5 h-5 text-purple-600" />
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

    </main>
  </div>
</template>

<script setup>
definePageMeta({
    middleware: 'admin'
})
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc, startAfter, endBefore, limit, limitToLast, deleteDoc, where, onSnapshot, updateDoc } from 'firebase/firestore'
import { 
    LayoutDashboard, ExternalLink, LogOut, Check,
    Users, Briefcase, Plus, User, Zap, Bug, Hammer, Trash2, Clipboard, Archive,
    Rocket, Flame, Github, CreditCard, BarChart3, Triangle, Globe, ArrowLeft,
    Wrench, Mail, FileText, Server, RefreshCw, CheckCircle, XCircle, Loader2, MessageCircle, ShoppingBag, Bell, Search, Palette, ToggleLeft
} from 'lucide-vue-next'
import { generateMarkdown } from '~/utils/taskMarkdown'

const { $db } = useNuxtApp()
const { logout, user, isAdmin, role, isDeveloper } = useAuth()
const toast = useToast()
const appConfig = useAppConfig()

// --- GIFT/GIVEAWAY ICONS ---
import { Gift, Calendar, Trophy } from 'lucide-vue-next'

// ... existing imports ...

// TABS & NAVIGATION (Consolidated)
const activeSection = ref('launchpad')
const activeSubTab = ref('')

// Initialize subtabs when switching main sections
const switchSection = (sectionId) => {
    activeSection.value = sectionId
    // Default subtabs
    if (sectionId === 'community') activeSubTab.value = 'users'
    if (sectionId === 'business') activeSubTab.value = 'deals'
    if (sectionId === 'engineering') activeSubTab.value = 'tasks'
}

const currentTab = computed(() => { // Maintain compatibility for v-ifs I haven't updated yet or if I use this for global checks
    if (activeSection.value === 'launchpad') return 'launchpad'
    return activeSection.value // fallback
})

// Dev Tools Extension
const isDevMode = computed(() => process.dev || user.value?.email?.includes('admin')) // Simplified dev check
const showConfig = ref(false) // Toggle for viewing app config

const uploading = ref(false)
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
import { Megaphone } from 'lucide-vue-next'
import { Timestamp } from 'firebase/firestore' // Import Timestamp

const newBroadcast = ref({
    content: '',
    type: 'info',
    style: 'toast',
    dismissible: true,
    cardTheme: 'standard', // 'standard' | 'neutral'
    durationHours: 24 // Default duration if not dismissible
})
const sendingBroadcast = ref(false)
const activeBroadcasts = ref([])
// Realtime listener for active broadcasts
onMounted(() => {
    const q = query(
        collection($db, 'system_messages'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
    )
    onSnapshot(q, (snap) => {
        activeBroadcasts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
})

const createBroadcast = async () => {
    if (!newBroadcast.value.content) return
    
    sendingBroadcast.value = true
    try {
        const payload = {
            ...newBroadcast.value,
            isActive: true,
            createdAt: serverTimestamp(),
            createdBy: user.value.uid
        }

        // Calculate expiration if not dismissible
        if (!newBroadcast.value.dismissible) {
            const now = new Date()
            now.setHours(now.getHours() + parseInt(newBroadcast.value.durationHours))
            payload.expiresAt = Timestamp.fromDate(now)
        }

        await addDoc(collection($db, 'system_messages'), payload)
        toast.success('Broadcast sent!')
        newBroadcast.value.content = '' // Reset content only, keep settings
    } catch (e) {
        console.error(e)
        toast.error('Failed to send broadcast')
    } finally {
        sendingBroadcast.value = false
    }
}

// --- DIRECT NOTIFICATIONS LOGIC ---
const broadcastMode = ref('global') // 'global' or 'direct'
const sendingNotification = ref(false)
const newNotification = ref({
    targetId: '',
    targetEmail: '',
    title: '',
    message: '',
    actionUrl: '',
    type: 'alert'
})

const initiateNotification = (userObj) => {
    activeSubTab.value = 'broadcasts'
    broadcastMode.value = 'direct'
    newNotification.value.targetId = userObj.id
    newNotification.value.targetEmail = userObj.email
    userSearchQuery.value = userObj.email // Pre-fill search with email
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// User Search Logic
const userSearchQuery = ref('')
const userSearchResults = ref([])
const isSearchingUsers = ref(false)

const handleUserSearch = async () => {
    if (userSearchQuery.value.length < 2) {
        userSearchResults.value = []
        return
    }

    isSearchingUsers.value = true
    try {
        // Simple search by email prefix
        // Note: Firestore requires specific indexing for '>=', but this often works for simple cases or small datasets
        // Ideally use Algolia or Typesense for real search. 
        // Here we'll try a simple range query on email. 
        // For standard Firestore this works: orderBy Name, startAt(...), endAt(...)
        
        const q = query(
            collection($db, 'users'), 
            orderBy('email'), 
            startAfter(userSearchQuery.value), 
            limit(5)
        )
        // Actually, startAt is better for prefix 'matching' if exact.
        // Let's just fetch recent users and filter client side if the db is small, 
        // OR rely on a query that might fail without an index.
        // Let's try client-side filtering of the `userList` first if it's already populated?
        // But `userList` is paginated.
        
        // Let's use a simpler approach: Query for exact match or closest
        const q2 = query(
            collection($db, 'users'),
            where('email', '>=', userSearchQuery.value),
            where('email', '<=', userSearchQuery.value + '\uf8ff'),
            limit(5)
        )
        
        const snap = await getDocs(q2)
        userSearchResults.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('User search failed', e)
    } finally {
        isSearchingUsers.value = false
    }
}

const selectUser = (u) => {
    newNotification.value.targetId = u.id
    newNotification.value.targetEmail = u.email
    userSearchQuery.value = u.email
    userSearchResults.value = [] // Close dropdown
}

const clearSelectedUser = () => {
    newNotification.value.targetId = ''
    newNotification.value.targetEmail = ''
    userSearchQuery.value = ''
    userSearchResults.value = []
}

const sendDirectNotification = async () => {
    if (!newNotification.value.targetId || !newNotification.value.message) return

    sendingNotification.value = true
    try {
        await addDoc(collection($db, 'users', newNotification.value.targetId, 'notifications'), {
            title: newNotification.value.title,
            message: newNotification.value.message,
            actionUrl: newNotification.value.actionUrl,
            type: newNotification.value.type,
            read: false,
            createdAt: serverTimestamp(),
            createdBy: user.value.uid
        })
        toast.success(`Notification sent to ${newNotification.value.targetEmail || 'user'}`)
        
        // Reset form
        newNotification.value = {
            targetId: '',
            targetEmail: '',
            title: '',
            message: '',
            actionUrl: '',
            type: 'alert'
        }
    } catch (e) {
        console.error(e)
        toast.error('Failed to send notification: ' + e.message)
    } finally {
        sendingNotification.value = false
    }
}

const deactivateBroadcast = async (id) => {
    if (!confirm('Stop showing this message?')) return
    try {
        await updateDoc(doc($db, 'system_messages', id), {
            isActive: false
        })
        toast.success('Broadcast deactivated')
    } catch (e) {
        console.error(e)
        toast.error('Failed to deactivate')
    }
}

// --- DEV TOOLS LOGIC ---
const isDev = computed(() => import.meta.dev || ['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email) || isAdmin.value)
// Only true in development mode OR for Admin
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

// Fetch report emails info on mount (if in dev mode)
onMounted(() => {
    if (isDev) {
        // We'll just show a placeholder since env vars aren't accessible client-side
        // The actual emails are handled server-side
        reportEmails.value = '(configured in .env)'
        refreshSystemStats()
    }
})




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
        toast.success('Round added!')
    } catch (e) {
        console.error(e)
        alert('Failed to add round: ' + e.message)
    } finally {
        uploading.value = false
    }
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
    // Handle Event object from click listeners
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

const getRoleBadgeClass = (r) => {
    switch(r) {
        case 'admin': return 'bg-red-100 text-red-700 border-red-200'
        case 'creator': return 'bg-purple-100 text-purple-700 border-purple-200'
        case 'developer': return 'bg-blue-100 text-blue-700 border-blue-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
        // Option: allow upgrading to 'user' if removing only role? 
        // Or just block emptying. Let's block for safety, or default to ['user'] if removing 'admin' e.g.
        // If they remove 'user' from ['user'], maybe allow? But app expects auth.
        // Let's enforce at least one role.
        toast.error('User must have at least one role.')
        return
    }
    await saveUserRoles(u, newRoles)
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
            const dealRef = await addDoc(collection($db, 'brand_deals'), {
                ...newDeal.value,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })

            // Create a notification for admins/creators
            await addDoc(collection($db, 'notifications'), {
                type: 'brand_deal',
                title: `New Brand Deal: ${newDeal.value.brandName}`,
                message: `A new deal worth ${newDeal.value.value} has been added. Contact: ${newDeal.value.contactName}`,
                read: false,
                actionUrl: '/admin?tab=deals',
                createdAt: serverTimestamp()
            })

            // Send email notification (optional, requires SMTP config)
            try {
                await $fetch('/api/email/send', {
                    method: 'POST',
                    body: {
                        to: 'nicole@ilytat.com', // TODO: Use config
                        subject: `New Brand Deal: ${newDeal.value.brandName}`,
                        text: `A new brand deal has been added!\n\nBrand: ${newDeal.value.brandName}\nValue: ${newDeal.value.value}\nContact: ${newDeal.value.contactName} (${newDeal.value.contactEmail})\n\nDeliverables: ${newDeal.value.deliverables}`,
                        html: `
                            <h2>New Brand Deal Added</h2>
                            <p><strong>Brand:</strong> ${newDeal.value.brandName}</p>
                            <p><strong>Value:</strong> ${newDeal.value.value}</p>
                            <p><strong>Contact:</strong> ${newDeal.value.contactName} (${newDeal.value.contactEmail})</p>
                            <p><strong>Deliverables:</strong> ${newDeal.value.deliverables}</p>
                        `
                    }
                })
            } catch (emailErr) {
                console.warn('[BrandDeal] Email notification failed (SMTP may not be configured):', emailErr)
            }
        }
       
        showDealForm.value = false
        // Reset
        newDeal.value = { id: null, brandName: '', value: '', contactName: '', contactEmail: '', status: 'pending', deliverables: '', notes: '' }
        await fetchDeals()
        toast.success('Brand deal saved!')
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
watch(activeSubTab, (tab) => {
    if (tab === 'users') fetchUsers()
    if (tab === 'deals') fetchDeals()
    if (tab === 'giveaways') fetchCampaigns()
}, { immediate: true })
</script>

<style scoped>
/* Resetting style block to fix Vite HMR error */
</style>
