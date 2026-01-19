<template>
  <div class="min-h-screen bg-background flex">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-surface border-r border-border text-text hidden md:flex flex-col p-6">
        <div class="mb-10">
            <h1 class="text-2xl font-bold tracking-tight">THE STUDIO</h1>
            <p class="text-xs text-primary mt-1">Creator Dashboard</p>
        </div>
        
        <nav class="space-y-2 flex-1">
            <button 
                @click="currentTab = 'content'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'content' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <LayoutDashboard class="w-5 h-5" />
                Create Content
            </button>
            <button 
                @click="currentTab = 'media-kit'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'media-kit' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Pencil class="w-5 h-5" />
                Media Kit
            </button>
             <button 
                @click="currentTab = 'suggestions'"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition', currentTab === 'suggestions' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text']"
            >
                <Lightbulb class="w-5 h-5" />
                Suggestions
            </button>
            <NuxtLink 
                to="/merch"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-muted hover:text-text transition"
            >
                <ShoppingBag class="w-5 h-5" />
                Merch Store
            </NuxtLink>

            <div class="pt-4 mt-4 border-t border-border space-y-2">
                <a v-if="isAdmin || isDeveloper" href="/admin" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text rounded-xl text-sm font-medium transition">
                    <Briefcase class="w-5 h-5" />
                    Admin Office
                </a>
                <a href="/feed" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text rounded-xl text-sm font-medium transition">
                    <ExternalLink class="w-5 h-5" />
                    View Feed
                </a>
                <a href="/profile" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text rounded-xl text-sm font-medium transition">
                    <UserCircle class="w-5 h-5" />
                    My Profile
                </a>
            </div>
        </nav>

        <button @click="showDevTaskModal = true" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text transition text-sm font-medium mt-auto">
            <Bug class="w-5 h-5" />
            Report Issue
        </button>

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
                <h1 class="font-bold text-xl">THE STUDIO</h1>
            </div>
            <div class="flex gap-4 items-center">
                <NuxtLink v-if="isAdmin || isDeveloper" to="/admin" class="text-xs font-bold font-mono uppercase text-muted border border-border px-2 py-1 rounded">Admin</NuxtLink>
                <button @click="logout" class="text-xs text-red-500 font-medium">Log Out</button>
            </div>
        </div>

        <!-- Mobile Tab Navigation -->
        <div class="md:hidden flex overflow-x-auto gap-2 mb-8 pb-2 -mx-6 px-6 scrollbar-hide">
             <button @click="currentTab = 'content'" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition', currentTab === 'content' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Content
            </button>
             <button @click="currentTab = 'media-kit'" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition', currentTab === 'media-kit' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Media Kit
            </button>
             <button @click="currentTab = 'suggestions'" :class="['whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition', currentTab === 'suggestions' ? 'bg-text text-background border-text' : 'bg-surface border-border text-muted']">
                Suggestions
            </button>
        </div>

        <!-- CONTENT TAB -->
        <div v-if="currentTab === 'content'">
            <header class="mb-10">
                <h2 class="text-3xl font-serif text-text mb-2">{{ editingPostId ? 'Edit Content' : 'Create New Content' }}</h2>
                <p class="text-muted">
                    {{ editingPostId ? 'Update your post details below.' : 'Select a format to start posting to your exclusive feed.' }}
                </p>
            </header>

            <!-- Action Grid -->
            <div v-if="!file && postType !== 'text' && !captureMode" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                
                <button @click="startCapture('photo')" class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Camera class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Take Photo</span>
                </button>

                <button @click="startCapture('video')" class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Video class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Record Video</span>
                </button>

                <button @click="startCapture('audio')" class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Mic class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Record Audio</span>
                </button>

                <button @click="selectType('text')" class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <FileText class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Write Text</span>
                </button>

                 <button @click="startCapture('link')" class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Link class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Embed Link</span>
                </button>

                 <label class="aspect-square bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary transition flex flex-col items-center justify-center gap-3 group cursor-pointer">
                    <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                        <Upload class="w-6 h-6" />
                    </div>
                    <span class="font-medium text-sm">Upload File</span>
                    <input type="file" class="hidden" @change="onFileSelected" accept="image/*,video/*,audio/*">
                </label>

            </div>

            <!-- Random Drop Button (Special) + Bug Report -->
            <div v-if="!file && postType !== 'text' && !captureMode" class="mb-10 flex gap-4">
                 <button @click="startRandomDrop" class="flex-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-dashed border-purple-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-purple-500/20 hover:border-purple-500 transition group">
                    <Sparkles class="w-5 h-5 text-purple-500 group-hover:rotate-12 transition" />
                    <span class="font-bold text-purple-700 dark:text-purple-300">Random Drop</span>
                    <span class="text-xs text-muted">(Post to Random Room)</span>
                </button>
                 <button @click="showDevTaskModal = true" class="flex-1 bg-surface border-2 border-dashed border-border rounded-2xl p-4 flex items-center justify-center gap-3 hover:border-primary transition group">
                    <Bug class="w-5 h-5 text-muted group-hover:text-primary transition" />
                    <span class="font-bold text-muted group-hover:text-primary transition">Report Issue</span>
                    <span class="text-xs text-muted">(Found a bug?)</span>
                </button>
            </div>

             <!-- Editor / Preview Area -->
            <div v-if="file || postType === 'text' || captureMode === 'link'" class="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="p-4 border-b border-border flex justify-between items-center bg-background/50">
                    <h3 class="font-bold">New Post Details</h3>
                    <button @click="resetForm" class="text-muted hover:text-text text-sm">Cancel</button>
                </div>
                
                <div class="p-6 md:p-8 space-y-6">
                    <!-- Preview -->
                    <div v-if="file" class="w-full bg-black rounded-lg overflow-hidden flex justify-center bg-checkered">
                        <img v-if="postType === 'image'" :src="previewUrl" class="max-h-[400px] object-contain">
                        <video v-if="postType === 'video'" ref="videoPreviewRef" :src="previewUrl" controls class="max-h-[400px] w-full"></video>
                        <audio v-if="postType === 'audio'" :src="previewUrl" controls class="w-full my-4"></audio>
                    </div>

                    <!-- Embed Options -->
                    <div v-if="captureMode === 'link'" class="space-y-3">
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label class="block text-sm font-bold text-muted mb-1">Platform</label>
                                <select v-model="embedPlatform" class="w-full border-2 border-border rounded-xl p-3 focus:border-primary focus:ring-0 outline-none bg-background text-text">
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="vimeo">Vimeo</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-bold text-muted mb-1">Video ID or Link</label>
                                <input 
                                    v-model="embedInput" 
                                    type="text" 
                                    :placeholder="embedPlatform === 'youtube' ? 'e.g. dQw4w9WgXcQ' : 'Paste full URL'" 
                                    class="w-full border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none"
                                    @input="processEmbedInput"
                                >
                            </div>
                        </div>
                        <p class="text-xs text-muted">
                            <span v-if="embedPlatform === 'youtube'">Enter the Video ID (the part after v=) or paste the full link.</span>
                            <span v-else>Paste the full share link for your video.</span>
                        </p>
                        
                        <!-- Preview of what will be saved -->
                        <div v-if="embedUrl" class="text-xs text-indigo-500 font-medium bg-indigo-50 p-2 rounded truncate">
                            Will embed: {{ embedUrl }}
                        </div>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="handleUpload" class="space-y-6">
                        <!-- Subtype Selector for Text -->
                        <div v-if="postType === 'text'">
                            <label class="block text-sm font-bold text-muted mb-2">Post Category</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" @click="postSubtype = 'status'" :class="['p-3 rounded-xl border-2 text-sm font-bold transition', postSubtype === 'status' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted hover:border-text']">Status Update</button>
                                <button type="button" @click="postSubtype = 'quote'" :class="['p-3 rounded-xl border-2 text-sm font-bold transition', postSubtype === 'quote' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted hover:border-text']">Quote</button>
                                <button type="button" @click="postSubtype = 'motivation'" :class="['p-3 rounded-xl border-2 text-sm font-bold transition', postSubtype === 'motivation' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted hover:border-text']">Motivational</button>
                                <button type="button" @click="postSubtype = 'blog'" :class="['p-3 rounded-xl border-2 text-sm font-bold transition', postSubtype === 'blog' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted hover:border-text']">Blog Post</button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-muted mb-2">
                                 {{ postType === 'text' ? 'Message' : 'Caption' }}
                            </label>
                            <textarea 
                                v-model="caption"
                                :rows="postType === 'text' ? 6 : 3"
                                class="w-full border-2 border-border bg-background text-text rounded-xl p-4 focus:border-primary focus:ring-0 outline-none transition resize-none text-lg"
                                :placeholder="postType === 'text' ? 'What\'s on your mind?' : 'Add a caption...'"
                            ></textarea>
                        </div>

                         <!-- Citation Input (Quotes Only) -->
                        <div v-if="postType === 'text' && postSubtype === 'quote'" class="animate-in fade-in slide-in-from-top-2">
                            <label class="block text-sm font-bold text-muted mb-2">Author / Citation</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-serif italic">—</span>
                                <input 
                                    v-model="citation" 
                                    type="text" 
                                    placeholder="e.g. Maya Angelou" 
                                    class="w-full border-2 border-border bg-background text-text rounded-xl pl-10 p-4 focus:border-primary focus:ring-0 outline-none transition"
                                >
                            </div>
                        </div>

                         <!-- Title Input (Blog Only) -->
                        <div v-if="postType === 'text' && postSubtype === 'blog'" class="animate-in fade-in slide-in-from-top-2">
                            <label class="block text-sm font-bold text-muted mb-2">Title</label>
                            <input 
                                v-model="title" 
                                type="text" 
                                placeholder="Chapter 1: The Beginning" 
                                class="w-full border-2 border-border bg-background text-text rounded-xl p-4 focus:border-primary focus:ring-0 outline-none transition font-serif font-bold"
                            >
                        </div>

                        <!-- Mood Input (Status Only) -->
                        <div v-if="postType === 'text' && postSubtype === 'status'" class="animate-in fade-in slide-in-from-top-2">
                             <label class="block text-sm font-bold text-muted mb-2">Current Mood</label>
                            <input 
                                v-model="mood" 
                                type="text" 
                                placeholder="Feelin' Great 🚀" 
                                class="w-full border-2 border-border bg-background text-text rounded-xl p-4 focus:border-primary focus:ring-0 outline-none transition"
                            >
                        </div>

                         <!-- Theme Selector (Motivation, Quote, Status) -->
                        <div v-if="postType === 'text' && ['motivation', 'quote', 'status'].includes(postSubtype)" class="animate-in fade-in slide-in-from-top-2">
                            <label class="block text-sm font-bold text-muted mb-2">Visual Theme</label>
                            <div class="grid grid-cols-5 gap-2">
                                <button type="button" @click="theme = 'sunset'" :class="['h-12 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 hover:scale-105 transition', theme === 'sunset' ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-70']" title="Sunset"></button>
                                <button type="button" @click="theme = 'ocean'" :class="['h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition', theme === 'ocean' ? 'ring-2 ring-offset-2 ring-cyan-500' : 'opacity-70']" title="Ocean"></button>
                                <button type="button" @click="theme = 'forest'" :class="['h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition', theme === 'forest' ? 'ring-2 ring-offset-2 ring-emerald-500' : 'opacity-70']" title="Forest"></button>
                                <button type="button" @click="theme = 'love'" :class="['h-12 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 hover:scale-105 transition', theme === 'love' ? 'ring-2 ring-offset-2 ring-red-500' : 'opacity-70']" title="Love"></button>
                                <button type="button" @click="theme = 'midnight'" :class="['h-12 rounded-lg bg-gradient-to-r from-indigo-900 to-slate-900 hover:scale-105 transition', theme === 'midnight' ? 'ring-2 ring-offset-2 ring-indigo-500' : 'opacity-70']" title="Midnight"></button>
                            </div>
                        </div>

                        <!-- Options -->
                        <label class="flex items-center gap-3 p-4 bg-background rounded-xl border border-border cursor-pointer select-none hover:bg-surface/50 transition">
                            <input 
                                type="checkbox" 
                                v-model="isFree"
                                class="w-6 h-6 rounded border-2 border-border text-primary focus:ring-primary focus:ring-offset-0 transition bg-surface"
                            >
                            <div>
                                <span class="font-bold text-sm block">Make Public (Free)</span>
                                <span class="text-xs text-muted block">Visible to non-subscribers</span>
                            </div>
                        </label>

                        <!-- Update Media Kit Option -->
                        <label v-if="postType === 'image' || postType === 'video'" class="flex items-center gap-3 p-4 bg-background rounded-xl border border-border cursor-pointer select-none hover:bg-surface/50 transition">
                            <input 
                                type="checkbox" 
                                v-model="updateMediaKitPhoto"
                                class="w-6 h-6 rounded border-2 border-border text-primary focus:ring-primary focus:ring-offset-0 transition bg-surface"
                            >
                            <div>
                                <span class="font-bold text-sm block">Use as Media Kit Photo</span>
                                <span class="text-xs text-muted block">Updates your public profile picture</span>
                            </div>
                        </label>

                        <button 
                            type="submit" 
                            :disabled="uploading"
                            class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 text-lg shadow-xl"
                        >
                            <Upload v-if="!uploading" class="w-5 h-5" />
                            <span v-else class="animate-pulse">Posting...</span>
                            <span v-if="!uploading">Post to Feed</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- MEDIA KIT TAB -->
        <div v-if="currentTab === 'media-kit'">
            <header class="mb-10 flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-serif text-text mb-2">Update Media Kit</h2>
                    <p class="text-muted">Keep your public profile up to date for brands.</p>
                </div>
                <div v-if="mediaKit.updatedAt" class="text-xs text-muted text-right">
                    Last Updated<br>
                    <span class="font-bold text-text">{{ formatDate(mediaKit.updatedAt) }}</span>
                </div>
            </header>

             <div class="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden max-w-2xl">
                 <div class="p-6 md:p-8 space-y-6">
                    <form @submit.prevent="saveMediaKit" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-muted mb-2">Bio</label>
                            <textarea v-model="mediaKit.bio" rows="4" class="w-full border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none"></textarea>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-bold text-muted mb-2">Platform</label>
                            <select v-model="activePlatform" class="w-full border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none">
                                <option value="tiktok">TikTok</option>
                                <option value="instagram" disabled>Instagram (Coming Soon)</option>
                                <option value="youtube" disabled>YouTube (Coming Soon)</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                             <div v-for="field in platformSchemas[activePlatform]" :key="field.key">
                                <label class="block text-sm font-bold text-muted mb-2">{{ field.label }}</label>
                                <input 
                                    v-model="mediaKit.platforms[activePlatform][field.key]" 
                                    type="text" 
                                    class="w-full border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none"
                                >
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <label class="block text-sm font-bold text-muted mb-2">Location</label>
                                <div class="relative">
                                    <MapPin class="w-4 h-4 absolute left-3 top-3.5 text-muted" />
                                    <input v-model="mediaKit.location" type="text" class="w-full pl-9 border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="e.g. Los Angeles, CA">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-muted mb-2">Hero Photo URL</label>
                                <div class="space-y-2">
                                    <div v-if="mediaKit.previewUrl" class="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                                        <img :src="mediaKit.previewUrl" class="w-full h-full object-cover">
                                        <button @click="mediaKit.previewUrl = null; mediaKit.photoStorageKey = null; mediaKit.photoUrl = ''" type="button" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                            <X class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div class="flex gap-2">
                                         <input 
                                            v-model="mediaKit.photoUrl" 
                                            @input="mediaKit.photoStorageKey = null; mediaKit.previewUrl = mediaKit.photoUrl"
                                            type="text" 
                                            class="flex-1 border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" 
                                            placeholder="https://... or select from gallery"
                                        >
                                         <button type="button" @click="openGalleryPicker" class="bg-surface border border-border hover:border-primary p-3 rounded-xl transition text-primary">
                                            <ImageIcon class="w-5 h-5" />
                                         </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 pt-6 border-t border-border flex justify-end gap-4">

                            <button 
                                type="submit" 
                                class="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                            >
                                {{ uploading ? 'Saving...' : 'Save Media Kit' }}
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        </div>

        <!-- SUGGESTIONS TAB -->
        <div v-if="currentTab === 'suggestions'">
             <header class="mb-10 flex justify-between items-center">
                <div>
                     <h2 class="text-3xl font-serif text-text mb-2">Fan Suggestions</h2>
                    <p class="text-muted">Music reqs, viral trends, and ideas from subscribers.</p>
                </div>
                 <button @click="fetchSuggestions" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text">Refresh</button>
            </header>

            <div v-if="loadingSuggestions" class="text-center py-20 text-muted">Loading...</div>
            <div v-else-if="suggestions.length === 0" class="text-center py-20 text-muted">
                <Lightbulb class="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No suggestions yet.</p>
            </div>

            <div v-else class="grid gap-4">
                <div v-for="item in suggestions" :key="item.id" class="bg-surface p-6 rounded-xl border border-border shadow-sm transition hover:shadow-md">
                     <div class="flex justify-between items-start mb-3">
                        <span :class="{
                            'bg-purple-100 text-purple-700': item.type === 'music',
                            'bg-orange-100 text-orange-700': item.type === 'trend',
                            'bg-blue-100 text-blue-700': item.type === 'content',
                            'bg-gray-100 text-gray-700': item.type === 'other'
                        }" class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            {{ item.type }}
                        </span>
                        <span class="text-xs text-muted">{{ formatDate(item.createdAt) }}</span>
                    </div>
                    
                    <p class="text-text font-medium text-lg mb-4">"{{ item.content }}"</p>
                    
                    <div class="flex items-center gap-2 text-xs text-muted border-t border-border pt-3">
                        <span class="font-bold text-muted">{{ item.userEmail }}</span>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Gallery Picker Modal -->
    <div v-if="showGalleryPicker" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" @click.self="showGalleryPicker = false">
        <div class="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-border flex justify-between items-center">
                <h3 class="font-bold text-lg text-text">Select Photo</h3>
                <div class="flex gap-2">
                    <button @click="triggerMediaKitUpload" class="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition">
                        <Upload class="w-4 h-4" />
                        Upload New
                    </button>
                    <input type="file" ref="mediaKitFileInput" class="hidden" accept="image/*" @change="handleMediaKitUpload">
                    <button type="button" @click="showGalleryPicker = false" class="text-muted hover:text-text"><X class="w-6 h-6" /></button>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <div v-if="loadingGallery" class="text-center py-10 text-muted">Loading photos...</div>
                <div v-else-if="galleryImages.length === 0" class="text-center py-10 text-muted">No images found in your posts.</div>
                <div v-else class="grid grid-cols-3 gap-2">
                    <div 
                        v-for="img in galleryImages" 
                        :key="img.id" 
                        @click="selectGalleryImage(img)"
                        class="aspect-square bg-surface rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative group border-2"
                        :class="[(img.storageKey === mediaKit.photoStorageKey || img.mediaUrl === mediaKit.photoUrl) ? 'border-primary' : 'border-transparent']"
                    >
                        <div v-if="img.type !== 'image'" class="w-full h-full flex flex-col items-center justify-center bg-background text-muted p-2 text-center">
                            <VideoIcon v-if="img.type === 'video'" class="w-8 h-8 mb-1" />
                            <Mic v-if="img.type === 'audio'" class="w-8 h-8 mb-1" />
                            <span class="text-[10px] font-bold uppercase">{{ img.type }}</span>
                            <span class="text-[9px] opacity-75 leading-tight mt-1">(Cannot use as photo)</span>
                        </div>
                        <SecureResource v-else-if="img.storageKey" :storageKey="img.storageKey">
                             <template #default="{ src, loading }">
                                <div v-if="loading" class="w-full h-full flex items-center justify-center bg-surface">
                                    <div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                                <img v-else :src="src" class="w-full h-full object-cover">
                             </template>
                        </SecureResource>
                        <img v-else :src="img.mediaUrl || img.imageUrl" class="w-full h-full object-cover">
                        
                        <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Check class="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Media Capturer Modal -->
    <MediaCapture 
        v-if="captureMode && captureMode !== 'link'" 
        :mode="captureMode"
        @capture="handleCapture"
        @cancel="captureMode = null"
    />

    <!-- Dev Task Modal -->
    <div v-if="showDevTaskModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" @click.self="showDevTaskModal = false">
        <div class="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border p-6">
            <h3 class="font-bold text-xl mb-4">Report Issue / Request Feature</h3>
            <form @submit.prevent="submitDevTask" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-muted uppercase mb-1">Title</label>
                    <input v-model="devTask.title" type="text" class="w-full bg-background border border-border rounded-lg p-2 focus:border-primary outline-none" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-muted uppercase mb-1">Type</label>
                    <div class="flex gap-2">
                        <button type="button" @click="devTask.type = 'bug'" :class="['px-3 py-1 rounded text-sm', devTask.type === 'bug' ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-background border border-border']">Bug</button>
                        <button type="button" @click="devTask.type = 'feature'" :class="['px-3 py-1 rounded text-sm', devTask.type === 'feature' ? 'bg-blue-500/20 text-blue-500 border border-blue-500' : 'bg-background border border-border']">Feature</button>
                    </div>
                </div>
                 <div>
                    <label class="block text-xs font-bold text-muted uppercase mb-1">Priority</label>
                    <select v-model="devTask.priority" class="w-full bg-background border border-border rounded-lg p-2 outline-none">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-muted uppercase mb-1">Description</label>
                    <textarea v-model="devTask.description" rows="3" class="w-full bg-background border border-border rounded-lg p-2 focus:border-primary outline-none"></textarea>
                </div>
                <div class="flex justify-end gap-3 mt-4">
                    <button type="button" @click="showDevTaskModal = false" class="text-muted hover:text-text text-sm">Cancel</button>
                    <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90">Submit Task</button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script setup>
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc, getDoc, updateDoc, limit, where } from 'firebase/firestore'
import { 
    LayoutDashboard, 
    FileText, 
    BarChart, 
    Lightbulb, 
    Upload, 
    X, 
    Camera, 
    Video as VideoIcon, 
    Mic, 
    Image as ImageIcon,
    StopCircle,
    RotateCcw,
    Check,
    MapPin,
    Sparkles,
    Bug,
    ArrowLeft,
    ShoppingBag
} from 'lucide-vue-next'
// ... (imports)

