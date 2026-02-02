import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoist mocks so they are available in vi.mock factory
const mocks = vi.hoisted(() => {
    return {
        getUserFromEvent: vi.fn(),
        getRequestHeader: vi.fn(),
        readBody: vi.fn(),
        createError: vi.fn((err: any) => err),
        useRuntimeConfig: vi.fn(() => ({
            adminSecret: 'secret123',
            reportEmail: 'test@example.com',
            emailjs: {}
        })),
        fetch: vi.fn(),
        db: {
            collection: vi.fn(() => ({
                get: vi.fn().mockResolvedValue({ docs: [], size: 0, map: () => [] }),
                where: vi.fn(() => ({
                    get: vi.fn().mockResolvedValue({ docs: [], size: 0 })
                })),
                doc: vi.fn(() => ({ get: vi.fn() }))
            })),
            batch: vi.fn(() => ({
                update: vi.fn(),
                commit: vi.fn()
            }))
        }
    }
})

describe('Daily Report Security', () => {
    let handler: any
    const mockDefineEventHandler = (h: any) => h

    beforeEach(async () => {
        vi.resetModules()

        vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
        vi.stubGlobal('readBody', mocks.readBody)
        vi.stubGlobal('createError', mocks.createError)
        vi.stubGlobal('useRuntimeConfig', mocks.useRuntimeConfig)
        vi.stubGlobal('getUserFromEvent', mocks.getUserFromEvent)
        vi.stubGlobal('getRequestHeader', mocks.getRequestHeader)
        vi.stubGlobal('$fetch', mocks.fetch)
        vi.stubGlobal('useFirebaseAdmin', () => ({ db: mocks.db }))

        // Mock the auth import
        vi.mock('../utils/auth', () => ({
            requireAdmin: vi.fn(async (event) => {
                // Mimic the logic we intend to implement
                const header = mocks.getRequestHeader(event, 'Authorization')
                if (header === 'Bearer secret123') return { role: 'admin' }

                // Check user
                try {
                    const user = await mocks.getUserFromEvent(event)
                    if (user.role === 'admin' || user.role === 'creator') return user
                } catch (e) {
                    throw e
                }

                throw { statusCode: 403, message: 'Forbidden' }
            }),
            getUserFromEvent: mocks.getUserFromEvent
        }))

        // Import handler
        handler = (await import('../api/reports/daily.post')).default
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('should REJECT when not authenticated (No Secret, No User)', async () => {
        mocks.getRequestHeader.mockReturnValue(undefined)
        mocks.getUserFromEvent.mockRejectedValue({ statusCode: 401 })

        // It might be 401 or 403 depending on where it fails
        await expect(handler({})).rejects.toHaveProperty('statusCode')
    })

    it('should ALLOW when providing Admin Secret', async () => {
        // This test expects success
        mocks.getRequestHeader.mockReturnValue('Bearer secret123')

        const result = await handler({})
        expect(result.success).toBe(true)
    })

    it('should ALLOW when authenticated as Admin User', async () => {
        mocks.getRequestHeader.mockReturnValue('Bearer userToken')
        mocks.getUserFromEvent.mockResolvedValue({ role: 'admin' })

        const result = await handler({})
        expect(result.success).toBe(true)
    })
})
