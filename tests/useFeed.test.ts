import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFeed } from '../composables/useFeed'

// Mock Firestore
const mockDocs = Array.from({ length: 25 }, (_, i) => ({
    id: `doc-${i}`,
    data: () => ({ createdAt: i, caption: `Post ${i}` })
}))

const mockGetDocs = vi.fn()

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn((n) => ({ type: 'limit', value: n })),
    startAfter: vi.fn((doc) => ({ type: 'startAfter', doc })),
    getDocs: (q: any) => mockGetDocs(q),
}))

describe('useFeed', () => {
    let dbMock = {}

    beforeEach(() => {
        vi.clearAllMocks()
        // Default mock implementation
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: mockDocs.slice(0, 10),
            size: 10
        })
    })

    it('initializes with default state', () => {
        const { posts, loading, hasMore } = useFeed(dbMock as any)
        expect(posts.value).toEqual([])
        expect(loading.value).toBe(false)
        expect(hasMore.value).toBe(true)
    })

    it('fetches posts on initFetch', async () => {
        const { initFetch, posts, loading } = useFeed(dbMock as any)

        const promise = initFetch()
        expect(loading.value).toBe(true)

        await promise

        expect(loading.value).toBe(false)
        expect(posts.value).toHaveLength(10)
        expect(posts.value[0].id).toBe('doc-0')
    })

    it('loads more posts', async () => {
        const { initFetch, loadMore, posts } = useFeed(dbMock as any)

        // First load (0-10)
        mockGetDocs.mockResolvedValueOnce({
            empty: false,
            docs: mockDocs.slice(0, 10),
            size: 10
        })
        await initFetch()

        // Second load (10-20)
        mockGetDocs.mockResolvedValueOnce({
            empty: false,
            docs: mockDocs.slice(10, 20),
            size: 10
        })

        await loadMore()

        expect(posts.value).toHaveLength(20)
        expect(posts.value[10].id).toBe('doc-10')
    })

    it('sets hasMore to false when fewer docs returned', async () => {
        const { initFetch, hasMore } = useFeed(dbMock as any)

        // Return 5 docs (less than default 10)
        mockGetDocs.mockResolvedValueOnce({
            empty: false,
            docs: mockDocs.slice(0, 5),
            size: 5
        })

        await initFetch()
        expect(hasMore.value).toBe(false)
    })

    it('resets when batchSize changes', async () => {
        const { initFetch, posts, batchSize } = useFeed(dbMock as any)

        await initFetch() // 10 docs
        expect(posts.value).toHaveLength(10)

        // Setup mock for next call (limit 5)
        mockGetDocs.mockResolvedValueOnce({
            empty: false,
            docs: mockDocs.slice(0, 5),
            size: 5
        })

        // Change batch size
        batchSize.value = 5

        // Wait for watcher (microtask)
        await new Promise(resolve => setTimeout(resolve, 10))

        expect(posts.value).toHaveLength(5)
    })
})