// ...

// SUGGESTIONS STATE
const suggestions = ref([])
const loadingSuggestions = ref(false)

const fetchSuggestions = async () => {
    loadingSuggestions.value = true
    try {
        const q = query(collection($db, 'suggestions'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        suggestions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error('Error fetching suggestions:', e)
    } finally {
         loadingSuggestions.value = false
    }
}



// Optimize: Reuse formatter instance to avoid creation overhead in loops
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return dateFormatter.format(date)
}

definePageMeta({
    middleware: 'creator'
})

const { $storage, $db } = useNuxtApp()
const { logout, user, isAdmin, isDeveloper } = useAuth()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// Helper to get auth headers for API calls
const getAuthHeaders = async () => {
    if (!user.value) return {}
    const token = await user.value.getIdToken()
    return { Authorization: `Bearer ${token}` }
}

// TABS
const currentTab = ref(route.query.tab || 'content') // 'content', 'media-kit'

// Watch tab for fetch & URL sync
watch(currentTab, (val) => {
    // Update URL without reloading
    router.replace({ query: { ...route.query, tab: val } })
    
    if (val === 'suggestions') fetchSuggestions()
    if (val === 'media-kit') fetchMediaKit()
})

// --- CONTENT LOGIC ---
const captureMode = ref(null)
const postType = ref(null)
const postSubtype = ref('status') // Default subtype for text
const postFormat = ref(null) // 'image', 'video', 'audio', 'text' (subtype for random)
const file = ref(null)
const previewUrl = ref(null)
const caption = ref('')
const citation = ref('') // For quotes
const title = ref('') // For stories
const mood = ref('') // For status
const theme = ref('sunset') // For motivation (sunset, ocean, forest, love, midnight)

// Embed State
const embedUrl = ref('')
const embedPlatform = ref('youtube')
const embedInput = ref('')

const isFree = ref(false)
const updateMediaKitPhoto = ref(false)
const videoPreviewRef = ref(null)
const uploading = ref(false)
const editingPostId = ref(null)

// Initialize Logic
onMounted(async () => {
    if (route.query.edit) {
        editingPostId.value = route.query.edit
        uploading.value = true
        try {
            const docRef = doc($db, 'posts', editingPostId.value)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                postType.value = data.type
                postSubtype.value = data.subtype || 'status'
                postFormat.value = data.format || data.type // Backwards compat
                caption.value = data.caption || ''
                citation.value = data.citation || ''
                title.value = data.title || ''
                mood.value = data.mood || ''
                theme.value = data.theme || 'sunset'
                isFree.value = data.isFree || false
                
                // Handle Previews based on type
                if (data.type === 'video' && (data.mediaUrl && (data.mediaUrl.includes('youtube') || data.mediaUrl.includes('youtu.be')))) {
                    // It's an embed
                    captureMode.value = 'link'
                    embedPlatform.value = 'youtube'
                    embedInput.value = data.mediaUrl
                    processEmbedInput()
                } else if (data.storageKey) {
                    // It's an R2 file - Fetch Signed URL
                    try {
                        const res = await $fetch('/api/vault/view', {
                            params: { key: data.storageKey }
                        })
                        previewUrl.value = res.url
                    } catch (err) {
                        console.error("Failed to load R2 preview:", err)
                        toast.error("Could not load current media.")
                    }
                } else {
                    // Legacy File
                    previewUrl.value = data.mediaUrl
                }
            } else {
                toast.error('Post not found!')
                router.push('/creator')
            }
        } catch (e) {
            console.error('Error fetching post:', e)
        } finally {
            uploading.value = false
        }
    }
})

