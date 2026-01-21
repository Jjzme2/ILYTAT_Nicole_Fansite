import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Message Quota Security', () => {
    let resetAllHandler: any
    let resetQuotaHandler: any

    // Mocks
    const mockReadBody = vi.fn()
    const mockCreateError = vi.fn((err) => err)
    const mockDefineEventHandler = (handler: any) => handler
    const mockUseRuntimeConfig = vi.fn(() => ({ public: {} }))
    const mockGetUserFromEvent = vi.fn()

    // Firebase Mock
    const mockBatch = {
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(true)
    }

    const mockSnapshot = {
        exists: true,
        data: () => ({ email: 'test@example.com', messagingQuota: { dailyCap: 3 } })
    }

    const mockDoc = {
        exists: true,
        data: () => ({ email: 'test@example.com', messagingQuota: { dailyCap: 3 } }),
        ref: {},
        update: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue(mockSnapshot)
    }

    const mockCollection = {
        get: vi.fn().mockResolvedValue({
            size: 1,
            docs: [{
                data: () => ({ messagingQuota: { dailyCap: 3 } }),
                ref: {}
            }]
        }),
        doc: vi.fn(() => mockDoc),
        add: vi.fn().mockResolvedValue(true)
    }

    const mockDb = {
        collection: vi.fn(() => mockCollection),
        batch: vi.fn(() => mockBatch)
    }

    beforeEach(async () => {
        // Ensure modules are re-evaluated with new globals
        vi.resetModules()

        // Stub Globals
        vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
        vi.stubGlobal('readBody', mockReadBody)
        vi.stubGlobal('createError', mockCreateError)
        vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
        vi.stubGlobal('getUserFromEvent', mockGetUserFromEvent)
        vi.stubGlobal('useFirebaseAdmin', () => ({ db: mockDb }))

        vi.clearAllMocks()

        // Import handlers
        resetAllHandler = (await import('../api/messages/reset-all-quotas.post')).default
        resetQuotaHandler = (await import('../api/messages/reset-quota.post')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    // --- Reset All Quotas Tests ---

    it('reset-all-quotas should REJECT when not authenticated', async () => {
        mockGetUserFromEvent.mockRejectedValue({ statusCode: 401 })

        await expect(resetAllHandler({})).rejects.toHaveProperty('statusCode', 401)
        expect(mockDb.collection).not.toHaveBeenCalled()
    })

    it('reset-all-quotas should REJECT non-admin user', async () => {
        mockGetUserFromEvent.mockResolvedValue({ role: 'user' })

        await expect(resetAllHandler({})).rejects.toHaveProperty('statusCode', 403)
        expect(mockDb.collection).not.toHaveBeenCalled()
    })

    it('reset-all-quotas should ALLOW admin', async () => {
        mockGetUserFromEvent.mockResolvedValue({ role: 'admin' })

        const result = await resetAllHandler({})

        expect(mockDb.collection).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
    })

    it('reset-all-quotas should ALLOW creator', async () => {
        mockGetUserFromEvent.mockResolvedValue({ role: 'creator' })

        const result = await resetAllHandler({})

        expect(mockDb.collection).toHaveBeenCalledWith('users')
        expect(result.success).toBe(true)
    })

    // --- Reset Single Quota Tests ---

    it('reset-quota should REJECT when not authenticated', async () => {
        mockGetUserFromEvent.mockRejectedValue({ statusCode: 401 })
        mockReadBody.mockResolvedValue({ userId: 'user123' })

        await expect(resetQuotaHandler({})).rejects.toHaveProperty('statusCode', 401)
        expect(mockDoc.update).not.toHaveBeenCalled()
    })

    it('reset-quota should REJECT non-admin user', async () => {
        mockGetUserFromEvent.mockResolvedValue({ role: 'user' })
        mockReadBody.mockResolvedValue({ userId: 'user123' })

        await expect(resetQuotaHandler({})).rejects.toHaveProperty('statusCode', 403)
        expect(mockDoc.update).not.toHaveBeenCalled()
    })

    it('reset-quota should ALLOW admin', async () => {
        mockGetUserFromEvent.mockResolvedValue({ role: 'admin' })
        mockReadBody.mockResolvedValue({ userId: 'user123' })

        const result = await resetQuotaHandler({})

        expect(mockDoc.update).toHaveBeenCalled()
        expect(result.success).toBe(true)
    })
})
