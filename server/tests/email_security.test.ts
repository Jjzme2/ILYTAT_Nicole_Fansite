import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

const mocks = vi.hoisted(() => ({
    getUserFromEvent: vi.fn(),
    sendEmail: vi.fn(),
    readBody: vi.fn(),
    getQuery: vi.fn(),
    getRequestHeader: vi.fn(),
    useRuntimeConfig: vi.fn()
}))

// Mock Modules
vi.mock('../utils/auth', () => ({
    getUserFromEvent: mocks.getUserFromEvent
}))
vi.mock('../utils/email', () => ({
    sendEmail: mocks.sendEmail
}))

// Global Stubs
vi.stubGlobal('readBody', mocks.readBody)
vi.stubGlobal('getQuery', mocks.getQuery)
vi.stubGlobal('getRequestHeader', mocks.getRequestHeader)
vi.stubGlobal('createError', (err: any) => err)
vi.stubGlobal('useRuntimeConfig', mocks.useRuntimeConfig)

describe('Email Security', () => {
    let sendHandler: any
    let testHandler: any

    beforeAll(async () => {
        vi.stubGlobal('defineEventHandler', (handler: any) => handler)

        sendHandler = (await import('../api/email/send.post')).default
        testHandler = (await import('../api/email/test.get')).default
    })

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.useRuntimeConfig.mockReturnValue({
            adminSecret: 'super-secret',
            emailjs: {},
            smtpHost: 'smtp.example.com',
            smtpUser: 'user'
        })
    })

    describe('POST /api/email/send', () => {
        it('should REJECT unauthenticated requests (getUserFromEvent fails)', async () => {
            mocks.getUserFromEvent.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })
            await expect(sendHandler({})).rejects.toHaveProperty('statusCode', 401)
        })

        it('should REJECT non-admin/non-developer users', async () => {
            mocks.getUserFromEvent.mockResolvedValue({ role: 'user' })
            await expect(sendHandler({})).rejects.toHaveProperty('statusCode', 403)
        })

        it('should ALLOW admin users', async () => {
            mocks.getUserFromEvent.mockResolvedValue({ role: 'admin' })
            mocks.readBody.mockResolvedValue({ to: 'test@example.com' })
            mocks.sendEmail.mockResolvedValue({ success: true })

            const result = await sendHandler({})
            expect(result).toEqual({ success: true })
            expect(mocks.sendEmail).toHaveBeenCalled()
        })
    })

    describe('GET /api/email/test', () => {
        it('should ALLOW with correct Admin Secret', async () => {
            mocks.getRequestHeader.mockReturnValue('Bearer super-secret')
            mocks.getQuery.mockReturnValue({ to: 'test@example.com' })
            mocks.sendEmail.mockResolvedValue({ success: true, provider: 'emailjs' })

            const result = await testHandler({})
            expect(result.success).toBe(true)
        })

        it('should ALLOW with Admin User via Firebase (No Secret)', async () => {
            mocks.getRequestHeader.mockReturnValue(undefined) // No secret
            mocks.getUserFromEvent.mockResolvedValue({ role: 'admin' })
            mocks.getQuery.mockReturnValue({ to: 'test@example.com' })
            mocks.sendEmail.mockResolvedValue({ success: true, provider: 'emailjs' })

            const result = await testHandler({})
            expect(result.success).toBe(true)
        })

        it('should REJECT with Invalid Secret AND Invalid User', async () => {
            mocks.getRequestHeader.mockReturnValue('Bearer wrong-secret')
            mocks.getUserFromEvent.mockRejectedValue({ statusCode: 401 })

            await expect(testHandler({})).rejects.toHaveProperty('statusCode', 401)
        })

        it('should REJECT with Invalid Secret AND Non-Admin User', async () => {
            mocks.getRequestHeader.mockReturnValue('Bearer wrong-secret')
            mocks.getUserFromEvent.mockResolvedValue({ role: 'user' })

            await expect(testHandler({})).rejects.toHaveProperty('statusCode', 401)
        })
    })
})