const startCapture = (mode) => { captureMode.value = mode }
const selectType = (type) => {
    postType.value = type
    if (type === 'text') file.value = null
}
const handleCapture = ({ blob, url, type }) => {
    // Determine extension from MIME type
    let ext = 'webm'
    if (blob.type.includes('mp4')) {
        ext = type === 'audio' ? 'm4a' : 'mp4'
    } else if (blob.type.includes('webm')) {
        ext = 'webm'
    } else if (type === 'photo') {
        ext = 'jpg'
    }

    const fileName = `capture_${Date.now()}.${ext}`
    file.value = new File([blob], fileName, { type: blob.type })
    previewUrl.value = url
    // If we are in random mode, keep type as random, set format
    if (postType.value === 'random') {
        postFormat.value = type === 'photo' ? 'image' : type
    } else {
        postType.value = type === 'photo' ? 'image' : type
    }
    captureMode.value = null
}

const startRandomDrop = () => {
    postType.value = 'random'
    // Trigger file input
    document.querySelector('input[type="file"]').click()
}

const onFileSelected = (e) => {
    const selected = e.target.files[0]
    if (selected) {
        file.value = selected
        previewUrl.value = URL.createObjectURL(selected)
        previewUrl.value = URL.createObjectURL(selected)
        
        // Determine format
        let detectedFormat = 'image'
        if (selected.type.startsWith('video/')) detectedFormat = 'video'
        else if (selected.type.startsWith('audio/')) detectedFormat = 'audio'
        
        if (postType.value === 'random') {
            postFormat.value = detectedFormat
        } else {
            postType.value = detectedFormat
        }
    }
}

