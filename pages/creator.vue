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

            <div class="pt-4 mt-4 border-t border-border space-y-2">
                <a href="/admin" class="flex items-center gap-3 px-4 py-3 text-muted hover:text-text rounded-xl text-sm font-medium transition">
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
            <h1 class="font-bold text-xl">THE STUDIO</h1>
            <div class="flex gap-4">
                <NuxtLink to="/admin" class="text-sm font-bold">Admin</NuxtLink>
                <button @click="logout" class="text-sm text-red-500">Log Out</button>
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
                        <video v-if="postType === 'video'" :src="previewUrl" controls class="max-h-[400px] w-full"></video>
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
                                <div class="flex gap-2">
                                     <input v-model="mediaKit.photoUrl" type="text" class="flex-1 border-2 border-border bg-background text-text rounded-xl p-3 focus:border-primary focus:ring-0 outline-none" placeholder="https://...">
                                     <button type="button" @click="openGalleryPicker" class="bg-surface border border-border hover:border-primary p-3 rounded-xl transition text-primary">
                                        <ImageIcon class="w-5 h-5" />
                                     </button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 pt-6 border-t border-border flex justify-end gap-4">
                             <button 
                                type="button" 
                                class="px-6 py-3 font-bold text-muted hover:text-text transition"
                            >
                                Preview
                            </button>
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
                <h3 class="font-bold text-lg text-text">Select from Gallery</h3>
                <button type="button" @click="showGalleryPicker = false" class="text-muted hover:text-text"><X class="w-6 h-6" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <div v-if="loadingGallery" class="text-center py-10 text-muted">Loading photos...</div>
                <div v-else-if="galleryImages.length === 0" class="text-center py-10 text-muted">No images found in your posts.</div>
                <div v-else class="grid grid-cols-3 gap-2">
                    <div 
                        v-for="img in galleryImages" 
                        :key="img.id" 
                        @click="selectGalleryImage(img.mediaUrl || img.imageUrl)"
                        class="aspect-square bg-black rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative group"
                    >
                        <img :src="img.mediaUrl || img.imageUrl" class="w-full h-full object-cover">
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
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
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
    Bug
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



const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

definePageMeta({
    middleware: 'creator'
})

const { $storage, $db } = useNuxtApp()
const { logout, user } = useAuth()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// TABS
const currentTab = ref('content') // 'content', 'media-kit'

// Watch tab for fetch
watch(currentTab, (val) => {
    if (val === 'suggestions') fetchSuggestions()
})

// --- CONTENT LOGIC ---
const captureMode = ref(null)
const postType = ref(null)
const postFormat = ref(null) // 'image', 'video', 'audio', 'text' (subtype for random)
const file = ref(null)
const previewUrl = ref(null)
const caption = ref('')

// Embed State
const embedUrl = ref('')
const embedPlatform = ref('youtube')
const embedInput = ref('')

const isFree = ref(false)
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
                postFormat.value = data.format || data.type // Backwards compat
                caption.value = data.caption || ''
                isFree.value = data.isFree || false
                
                // Handle Previews based on type
                if (data.type === 'video' && (data.mediaUrl.includes('youtube') || data.mediaUrl.includes('youtu.be'))) {
                    // It's an embed
                    captureMode.value = 'link'
                    embedPlatform.value = 'youtube'
                    embedInput.value = data.mediaUrl
                    processEmbedInput()
                } else {
                    // It's a file
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
    const ext = type === 'audio' ? 'webm' : (type === 'video' ? 'webm' : 'jpg')
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
    postFormat.value = null
    caption.value = ''
    embedUrl.value = ''
    embedInput.value = ''
    isFree.value = false
    captureMode.value = null
    editingPostId.value = null
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
        let downloadURL = embedUrl.value || previewUrl.value // Default to existing/embed
        
        // Handle NEW File Upload
        if (!embedUrl.value && postType.value !== 'text' && file.value) {
            const fileName = `${Date.now()}_${file.value.name}`
            const fileRef = storageRef($storage, `posts/${fileName}`)
            const snapshot = await uploadBytes(fileRef, file.value)
            downloadURL = await getDownloadURL(snapshot.ref)
        }
        
        const payload = {
            mediaUrl: downloadURL,
            type: postType.value,
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
        
        resetForm()
    } catch (e) {
        console.error(e)
        toast.error('Operation failed: ' + e.message)
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
            where('type', '==', 'image'), 
            orderBy('createdAt', 'desc'), 
            limit(20)
        )
        const snapshot = await getDocs(q)
        galleryImages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Error fetching gallery:", e)
    } finally {
        loadingGallery.value = false
    }
}

const selectGalleryImage = (url) => {
    mediaKit.value.photoUrl = url
    showGalleryPicker.value = false
}

const saveMediaKit = async () => {
    uploading.value = true
    try {
        await addDoc(collection($db, 'media_kits'), {
            bio: mediaKit.value.bio,
            location: mediaKit.value.location || '',
            photoUrl: mediaKit.value.photoUrl || '',
            platforms: mediaKit.value.platforms,
            createdAt: serverTimestamp(),
            createdBy: user.value?.uid
        })
        toast.success('Media Kit updated!')
    } catch (e) {
        console.error(e)
        toast.error('Error saving Media Kit: ' + e.message)
    } finally {
        uploading.value = false
    }
}

// Fetch existing Media Kit to populate form
const fetchMediaKit = async () => {
    try {
        const q = query(collection($db, 'media_kits'), orderBy('createdAt', 'desc'), limit(1))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data()
            mediaKit.value = {
                bio: data.bio || '',
                location: data.location || '',
                photoUrl: data.photoUrl || '',
                platforms: data.platforms || { ...mediaKit.value.platforms }, // Ensure default structure if missing
                updatedAt: data.updatedAt || data.createdAt // Store for display
            }
        }
    } catch (e) {
        console.error('Error fetching existing media kit:', e)
    }
}

onMounted(() => {
    fetchMediaKit()
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
