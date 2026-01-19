import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock globals
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((err) => err)
const mockDefineEventHandler = (handler: any) => handler
const mockUseRuntimeConfig = vi.fn(() => ({}))

// Use vi.hoisted for variables used in vi.mock factory
const { mockDb, mockGetAll } = vi.hoisted(() => {
    const mockGetAll = vi.fn()
    const mockDb = {
        collection: vi.fn(() => ({
            doc: vi.fn((id) => ({ id }))
        })),
        getAll: mockGetAll
    }
    return { mockDb, mockGetAll }
})

const mockUseFirebaseAdmin = vi.fn(() => ({ db: mockDb }))

vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)

vi.mock('../utils/firebaseAdmin', () => ({ useFirebaseAdmin: () => ({ db: mockDb }) }))

describe('Public User Profile Endpoint', () => {
    let handler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        // Dynamic import to get the handler
        const module = await import('../api/users/public.post')
        handler = module.default
    })

    it('should fetch users from DB if not in cache', async () => {
        mockReadBody.mockResolvedValue({ userIds: ['user1'] })

        mockGetAll.mockResolvedValue([
            {
                exists: true,
                id: 'user1',
                data: () => ({ isSubscriber: true, role: 'user' })
            }
        ])

        const result = await handler({})

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
            userId: 'user1',
            tier: 'Subscriber',
            isSubscriber: true,
            role: 'user'
        })
        expect(mockGetAll).toHaveBeenCalledTimes(1)
    })

    it('should return cached users without DB hit', async () => {
        // Assuming 'user1' is already in cache from previous test (if module state persists)
        // OR we use a new user

        // Let's use 'user2'
        mockReadBody.mockResolvedValue({ userIds: ['user2'] })

        // First call: DB hit
        mockGetAll.mockResolvedValueOnce([
            {
                exists: true,
                id: 'user2',
                data: () => ({ isSubscriber: false, role: 'user' })
            }
        ])

        await handler({}) // Populate cache
        expect(mockGetAll).toHaveBeenCalledTimes(1)

        // Second call: Cache hit
        mockGetAll.mockClear()
        const result = await handler({})

        expect(result).toHaveLength(1)
        expect(result[0].userId).toBe('user2')
        expect(mockGetAll).not.toHaveBeenCalled()
    })

    it('should ignore non-existent users but cache the miss', async () => {
        mockReadBody.mockResolvedValue({ userIds: ['missing1'] })

        mockGetAll.mockResolvedValue([
            {
                exists: false,
                id: 'missing1'
            }
        ])

        // First call
        const result = await handler({})
        expect(result).toHaveLength(0)
        expect(mockGetAll).toHaveBeenCalledTimes(1)

        // Second call
        mockGetAll.mockClear()
        const result2 = await handler({})
        expect(result2).toHaveLength(0)
        expect(mockGetAll).not.toHaveBeenCalled() // Cached miss
    })
})