// Smart Embed Parser
const processEmbedInput = () => {
    const val = embedInput.value.trim()
    if (!val) {
        embedUrl.value = ''
        return
    }

    if (embedPlatform.value === 'youtube') {
        // If they pasted a full URL, extract ID
        if (val.includes('v=')) {
            embedUrl.value = val
        } else if (val.includes('youtu.be/')) {
             embedUrl.value = val
        } else {
            // Assume it's just the ID
            embedUrl.value = `https://www.youtube.com/watch?v=${val}`
        }
    } else {
        // For others, just use as is for now
        embedUrl.value = val
    }
}

const resetForm = () => {
    file.value = null
    previewUrl.value = null
    postType.value = null
    postSubtype.value = 'status'
    postFormat.value = null
    caption.value = ''
    citation.value = ''
    title.value = ''
    mood.value = ''
    theme.value = 'sunset'
    embedUrl.value = ''
    embedInput.value = ''
    isFree.value = false
    captureMode.value = null
    editingPostId.value = null
    updateMediaKitPhoto.value = false
    router.replace('/creator') // Clear query param
}

const validateText = (text) => {
    if (!text) return ''
    // 1. Auto-capitalize first letter
    let refined = text.charAt(0).toUpperCase() + text.slice(1)
    
    // 2. Ensure basic punctuation ending (optional, maybe too strict for social? Let's stick to capitalization for now)
    // if (!/[.!?]$/.test(refined)) refined += '.'

    return refined
}

