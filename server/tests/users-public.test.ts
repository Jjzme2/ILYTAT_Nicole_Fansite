import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock globals
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((err) => err)
const mockDefineEventHandler = (handler: any) => handler
const mockUseRuntimeConfig = vi.fn(() => ({
    public: {}
}))

vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

// Use vi.hoisted for variables used in vi.mock factory
const { mockDb, mockGetAll } = vi.hoisted(() => {
    const mockGetAll = vi.fn()
    const mockCollection = {
        doc: vi.fn((id) => ({ id, path: `users/${id}` })) // Simplified doc ref
    }
    const mockDb = {
        collection: vi.fn(() => mockCollection),
        getAll: mockGetAll
    }
    return { mockDb, mockGetAll }
})

// Mock Firebase Admin
const mockUseFirebaseAdmin = () => ({ db: mockDb })
vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)

describe('Public Users Endpoint', () => {
    let handler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        // Reset specific mocks if needed
        mockGetAll.mockReset()
        mockDb.collection.mockClear()

        // Dynamic import to ensure fresh execution if possible,
        // though top-level variables (cache) persist across tests in same file
        // unless we reset them.
        // Since 'cache' is a top-level variable in the module, we cannot easily reset it
        // without reloading the module or exposing a reset method.
        // For this test, we might just assume cache persists and test accordingly,
        // or we use unique IDs for each test case.

        const module = await import('../api/users/public.post')
        handler = module.default
    })

    it('should return empty array if no userIds provided', async () => {
        mockReadBody.mockResolvedValue({})
        const result = await handler({})
        expect(result).toEqual([])
    })

    it('should fetch users from DB on first call', async () => {
        const userIds = ['user1', 'user2']
        mockReadBody.mockResolvedValue({ userIds })

        // Mock DB response
        mockGetAll.mockResolvedValue([
            { exists: true, id: 'user1', data: () => ({ role: 'user', isSubscriber: true }) },
            { exists: true, id: 'user2', data: () => ({ role: 'creator' }) }
        ])

        const result = await handler({})

        expect(mockGetAll).toHaveBeenCalledTimes(1)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ userId: 'user1', tier: 'Subscriber', isSubscriber: true, role: 'user' })
        expect(result[1]).toEqual({ userId: 'user2', tier: 'Creator', isSubscriber: false, role: 'creator' })
    })

    it('should use cache on second call', async () => {
        const userIds = ['user3'] // Unique ID to avoid cache pollution from previous test if module isn't reloaded
        mockReadBody.mockResolvedValue({ userIds })

        // Mock DB response
        mockGetAll.mockResolvedValue([
            { exists: true, id: 'user3', data: () => ({ role: 'user' }) }
        ])

        // First call
        await handler({})
        expect(mockGetAll).toHaveBeenCalledTimes(1)

        // Second call
        mockGetAll.mockClear() // Clear previous calls
        const result2 = await handler({})

        expect(mockGetAll).not.toHaveBeenCalled() // Should not hit DB
        expect(result2).toHaveLength(1)
        expect(result2[0].userId).toBe('user3')
    })

    it('should handle non-existent users (cache nulls)', async () => {
        const userIds = ['user4']
        mockReadBody.mockResolvedValue({ userIds })

        // Mock DB response: doesn't exist
        mockGetAll.mockResolvedValue([
            { exists: false, id: 'user4' }
        ])

        // First call
        const result1 = await handler({})
        expect(result1).toEqual([]) // Should filter out nulls

        // Second call
        mockGetAll.mockClear()
        const result2 = await handler({})

        expect(mockGetAll).not.toHaveBeenCalled() // Should utilize cache (even for nulls)
        expect(result2).toEqual([])
    })
})
