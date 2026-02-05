import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock h3 module (used by auth.ts)
const mockGetRequestHeader = vi.fn()
vi.mock('h3', () => ({
    getRequestHeader: mockGetRequestHeader,
    createError: (opts: any) => opts
}))

// Mock nodemailer
vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({
            sendMail: vi.fn().mockResolvedValue({ messageId: '123' })
        })
    }
}))

describe('Email Security', () => {
    let sendHandler: any
    let testHandler: any
    let authUtils: any

    // Mocks
    const mockReadBody = vi.fn()
    const mockGetQuery = vi.fn()
    const mockUseRuntimeConfig = vi.fn(() => ({
        adminSecret: 'secret123',
        emailjs: {},
        smtpHost: 'smtp.example.com',
        smtpUser: 'user'
    }))
    const mockFetch = vi.fn()

    beforeEach(async () => {
        vi.resetModules()
        mockGetRequestHeader.mockReset()
        mockReadBody.mockReset()
        mockGetQuery.mockReset()
        mockFetch.mockReset()

        // Stub globals (used by Nuxt handlers)
        vi.stubGlobal('defineEventHandler', (handler: any) => handler)
        vi.stubGlobal('readBody', mockReadBody)
        vi.stubGlobal('getQuery', mockGetQuery)
        vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
        vi.stubGlobal('$fetch', mockFetch)
        vi.stubGlobal('createError', (err: any) => err)

        // Import auth utils
        authUtils = await import('../utils/auth')

        // Stub global requireAdmin with the REAL implementation
        vi.stubGlobal('requireAdmin', authUtils.requireAdmin)

        // Import handlers
        sendHandler = (await import('../api/email/send.post')).default
        testHandler = (await import('../api/email/test.get')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('send.post should REJECT unauthenticated requests', async () => {
        mockGetRequestHeader.mockReturnValue(undefined) // No token

        // requireAdmin -> getUserFromEvent -> no token -> throw 401
        await expect(sendHandler({})).rejects.toHaveProperty('statusCode', 401)
    })

    it('send.post should ALLOW admin secret', async () => {
        mockGetRequestHeader.mockReturnValue('Bearer secret123')
        mockReadBody.mockResolvedValue({
            to: 'test@example.com',
            subject: 'Test',
            text: 'Hello World'
        })

        const result = await sendHandler({})
        expect(result).toHaveProperty('success', true)
    })

    it('test.get should REJECT unauthenticated requests', async () => {
        mockGetRequestHeader.mockReturnValue(undefined)
        mockGetQuery.mockReturnValue({ to: 'test@example.com' })

        await expect(testHandler({})).rejects.toHaveProperty('statusCode', 401)
    })

    it('test.get should ALLOW admin secret and inject header', async () => {
        mockGetRequestHeader.mockReturnValue('Bearer secret123')
        mockGetQuery.mockReturnValue({ to: 'test@example.com' })
        mockFetch.mockResolvedValue({ provider: 'test' })

        await testHandler({})

        expect(mockFetch).toHaveBeenCalledWith('/api/email/send', expect.objectContaining({
            headers: expect.objectContaining({
                Authorization: 'Bearer secret123'
            })
        }))
    })
})