const handleUpload = async () => {
    // Validation: Require text OR file OR embed OR existing preview (for edit)
    if (postType.value !== 'text' && !file.value && !embedUrl.value && !previewUrl.value) return
    
    uploading.value = true
    try {
        let downloadURL = embedUrl.value || previewUrl.value // Legacy/Embed
        let storageKey = null

        // Handle NEW File Upload via R2 Vault
        if (!embedUrl.value && postType.value !== 'text' && file.value) {
            // 1. Get Signed URL
            const { uploadUrl, key } = await $fetch('/api/vault/upload', {
                method: 'POST',
                body: {
                    filename: file.value.name,
                    contentType: file.value.type
                }
            })

            // 2. Upload to R2 directly
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file.value,
                headers: {
                    'Content-Type': file.value.type
                }
            })

            storageKey = key
            downloadURL = null // R2 items are not public
        }
        
        const payload = {
            mediaUrl: downloadURL,
            storageKey: storageKey, // NEW: R2 Key
            provider: storageKey ? 'r2' : 'firebase',
            type: postType.value,
            subtype: postType.value === 'text' ? postSubtype.value : null,
            citation: postType.value === 'text' && postSubtype.value === 'quote' ? citation.value : null,
            title: postType.value === 'text' && postSubtype.value === 'blog' ? title.value : null,
            mood: postType.value === 'text' && postSubtype.value === 'status' ? mood.value : null,
            theme: postType.value === 'text' && ['motivation', 'quote', 'status'].includes(postSubtype) ? theme.value : null,
            format: postType.value === 'random' ? (embedUrl.value ? 'video' : postFormat.value) : null,
            caption: postType.value === 'text' ? validateText(caption.value) : caption.value,
            isFree: isFree.value,
            updatedAt: serverTimestamp()
        }

        if (editingPostId.value) {
            // UPDATE
            await updateDoc(doc($db, 'posts', editingPostId.value), payload)
            toast.success('Post updated successfully!', {
                label: 'View Post',
                onClick: () => router.push(`/feed?highlight=${editingPostId.value}`)
            })
        } else {
             // CREATE
             const docRef = await addDoc(collection($db, 'posts'), {
                ...payload,
                createdAt: serverTimestamp()
            })
            toast.success('Post created successfully!', {
                label: 'View Post',
                onClick: () => router.push(`/feed?highlight=${docRef.id}`)
            })
        }

        // --- UPDATE MEDIA KIT IF CHECKED ---
        if (updateMediaKitPhoto.value) {
            try {
                let mkKey = storageKey
                let mkUrl = downloadURL

                // If VIDEO, Capture Frame and Upload
                if (postType.value === 'video' && videoPreviewRef.value) {
                    const canvas = document.createElement('canvas')
                    canvas.width = videoPreviewRef.value.videoWidth
                    canvas.height = videoPreviewRef.value.videoHeight
                    canvas.getContext('2d').drawImage(videoPreviewRef.value, 0, 0)
                    
                    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.8))
                    const mkFile = new File([blob], `mediakit_${Date.now()}.jpg`, { type: 'image/jpeg' })
                    
                    // Upload Thumbnail
                    const { uploadUrl, key } = await $fetch('/api/vault/upload', {
                        method: 'POST',
                        body: { filename: mkFile.name, contentType: mkFile.type }
                    })
                    await fetch(uploadUrl, { method: 'PUT', body: mkFile, headers: { 'Content-Type': mkFile.type } })
                    
                    mkKey = key
                    mkUrl = null
                }

                await setDoc(doc($db, 'users', user.value.uid, 'settings', 'mediaKit'), {
                    photoStorageKey: mkKey,
                    photoUrl: mkUrl,
                    updatedAt: serverTimestamp()
                }, { merge: true })
                
                toast.success('Media Kit Photo Updated!')
            } catch (err) {
                console.error("Failed to update media kit photo:", err)
                toast.error("Posted, but failed to update Media Kit photo.")
            }
        }
        
        resetForm()

    } catch (e) {
        console.error('Upload error:', e)
        toast.error('Failed to post content. Please try again.')
    } finally {
        uploading.value = false
    }
}


