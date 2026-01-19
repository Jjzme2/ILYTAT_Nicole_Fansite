import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock globals
const mockGetHeader = vi.fn()
const mockCreateError = vi.fn((err) => err)
const mockDefineEventHandler = (handler: any) => handler
const mockUseRuntimeConfig = vi.fn(() => ({
    adminSecret: 'new-secret', // The secret we want to use
    public: {}
}))

// Stub globals
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('getHeader', mockGetHeader)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
// We also need process.dev to be false to test auth
vi.stubGlobal('process', { ...process, dev: false })

// Mock Firebase Admin Global
const mockDb = {
    collection: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ docs: [], size: 0 })
    }))
}
vi.stubGlobal('useFirebaseAdmin', () => ({ db: mockDb }))

// Mock Firebase Admin Module (if imported explicitly)
vi.mock('../utils/firebaseAdmin', () => ({ useFirebaseAdmin: () => ({ db: mockDb }) }))

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: {
        serverTimestamp: vi.fn()
    }
}))

describe('Migration Security Upgrade', () => {
    let runAllHandler: any;
    let usersPostHandler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        // Reset process.env.MIGRATION_SECRET just in case
        delete process.env.MIGRATION_SECRET

        // Import the handlers
        // We use dynamic import to ensure mocks are applied
        runAllHandler = (await import('../api/migrations/run-all.post')).default
        usersPostHandler = (await import('../api/migrations/users.post')).default
    })

    it('run-all.post should accept Bearer token matching adminSecret', async () => {
        mockGetHeader.mockReturnValue('Bearer new-secret')
        // This is expected to FAIL until we fix the code
        await expect(runAllHandler({})).resolves.not.toThrow()
    })

    it('users.post should accept Bearer token matching adminSecret', async () => {
        mockGetHeader.mockReturnValue('Bearer new-secret')
        // This is expected to FAIL until we fix the code
        await expect(usersPostHandler({})).resolves.not.toThrow()
    })

    it('should reject incorrect secret', async () => {
        mockGetHeader.mockReturnValue('Bearer wrong-secret')
        await expect(runAllHandler({})).rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
        await expect(usersPostHandler({})).rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
    })
})
