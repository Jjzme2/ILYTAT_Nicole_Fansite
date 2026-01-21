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
        doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({ email: 'test@example.com', messagingQuota: { dailyCap: 3 } })
            }),
            update: vi.fn().mockResolvedValue(true)
        })),
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

describe('Reset Quota Security', () => {
    let resetQuotaHandler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        // Re-stub globals to ensure they persist
        vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
        vi.stubGlobal('readBody', mockReadBody)
        vi.stubGlobal('createError', mockCreateError)
        vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)

        // Import the handler dynamically
        resetQuotaHandler = (await import('../api/messages/reset-quota.post')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should REJECT unauthenticated requests', async () => {
        mockReadBody.mockResolvedValue({ userId: 'some-user-id' })
        // Mock auth to throw
        mockGetUserFromEvent.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })

        await expect(resetQuotaHandler({})).rejects.toEqual(expect.objectContaining({
            statusCode: 401
        }))
    })

    it('should REJECT unauthorized users (non-admin/non-creator)', async () => {
        mockReadBody.mockResolvedValue({ userId: 'some-user-id' })
        // Mock auth to return normal user
        mockGetUserFromEvent.mockResolvedValue({ uid: '123', role: 'user' })

        await expect(resetQuotaHandler({})).rejects.toThrow()
    })

    it('should ALLOW admin users', async () => {
        mockReadBody.mockResolvedValue({ userId: 'some-user-id' })
        // Mock auth to return admin
        mockGetUserFromEvent.mockResolvedValue({ uid: 'admin-id', role: 'admin' })

        await expect(resetQuotaHandler({})).resolves.toMatchObject({
            success: true
        })
    })

    it('should ALLOW creator users', async () => {
        mockReadBody.mockResolvedValue({ userId: 'some-user-id' })
        // Mock auth to return creator
        mockGetUserFromEvent.mockResolvedValue({ uid: 'creator-id', role: 'creator' })

        await expect(resetQuotaHandler({})).resolves.toMatchObject({
            success: true
        })
    })
})