// --- MEDIA KIT LOGIC ---
const mediaKit = ref({
    bio: '',
    location: '',
    photoUrl: '',
    platforms: {
        tiktok: {
            followers_total: '',
            followers_net: '',
            views_post: '',
            views_profile: '',
            likes: '',
            comments: '',
            shares: '',
            viewers_total: '',
            viewers_new: '',
            demographics: ''
        }
    }
})

const platformSchemas = {
    tiktok: [
        { key: 'followers_total', label: 'Total Followers' },
        { key: 'followers_net', label: 'Net Followers' },
        { key: 'views_post', label: 'Post Views' },
        { key: 'views_profile', label: 'Profile Views' },
        { key: 'likes', label: 'Likes' },
        { key: 'comments', label: 'Comments' },
        { key: 'shares', label: 'Shares' },
        { key: 'viewers_total', label: 'Total Viewers' },
        { key: 'viewers_new', label: 'New Viewers' },
        { key: 'demographics', label: 'Avg Age & Gender' }
    ]
}

const activePlatform = ref('tiktok')

// Gallery Picker Logic
const showGalleryPicker = ref(false)
const galleryImages = ref([])
const loadingGallery = ref(false)

const openGalleryPicker = async () => {
    showGalleryPicker.value = true
    loadingGallery.value = true
    try {
        // Fetch recent image posts
        const q = query(
            collection($db, 'posts'), 
            // where('type', '==', 'image'), // Allow all types, check manually
            orderBy('createdAt', 'desc'), 
            limit(50)
        )
        const snapshot = await getDocs(q)
        galleryImages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Error fetching gallery:", e)
    } finally {
        loadingGallery.value = false
    }
}
const fetchMediaKit = async () => {
    console.log("[MediaKit] Fetching for user:", user.value?.uid)
    if (!user.value?.uid) return
    
    // DEBUG: Identify user clearly
    console.log("DEBUG: Current Authenticated UID:", user.value.uid)

    try {
        const docRef = doc($db, 'users', user.value.uid, 'settings', 'mediaKit')
        const docSnap = await getDoc(docRef)
        console.log("[MediaKit] Primary doc exists:", docSnap.exists())
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            mediaKit.value = { 
                ...mediaKit.value, 
                ...data,
                updatedAt: data.updatedAt || data.createdAt
            }

            // Hydrate preview if storage key exists
             if (data.photoStorageKey) {
                try {
                    const res = await $fetch('/api/vault/view', { params: { key: data.photoStorageKey } })
                    mediaKit.value.previewUrl = res.url
                } catch (e) { console.error(e) }
            } else {
                mediaKit.value.previewUrl = data.photoUrl
            }
            toast.success("Loaded saved Media Kit")
        } else {
            // Fallback: Check for legacy media kit in 'media_kits' collection
            // Fallback 1: Check 'createdBy'
            let q = query(
                collection($db, 'media_kits'), 
                where('createdBy', '==', user.value?.uid),
                limit(1)
            )
            let snapshot = await getDocs(q)
            
            // Fallback 2: Check 'uid' if 'createdBy' failed
            if (snapshot.empty) {
                 console.log("[MediaKit] Fallback 1 (createdBy) empty. Trying 'uid'...")
                 q = query(
                    collection($db, 'media_kits'), 
                    where('uid', '==', user.value?.uid),
                    limit(1)
                )
                snapshot = await getDocs(q)
            }

            console.log("[MediaKit] Fallback query found docs:", snapshot.size)

            // DEBUG: Check what ANY doc looks like to verify schema
            if (snapshot.empty) {
                 try {
                    const sampleQ = query(collection($db, 'media_kits'), limit(1));
                    const sampleSnap = await getDocs(sampleQ);
                    if (!sampleSnap.empty) {
                        console.log("[MediaKit] Schema Check - First doc in collection:", sampleSnap.docs[0].data())
                    } else {
                        console.log("[MediaKit] Collection 'media_kits' appears to be essentially empty.")
                    }
                 } catch (err) { console.error("Schema check failed", err)}
            }

            if (!snapshot.empty) {
                const legacyData = snapshot.docs[0].data()
                console.log("[MediaKit] Loading legacy data:", legacyData)
                mediaKit.value = {
                    ...mediaKit.value,
                    ...legacyData,
                    updatedAt: legacyData.createdAt
                }

                // Hydrate preview for legacy
                 if (legacyData.photoStorageKey) {
                    try {
                        const res = await $fetch('/api/vault/view', { params: { key: legacyData.photoStorageKey } })
                        mediaKit.value.previewUrl = res.url
                    } catch (e) { console.error(e) }
                } else {
                    mediaKit.value.previewUrl = legacyData.photoUrl
                }
                
                // Optional: We could migrate it here, but letting them hit 'Save' is safer/simpler
                console.log("Loaded legacy Media Kit")
                toast.success("Loaded saved Media Kit (Legacy)")
            } else {
                console.log("[MediaKit] No personal data found.")
                
                // Fallback 3: Developer Bypass - load ANY kit
                if (isAdmin.value || isDeveloper.value) {
                     console.log("[MediaKit] Admin/Dev Detected. Attempting to load ANY media kit.")
                     const anyQ = query(collection($db, 'media_kits'), limit(1))
                     const anySnap = await getDocs(anyQ)
                     
                     if (!anySnap.empty) {
                        const devData = anySnap.docs[0].data()
                        mediaKit.value = {
                            ...mediaKit.value,
                            ...devData,
                            updatedAt: devData.createdAt
                        }
                         // Hydrate preview
                        if (devData.photoStorageKey) {
                            try {
                                const res = await $fetch('/api/vault/view', { params: { key: devData.photoStorageKey } })
                                mediaKit.value.previewUrl = res.url
                            } catch (e) { console.error(e) }
                        } else {
                            mediaKit.value.previewUrl = devData.photoUrl
                        }
                        toast.info("Loaded Global Media Kit (Admin View)")
                        return
                     }
                }
                
                // toast.info("No saved Media Kit found. Please fill it out.")
            }
        }
    } catch (e) {
        console.error('Error fetching existing media kit:', e)
    }
}


