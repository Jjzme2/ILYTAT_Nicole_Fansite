import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create robust mocks
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((opts) => {
    const err = new Error(opts.message || 'Mock Error')
    // @ts-ignore
    err.statusCode = opts.statusCode || 500
    return err
})
const mockDefineEventHandler = (handler: any) => handler
const mockGetUserFromEvent = vi.fn()

const mockDb = {
    collection: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
            size: 10,
            docs: []
        }),
        add: vi.fn().mockResolvedValue(true)
    })),
    batch: vi.fn(() => ({
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(true)
    }))
}
const mockUseFirebaseAdmin = vi.fn(() => ({ db: mockDb }))

// Apply mocks to global scope BEFORE importing the module
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)

// Also mock the auth utility
vi.mock('../utils/auth', () => ({
    getUserFromEvent: mockGetUserFromEvent
}))

describe('Reset All Quotas Security', () => {
    let resetAllHandler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        // Re-stub globals to ensure they persist
        vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
        vi.stubGlobal('readBody', mockReadBody)
        vi.stubGlobal('createError', mockCreateError)
        vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)

        // Import the handler dynamically
        resetAllHandler = (await import('../api/messages/reset-all-quotas.post')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should REJECT unauthenticated requests', async () => {
        mockGetUserFromEvent.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })

        await expect(resetAllHandler({})).rejects.toEqual(expect.objectContaining({
            statusCode: 401
        }))
    })

    it('should REJECT unauthorized users (non-admin)', async () => {
        mockGetUserFromEvent.mockResolvedValue({ uid: '123', role: 'user' }) // Regular user is not enough for global reset

        await expect(resetAllHandler({})).rejects.toThrow()
    })

    it('should ALLOW admin users', async () => {
        mockGetUserFromEvent.mockResolvedValue({ uid: 'admin-id', role: 'admin' })

        await expect(resetAllHandler({})).resolves.toMatchObject({
            success: true
        })
    })
})
