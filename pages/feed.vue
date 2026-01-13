<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <nav class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
            <h1 class="font-bold text-xl tracking-tight">THE CIRCLE</h1>
        </div>
        <div class="flex items-center gap-4">
            <NuxtLink to="/hub" class="text-xs font-bold uppercase tracking-widest border border-black px-3 py-1.5 rounded hover:bg-black hover:text-white transition">
                The Hub
            </NuxtLink>
            <NuxtLink v-if="role === 'creator'" to="/creator" class="text-sm font-bold border border-black px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition">
                Studio
            </NuxtLink>
            <NuxtLink v-if="role === 'admin'" to="/admin" class="text-sm font-bold border border-black px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition">
               Office
            </NuxtLink>
            <button @click="logout" class="text-sm font-medium text-gray-500 hover:text-black">
                Log Out
            </button>
        </div>
    </nav>

    <!-- Mixed Feed -->
    <div class="max-w-2xl mx-auto p-4 space-y-8 mt-6">
        <!-- Public Welcome / CTA for Non-Subs -->
        <div v-if="!isSubscriber" class="bg-black text-white p-6 rounded-2xl shadow-xl text-center mb-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20"></div>
            <h2 class="text-2xl font-bold mb-2 relative z-10">Welcome to The Circle</h2>
            <p class="text-gray-200 mb-6 max-w-lg mx-auto relative z-10">
                Join for exclusive access to my daily life, photos, and videos. 
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <button 
                    @click="handleSubscribe"
                    class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition shadow-lg flex items-center gap-2"
                >
                    <span>Subscribe - $5/mo</span>
                </button>
            </div>
        </div>

        <div v-if="loadingPosts" class="text-center py-10">
            <p class="text-gray-500 animate-pulse">Loading updates...</p>
        </div>

        <!-- Feed Controls -->
        <div class="flex justify-end mb-4 px-2">
            <label class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Posts per page:
                <select v-model="batchSize" class="bg-white border border-gray-200 rounded px-2 py-1 focus:ring-black focus:border-black transition cursor-pointer">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                </select>
            </label>
        </div>

        <!-- Suggestion Box (Subscribers Only) -->
        <div v-if="isSubscriber" class="mb-8">
            <button 
                @click="showSuggestionForm = !showSuggestionForm"
                class="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-xl flex items-center justify-between transition group"
            >
                <div class="flex items-center gap-3">
                    <div class="bg-white p-2 rounded-full shadow-sm">
                        <Lightbulb class="w-5 h-5 text-indigo-500" />
                    </div>
                    <div class="text-left">
                        <span class="font-bold text-sm block">Have an idea?</span>
                        <span class="text-xs text-indigo-400">Suggest music, trends, or content</span>
                    </div>
                </div>
                <ChevronDown :class="['w-5 h-5 transition', showSuggestionForm ? 'rotate-180' : '']" />
            </button>

            <div v-if="showSuggestionForm" class="mt-4 bg-white border border-indigo-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <form @submit.prevent="submitSuggestion" class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                         <select v-model="suggestionType" class="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg block w-full p-2.5 font-medium">
                            <option value="music">🎵 Music Rec</option>
                            <option value="trend">🔥 Viral Trend</option>
                            <option value="content">📹 Content Request</option>
                            <option value="other">✨ Other</option>
                        </select>
                         <button 
                            type="submit" 
                            :disabled="uploading"
                            class="text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition"
                        >
                            {{ uploading ? 'Sending...' : 'Send Suggestion' }}
                        </button>
                    </div>
                    <textarea 
                        v-model="suggestionText" 
                        rows="2" 
                        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="What's on your mind?"
                        required
                    ></textarea>
                </form>
            </div>
        </div>
        
        <div v-if="!loadingPosts && posts.length === 0" class="text-center py-20 text-gray-400">
            <FileImage class="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No posts yet.</p>
        </div>

        <article 
            v-for="post in posts" 
            :key="post.id" 
            class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        >
            <!-- Header -->
            <div class="p-4 border-b border-gray-50 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <span class="text-xs font-bold text-gray-400">NC</span>
                </div>
                <div>
                    <p class="font-bold text-sm">Nicole Christine</p>
                    <p class="text-xs text-gray-400">{{ formatDate(post.createdAt) }}</p>
                </div>
                <!-- Badge for Type -->
                <div class="ml-2 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {{ post.type || 'image' }}
                </div>
                <div class="ml-auto flex items-center gap-2">
                     <button 
                        @click="toggleComments(post.id)"
                        class="p-2 text-gray-400 hover:text-indigo-600 transition rounded-full hover:bg-indigo-50"
                        title="Comments"
                    >
                        <MessageSquare class="w-4 h-4" />
                    </button>
                     <div v-if="!post.isFree && !isSubscriber">
                        <Lock class="w-4 h-4 text-gray-400" />
                    </div>
                    <NuxtLink 
                        v-if="role === 'creator'"
                        :to="'/creator?edit=' + post.id"
                        class="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-100"
                        title="Edit Post"
                    >
                        <Edit2 class="w-4 h-4" />
                    </NuxtLink>
                    <button 
                        v-if="role === 'admin' || role === 'creator'"
                        @click="deletePost(post.id)"
                        class="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                        title="Delete Post"
                    >
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <!-- MEDIA CONTENT (Image, Video, Audio) -->
            <div v-if="post.type !== 'text'" class="aspect-video w-full bg-black relative group">
                <!-- Unlocked Content -->
                <div v-if="isSubscriber || post.isFree" class="absolute inset-0 flex items-center justify-center">
                    
                    <div v-if="post.type === 'video'" class="w-full h-full">
                         <!-- YouTube Embed -->
                         <iframe 
                            v-if="post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be')"
                            :src="getEmbedUrl(post.mediaUrl)" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            class="w-full h-full"
                        ></iframe>
                        
                        <!-- Native Video -->
                        <video 
                            v-else
                            :src="post.mediaUrl || post.imageUrl" 
                            controls
                            class="w-full h-full object-contain"
                        ></video>
                    </div>
                    
                    <div v-else-if="post.type === 'audio'" class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6">
                        <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        </div>
                        <audio 
                            :src="post.mediaUrl" 
                            controls
                            class="w-full max-w-md"
                        ></audio>
                    </div>

                    <img 
                        v-else
                        :src="post.mediaUrl || post.imageUrl" 
                        loading="lazy"
                        class="object-contain w-full h-full"
                        alt="Content"
                    />
                </div>

                <!-- Locked Content Overlay (Media) -->
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-100">
                    <div class="absolute inset-0 bg-gray-200 blur-xl opacity-50"></div>
                    <div class="relative z-10 text-center">
                        <Lock class="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <h3 class="font-bold text-lg mb-1">Subscriber Exclusive</h3>
                        <p class="text-sm text-gray-500 mb-4">Subscribe to unlock this post</p>
                        <button 
                            @click="handleSubscribe"
                            class="px-6 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition shadow-lg"
                        >
                            Unlock Access
                        </button>
                    </div>
                </div>
            </div>

            <!-- TEXT CONTENT -->
            <div v-else class="p-8 bg-gray-50 min-h-[200px] flex items-center justify-center relative">
                <div v-if="isSubscriber || post.isFree" class="text-center">
                     <p class="text-xl md:text-2xl font-serif text-gray-800 whitespace-pre-wrap leading-relaxed">{{ post.caption }}</p>
                </div>
                
                <!-- Locked Content (Text) -->
                <div v-else class="absolute inset-0 overflow-hidden flex items-center justify-center">
                    <div class="absolute inset-0 p-8 opacity-20 blur-sm select-none pointer-events-none">
                        <p class="text-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p class="mt-4">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    </div>
                    <div class="relative z-10 text-center bg-white/80 backdrop-blur px-6 py-4 rounded-xl shadow-sm">
                        <Lock class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p class="font-bold text-sm mb-3">Locked Text Post</p>
                         <button 
                            @click="handleSubscribe"
                            class="px-5 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition"
                        >
                            Subscribe to Read
                        </button>
                    </div>
                </div>
            </div>

            <!-- Caption / Footer (Only for Media types) -->
            <div class="p-4" v-if="post.type !== 'text' && post.caption">
                <p class="text-gray-900 text-sm"><span class="font-bold mr-2">Nicole Christine</span> {{ post.caption }}</p>
            </div>

            <!-- Comments Section -->
            <div v-if="activeCommentId === post.id" class="px-4 pb-4 border-t border-gray-50 pt-4 bg-gray-50/50">
                <h4 class="font-bold text-xs uppercase text-gray-400 mb-3 tracking-wider">Comments</h4>
                
                <!-- List -->
                <div v-if="postComments.length > 0" class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                    <div v-for="comment in postComments" :key="comment.id" class="bg-white p-3 rounded-lg border border-gray-100 text-sm shadow-sm">
                        <div class="flex justify-between items-start mb-1">
                            <div class="flex items-center gap-1">
                                <span class="font-bold text-xs text-gray-900">{{ comment.userEmail?.split('@')[0] }}</span>
                                
                                <!-- Badges -->
                                <div 
                                    v-if="commentAuthors[comment.userId]?.tier && commentAuthors[comment.userId]?.tier !== 'Member'" 
                                    :class="[
                                        'px-1.5 py-0.5 rounded flex items-center gap-1',
                                        commentAuthors[comment.userId]?.tier === 'Creator' ? 'bg-black text-white' : 
                                        commentAuthors[comment.userId]?.tier === 'Admin' ? 'bg-gray-600 text-white' : 
                                        'bg-indigo-600 text-white'
                                    ]"
                                    :title="commentAuthors[comment.userId]?.tier"
                                >
                                    <Star v-if="commentAuthors[comment.userId]?.tier === 'Creator'" class="w-2 h-2 text-white fill-white" />
                                    <Zap v-else class="w-2 h-2 text-white fill-white" />
                                    <span class="text-[8px] font-bold uppercase tracking-widest">{{ commentAuthors[comment.userId]?.tier }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                                <button 
                                    v-if="role === 'creator' || role === 'admin' || comment.userId === user?.uid"
                                    @click="deleteComment(post.id, comment.id)"
                                    class="text-gray-300 hover:text-red-500 transition"
                                    title="Delete Comment"
                                >
                                    <Trash2 class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <p class="text-gray-600">{{ comment.text }}</p>
                    </div>
                </div>
                <p v-else class="text-sm text-gray-400 italic mb-4 text-center py-4">No comments yet. Start the conversation!</p>

                <!-- Input -->
                <form @submit.prevent="submitComment(post.id)" class="gap-2">
                    <div class="flex gap-2">
                         <input 
                            v-model="newComment" 
                            type="text" 
                            class="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-black focus:ring-0 outline-none transition"
                            placeholder="Write a comment..."
                            required
                        >
                        <button 
                            type="submit" 
                            :disabled="commenting"
                            class="bg-black text-white rounded-lg px-4 py-2 text-sm font-bold hover:opacity-80 transition disabled:opacity-50"
                        >
                            <Send class="w-4 h-4" />
                        </button>
                    </div>
                    <!-- Char Count -->
                    <div class="mt-1 text-[10px] text-right" :class="newComment.length > (isSubscriber ? 500 : 140) ? 'text-red-500 font-bold' : 'text-gray-400'">
                        {{ newComment.length }} / {{ isSubscriber ? 500 : 140 }}
                    </div>
                </form>
            </div>
        </article>

        <!-- Infinite Scroll Sentinel -->
        <div ref="loadMoreTrigger" class="py-10 text-center">
            <div v-if="loadingMore" class="flex justify-center items-center gap-2 text-gray-400 animate-pulse">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span v-else-if="!hasMore" class="text-xs text-gray-300 uppercase tracking-widest font-bold">End of Feed</span>
            <span v-else class="text-xs text-gray-300 uppercase tracking-widest font-bold opacity-50">Scroll for more</span>
        </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-6 pb-6 pt-3 md:pb-3 flex justify-around items-center z-50">
        <NuxtLink to="/" class="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition group">
            <LayoutGrid class="w-6 h-6 group-hover:scale-110 transition" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Hub</span>
        </NuxtLink>

        <button class="flex flex-col items-center gap-1 text-black transition group">
            <div class="bg-black text-white p-3 rounded-full -mt-10 shadow-xl border-4 border-gray-50 group-hover:scale-105 transition">
                <Zap class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider">The Circle</span>
        </button>

        <NuxtLink to="/media-kit" class="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition group">
            <Star class="w-6 h-6 group-hover:scale-110 transition" />
            <span class="text-[10px] font-bold uppercase tracking-wider">Media Kit</span>
        </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { Lock, FileImage, LayoutGrid, Zap, Star, Trash2, Edit2, Lightbulb, ChevronDown, MessageSquare, Send } from 'lucide-vue-next'

definePageMeta({
    middleware: 'auth'
})

const { user, isSubscriber, role, logout, refreshUser, loading } = useAuth()
const { $db } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// (Posts state moved to bottom with fetch logic)

// Comments Logic
const activeCommentId = ref(null)
const postComments = ref([])
const commentAuthors = ref({}) // Cache for user profiles { userId: { tier, role } }
const newComment = ref('')
const commenting = ref(false)
let commentsUnsubscribe = null

// Batch fetch authors for current comments
const fetchAuthors = async (comments) => {
    const missingIds = comments
        .map(c => c.userId)
        .filter(id => !commentAuthors.value[id]) // Only fetch if not already cached
    
    if (missingIds.length === 0) return

    try {
        const users = await $fetch('/api/users/public', {
            method: 'POST',
            body: { userIds: missingIds }
        })
        
        users.forEach(u => {
            commentAuthors.value[u.userId] = u
        })
    } catch (e) {
        console.error('Error fetching authors:', e)
    }
}

const toggleComments = (postId) => {
    if (activeCommentId.value === postId) {
        // Close
        activeCommentId.value = null
        if (commentsUnsubscribe) commentsUnsubscribe()
        postComments.value = []
    } else {
        // Open
        activeCommentId.value = postId
        if (commentsUnsubscribe) commentsUnsubscribe()
        
        // Subscribe to comments
        const q = query(
            collection($db, `posts/${postId}/comments`), 
            orderBy('createdAt', 'asc')
        )
        commentsUnsubscribe = onSnapshot(q, (snapshot) => {
            const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            postComments.value = newDocs
            // Trigger fetch for any new authors
            fetchAuthors(newDocs)
        })
    }
}

const submitComment = async (postId) => {
    const text = newComment.value.trim()
    if (!text) return

    // Limit Logic
    const limit = isSubscriber.value ? 500 : 140
    if (text.length > limit) {
        alert(`Comment too long! Upgrade to Subscribe for more space (${text.length}/${limit}).`)
        return
    }

    commenting.value = true
    try {
        await addDoc(collection($db, `posts/${postId}/comments`), {
            text: text,
            userId: user.value.uid,
            userEmail: user.value.email,
            createdAt: serverTimestamp()
        })
        newComment.value = ''
    } catch (e) {
        console.error(e)
        alert('Error posting comment.')
    } finally {
        commenting.value = false
    }
}

const deleteComment = async (postId, commentId) => {
    if (!confirm('Delete comment?')) return
    try {
        await deleteDoc(doc($db, `posts/${postId}/comments`, commentId))
        // Remove locally
        // note: onSnapshot handles updates, but we can optimistically remove if snap is slow
        // Actually, since we use onSnapshot, it will update automatically!
    } catch (e) {
        console.error('Error deleting comment:', e)
        alert('Failed to delete comment.')
    }
}

// Suggestions Logic
const showSuggestionForm = ref(false)
const suggestionType = ref('music')
const suggestionText = ref('')
const uploading = ref(false)

const submitSuggestion = async () => {
    if (!suggestionText.value.trim()) return
    uploading.value = true
    try {
        await addDoc(collection($db, 'suggestions'), {
            type: suggestionType.value,
            content: suggestionText.value,
            userId: user.value.uid,
            userEmail: user.value.email,
            createdAt: serverTimestamp()
        })
        alert('Suggestion sent! Thank you.')
        suggestionText.value = ''
        showSuggestionForm.value = false
    } catch (e) {
        console.error('Error sending suggestion:', e)
        alert('Failed to send: ' + e.message)
    } finally {
        uploading.value = false
    }
}

// Check for payment success
// Check for payment success
if (route.query.payment_success) {
    onMounted(async () => {
        // Wait for Auth to initialize
        if (loading.value) {
            await new Promise(resolve => {
                const unwatch = watch(loading, (isLoading) => {
                    if (!isLoading) {
                        unwatch()
                        resolve(true)
                    }
                })
            })
        }

        if (!user.value) {
            console.error('No user found after auth init')
            return
        }

        const sessionId = route.query.session_id
        
        if (sessionId) {
            try {
                // Call server to verify and update DB immediately
                await $fetch('/api/stripe/verify', {
                    method: 'POST',
                    body: { 
                        sessionId, 
                        userId: user.value.uid 
                    }
                })
            } catch (e) {
                console.error('Manual verification failed', e)
            }
        }

        await refreshUser()
        
        if (isSubscriber.value) {
            router.push('/feed') // clear query param
        }
    })
}

// Subscribe Logic
const handleSubscribe = async () => {
    try {
        const { url } = await $fetch('/api/stripe/checkout', {
            method: 'POST',
            body: {
                userId: user.value.uid,
                priceId: useRuntimeConfig().public.stripePriceId
            }
        })
        if (url) window.location.href = url
    } catch (e) {
        console.error(e)
        alert('Failed to start checkout via API. Check console.')
    }
}

// Feed Logic (Optimized)
const {
    posts, loading: loadingPosts, loadingMore, hasMore, batchSize,
    initFetch, loadMore, removePost
} = useFeed($db)

// Load feed immediately & Setup Infinite Scroll
const loadMoreTrigger = ref(null)
let observer = null

onMounted(() => {
    initFetch()
    
    // Setup Observer
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loadingPosts.value && !loadingMore.value) {
            loadMore()
        }
    }, { threshold: 0.1 })

    if (loadMoreTrigger.value) {
        observer.observe(loadMoreTrigger.value)
    }
})

watch(loadMoreTrigger, (el) => {
    if (el && observer) observer.observe(el)
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})

const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return
    try {
        await deleteDoc(doc($db, 'posts', postId))
        removePost(postId)
    } catch (e) {
        console.error('Error deleting post:', e)
        alert('Failed to delete post: ' + e.message)
    }
}

const formatDate = (timestamp) => {
    if (!timestamp) return ''
    // Handle Firestore Timestamp or Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const getEmbedUrl = (url) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch')) {
        return url.replace('watch?v=', 'embed/')
    } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]
        return `https://www.youtube.com/embed/${id}`
    }
    return url
}
</script>