// Media Kit Upload Logic
const mediaKitFileInput = ref(null)

const triggerMediaKitUpload = () => {
    mediaKitFileInput.value.click()
}

const handleMediaKitUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Immediate preview
    mediaKit.value.previewUrl = URL.createObjectURL(file)

    loadingGallery.value = true
    try {
        // 1. Get Signed URL
        const { uploadUrl, key } = await $fetch('/api/vault/upload', {
            method: 'POST',
            body: {
                filename: file.name,
                contentType: file.type
            }
        })

        // 2. Upload to R2 directly
        // 2. Upload to R2 directly
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        })

        console.log("[MediaKit] Upload success. Key:", key)

        // 3. Set as selected
        mediaKit.value.photoStorageKey = key
        
        // 4. Fetch preview
        const headers = await getAuthHeaders()
        const res = await $fetch('/api/vault/view', { params: { key }, headers })
        console.log("[MediaKit] View URL fetched:", res.url)
        
        mediaKit.value.previewUrl = res.url 
        mediaKit.value.photoUrl = res.url 
        
        console.log("[MediaKit] Set photoUrl to:", mediaKit.value.photoUrl)
        
        showGalleryPicker.value = false
        toast.success("Photo uploaded and selected")

    } catch (err) {
        console.error("Media Kit upload failed:", err)
        toast.error("Upload failed")
    } finally {
        loadingGallery.value = false
    }
}

