import { ref, watch } from 'vue'
import {
    collection, query, orderBy, getDocs, limit, startAfter,
    type DocumentData, type QueryDocumentSnapshot, type Firestore
} from 'firebase/firestore'

export const useFeed = (db: Firestore) => {
    const posts = ref<DocumentData[]>([])
    const loading = ref(false)
    const loadingMore = ref(false)
    const hasMore = ref(true)
    const batchSize = ref(10)
    const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null)
    const error = ref<string | null>(null)

    const fetchPosts = async (isLoadMore = false) => {
        // Prevent concurrent fetches or fetching when no more data
        if (loading.value || (isLoadMore && loadingMore.value)) return
        if (isLoadMore && !hasMore.value) return

        error.value = null
        if (isLoadMore) {
            loadingMore.value = true
        } else {
            loading.value = true
        }

        try {
            const constraints: any[] = [
                orderBy('createdAt', 'desc'),
                limit(batchSize.value)
            ]

            if (isLoadMore && lastVisible.value) {
                constraints.push(startAfter(lastVisible.value))
            }

            const q = query(collection(db, 'posts'), ...constraints)
            const snapshot = await getDocs(q)

            if (!snapshot.empty) {
                lastVisible.value = snapshot.docs[snapshot.docs.length - 1]
                const newPosts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                if (isLoadMore) {
                    posts.value.push(...newPosts)
                } else {
                    posts.value = newPosts
                }

                // If we got fewer docs than requested, we've reached the end
                if (snapshot.docs.length < batchSize.value) {
                    hasMore.value = false
                } else {
                    hasMore.value = true
                }
            } else {
                if (!isLoadMore) {
                    posts.value = []
                }
                hasMore.value = false
            }

        } catch (e: any) {
            console.error("Error fetching posts:", e)
            error.value = e.message
        } finally {
            loading.value = false
            loadingMore.value = false
        }
    }

    const loadMore = () => fetchPosts(true)

    const refresh = () => {
        lastVisible.value = null
        hasMore.value = true
        posts.value = [] // Optional: clear posts immediately on refresh? Or keep until new ones load? Keeping might be better UX, but simple reset is safer.
        return fetchPosts(false)
    }

    // Reset when batch size changes
    watch(batchSize, () => {
        refresh()
    })

    const removePost = (postId: string) => {
        posts.value = posts.value.filter(p => p.id !== postId)
    }

    return {
        posts,
        loading,
        loadingMore,
        hasMore,
        batchSize,
        error,
        initFetch: () => fetchPosts(false),
        loadMore,
        refresh,
        removePost
    }
}
