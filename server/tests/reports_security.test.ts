import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockReadBody = vi.fn()
const mockCreateError = vi.fn((opts) => {
    const err = new Error(opts.message || 'Mock Error')
    // @ts-ignore
    err.statusCode = opts.statusCode || 500
    return err
})
const mockDefineEventHandler = (handler: any) => handler
const mockGetUserFromEvent = vi.fn()
const mockGetRequestHeader = vi.fn()

const mockDb = {
    collection: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ docs: [] }), // Empty stats
        where: vi.fn().mockReturnThis()
    })),
}
const mockUseFirebaseAdmin = vi.fn(() => ({ db: mockDb }))
const mockUseRuntimeConfig = vi.fn(() => ({
    adminSecret: 'super_secret',
    reportEmail: 'test@example.com',
    emailjs: {}
}))
const mockFetch = vi.fn().mockResolvedValue({ success: true })

vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
vi.stubGlobal('getRequestHeader', mockGetRequestHeader)
vi.stubGlobal('$fetch', mockFetch)

vi.mock('../utils/auth', () => ({
    getUserFromEvent: mockGetUserFromEvent
}))

describe('Daily Report Security', () => {
    let dailyReportHandler: any;
    let dailyGetHandler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
        vi.stubGlobal('readBody', mockReadBody)
        vi.stubGlobal('createError', mockCreateError)
        vi.stubGlobal('useFirebaseAdmin', mockUseFirebaseAdmin)
        vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
        vi.stubGlobal('getRequestHeader', mockGetRequestHeader)
        vi.stubGlobal('$fetch', mockFetch)

        // Reload modules
        dailyReportHandler = (await import('../api/reports/daily.post')).default
        dailyGetHandler = (await import('../api/reports/daily.get')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('POST Endpoint', () => {
        it('should REJECT unauthenticated requests (no secret, no token)', async () => {
            mockGetRequestHeader.mockReturnValue(undefined) // No header
            mockGetUserFromEvent.mockRejectedValue({ statusCode: 401 })

            await expect(dailyReportHandler({})).rejects.toEqual(expect.objectContaining({
                statusCode: 401
            }))
        })

        it('should ALLOW requests with correct Admin Secret', async () => {
            mockGetRequestHeader.mockReturnValue('Bearer super_secret')
            // getUserFromEvent shouldn't be called or fail

            await expect(dailyReportHandler({})).resolves.toHaveProperty('success', true)
        })

        it('should ALLOW requests from Admin User', async () => {
            mockGetRequestHeader.mockReturnValue('Bearer user_token')
            mockGetUserFromEvent.mockResolvedValue({ role: 'admin' })

            await expect(dailyReportHandler({})).resolves.toHaveProperty('success', true)
        })
    })

    describe('GET Endpoint', () => {
        it('should REJECT unauthenticated GET requests', async () => {
             mockGetUserFromEvent.mockRejectedValue({ statusCode: 401 })
             await expect(dailyGetHandler({})).rejects.toEqual(expect.objectContaining({ statusCode: 401 }))
        })

        it('should ALLOW authenticated Admin GET requests and call POST with secret', async () => {
            mockGetUserFromEvent.mockResolvedValue({ role: 'admin' })

            await expect(dailyGetHandler({})).resolves.toHaveProperty('triggered', true)

            expect(mockFetch).toHaveBeenCalledWith('/api/reports/daily', expect.objectContaining({
                method: 'POST',
                headers: { Authorization: 'Bearer super_secret' }
            }))
        })
    })
})