const selectGalleryImage = async (item) => {
    if (item.type !== 'image' && !item.imageUrl) {
        toast.error("Please select an image.")
        return
    }

    if (item.storageKey) {
        mediaKit.value.photoStorageKey = item.storageKey
        // Fetch preview
        try {
            const headers = await getAuthHeaders()
            const res = await $fetch('/api/vault/view', { params: { key: item.storageKey }, headers })
            mediaKit.value.previewUrl = res.url
            mediaKit.value.photoUrl = res.url // Populate URL field
        } catch (e) { console.error(e) }
    } else {
        mediaKit.value.photoUrl = item.mediaUrl || item.imageUrl
        mediaKit.value.photoStorageKey = null
        mediaKit.value.previewUrl = mediaKit.value.photoUrl
    }
    showGalleryPicker.value = false
}

const saveMediaKit = async () => {
    uploading.value = true
    try {
        await setDoc(doc($db, 'users', user.value.uid, 'settings', 'mediaKit'), {
            bio: mediaKit.value.bio,
            location: mediaKit.value.location || '',
            photoUrl: mediaKit.value.photoUrl || '',
            photoStorageKey: mediaKit.value.photoStorageKey || '',
            platforms: mediaKit.value.platforms,
            updatedAt: serverTimestamp(),
            uid: user.value?.uid
        }, { merge: true })
        toast.success('Media Kit updated!')
    } catch (e) {
        console.error(e)
        toast.error('Error saving Media Kit: ' + e.message)
    } finally {
        uploading.value = false
    }
}

// Fetch existing Media Kit to populate form
onMounted(() => {
    if (user.value) {
        if (currentTab.value === 'suggestions') fetchSuggestions()
        if (currentTab.value === 'media-kit') fetchMediaKit()
    }
})

// Watch user to fetch once auth resolves
watch(user, (u) => {
    if (u) {
        if (currentTab.value === 'suggestions') fetchSuggestions()
        if (currentTab.value === 'media-kit') fetchMediaKit()
    }
})

// Dev Task Logic
const showDevTaskModal = ref(false)
const devTask = ref({ title: '', description: '', type: 'bug', priority: 'medium' })

const submitDevTask = async () => {
    try {
        await addDoc(collection($db, 'tasks'), {
            ...devTask.value,
            status: 'todo',
            createdBy: user.value.uid,
            createdAt: serverTimestamp()
        })
        toast.success('Task submitted to Dev Board')
        showDevTaskModal.value = false
        devTask.value = { title: '', description: '', type: 'bug', priority: 'medium' }
    } catch (e) {
        console.error(e)
        toast.error('Failed to submit task')
    }
}
</script>

<style scoped>
.bg-checkered {
    background-image:
      linear-gradient(45deg, var(--color-surface) 25%, transparent 25%),
      linear-gradient(-45deg, var(--color-surface) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--color-surface) 75%),
      linear-gradient(-45deg, transparent 75%, var(--color-surface) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
